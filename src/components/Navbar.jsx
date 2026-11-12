import { NavLink } from 'react-router-dom';

export default function Navbar({ totalMembers = 0 }) {
  const getLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar-container">
      <div className="navbar-brand">
        <span className="brand-icon">👥</span>
        <span className="brand-title"> Direktori Tim</span>
      </div>

      <div className="navbar-menu">
        <NavLink to="/" end className={getLinkClass}>
          Direktori
        </NavLink>
        <NavLink to="/news" className={getLinkClass}>
          Berita Terkini
        </NavLink>
      </div>

      <span className="badge-count">{totalMembers} anggota</span>
    </nav>
  );
}
