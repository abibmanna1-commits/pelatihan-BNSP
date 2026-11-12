import { useEffect, useRef } from 'react';
import './Dragon.css';

// Ported from flash
// credits https://www.deviantart.com/gifhaas/art/Dragon-8681899
// dragon by GifHaas on DeviantArt

const N = 40;
const SVG_FILE = '/dragon.svg';
const xmlns = 'http://www.w3.org/2000/svg';

export default function Dragon() {
  const screenRef = useRef(null);

  useEffect(() => {
    const screen = screenRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const pointer = { x: width / 2, y: height / 2 };
    const radm = Math.min(pointer.x, pointer.y) - 20;
    let frm = Math.random();
    let rad = 0;
    let animId;

    const elems = Array.from({ length: N }, () => ({
      use: null,
      x: width / 2,
      y: 0,
    }));

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      rad = 0;
    };
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('resize', onResize);

    const prepend = (id, i) => {
      const use = document.createElementNS(xmlns, 'use');
      use.setAttribute('href', `${SVG_FILE}#${id}`);
      elems[i].use = use;
      screen.prepend(use);
    };

    for (let i = 1; i < N; i++) {
      if (i === 1) prepend('Cabeza', i);
      else if (i === 8 || i === 14) prepend('Aletas', i);
      else prepend('Espina', i);
    }

    const run = () => {
      animId = requestAnimationFrame(run);
      const k = Math.min(0.6, Math.max(0.1, width / 1500)); // skala naga..
      const head = elems[0];
      const ax = (Math.cos(3 * frm) * rad * width) / height;
      const ay = (Math.sin(4 * frm) * rad * height) / width;
      head.x += (ax + pointer.x - head.x) / 10;
      head.y += (ay + pointer.y - head.y) / 10;

      for (let i = 1; i < N; i++) {
        const e = elems[i];
        const ep = elems[i - 1];
        const a = Math.atan2(e.y - ep.y, e.x - ep.x);
        e.x += (ep.x - e.x + (Math.cos(a) * (100 - i) * k) / 5) / 4;
        e.y += (ep.y - e.y + (Math.sin(a) * (100 - i) * k) / 5) / 4;
        const s = ((162 + 4 * (1 - i)) / 50) * k;
        e.use.setAttribute(
          'transform',
          `translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${
            (180 / Math.PI) * a
          }) scale(${s},${s})`
        );
      }

      if (rad < radm) rad++;
      frm += 0.003;
      if (rad > 60) {
        pointer.x += (width / 2 - pointer.x) * 0.05;
        pointer.y += (height / 2 - pointer.y) * 0.05;
      }
    };
    run();

    // dibersihkan saat komponen dilepas (dan mencegah naga ganda di mode dev)
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      screen.replaceChildren();
    };
  }, []);

  return (
    <div className="dragon-layer">
      <svg>
        <g ref={screenRef} />
      </svg>
    </div>
  );
}