import { Link, useLocation } from 'react-router-dom';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="page-card not-found-container">
      <div className="not-found-code">404</div>
      <h2>Ups! Halaman Tidak Ditemukan</h2>
      <p>
        Alamat <b>{pathname}</b> mungkin sudah dipindahkan atau salah ketik.
      </p>
      <Link to="/" className="btn-primary">
        Kembali ke Direktori Tim
      </Link>
    </div>
  );
}
