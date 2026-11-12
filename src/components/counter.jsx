import { useState } from 'react';

function Counter() {
  const [hitung, setHitung] = useState(0);

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Komponen Hitungan: {hitung}</h3>
      <button
        type="button"
        className="btn-utama"
        onClick={() => setHitung(hitung + 1)}
      >
        Tambah Angka
      </button>
    </div>
  );
}

export default Counter;
