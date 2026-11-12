
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>Maaf, halaman yang kamu cari tidak tersedia.</p>

      <Link to="/" className="back-button">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
