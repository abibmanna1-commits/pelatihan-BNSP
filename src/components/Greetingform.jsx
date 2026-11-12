import { useState } from 'react';

function Greetingform() {
  const [nama, setNama] = useState('');

  return (
    <div style={{ margin: '20px 0' }}>
      <input
        type="text"
        placeholder="Ketik nama Anda..."
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        className="input-teks"
      />
      <p>{nama ? `Halo, ${nama}!` : 'Silakan ketik nama Anda di atas.'}</p>
    </div>
  );
}

export default Greetingform;
