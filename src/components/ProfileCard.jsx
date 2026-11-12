import { useState, useEffect, useRef } from 'react';

function ProfileCard() {
  const [isOnline, setOnline] = useState(false);
  const [tampil, setTampil] = useState(false);
  const ref = useRef(null);
  const [nama, setNama] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setTampil(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="layar" ref={ref}>
      <div className={`card-profile ${tampil ? 'tampil' : ''}`}>
        <h3>Arya</h3>
        <span style={{ color: isOnline ? '#16a34a' : '#94a3b8' }}>
          • {isOnline ? 'Sedang aktif' : 'Offline'}
        </span>

        <button type="button" onClick={() => setOnline(!isOnline)}>
          Ganti Status
        </button>

        <div className="bagian">
          <h1>Halo!</h1>
          <input
            type="text"
            placeholder="Ketik profesi Anda..."
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="input-teks"
          />
          <h2>Profesi: {nama || '-'}</h2>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
