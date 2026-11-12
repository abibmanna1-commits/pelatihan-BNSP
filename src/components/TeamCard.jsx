import { Link } from 'react-router-dom';

function TeamCard({ id, name, role, avatar, status, stars, onToggleStatus, onAddStar, bio }) {
  const isOnline = status === 'Online';

  return (
    <div className="team-card">
      <img
        src={avatar || `https://i.pravatar.cc/150?u=${id}`}
        alt={name}
        className="card-avatar"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://placehold.co/100x100?text=User';
        }}
      />

      <div className="card-info">
        <h3 className="card-name">{name}</h3>
        <p className="card-role">{role}</p>
        <p className="card-bio">{bio || 'Belum ada deskripsi anggota.'}</p>

        <div className="card-badges">
          <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
            • {status}
          </span>
          <span className="badge-stars">⭐ {stars ?? 0} Bintang</span>
        </div>

        <div className="card-actions">
          <button type="button" className="btn-star" onClick={() => onAddStar?.(id)}>
            ⭐ Beri Bintang
          </button>
          <button
            type="button"
            className="btn-status-toggle"
            onClick={() => onToggleStatus?.(id)}
          >
            Ubah ke {isOnline ? 'Offline' : 'Online'}
          </button>
        </div>

        <Link to={`/member/${id}`} className="btn-view-profile">
          Lihat profil detail →
        </Link>
      </div>
    </div>
  );
}

export default TeamCard;
