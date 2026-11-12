
import { Link } from 'react-router-dom';

function TeamCard({ id, name, role, avatar, status, stars }) {
  return (
    <div className="team-card">

      <img src={avatar} alt={name} className="card-avatar" />

      <h3>{name}</h3>

      <p>{role}</p>

      <span>{status}</span>

      <p>⭐ {stars} Bintang</p>

      <Link
        to={`/member/${id}`}
        className="detail-button"
      >
        Lihat Detail Profil →
      </Link>

    </div>
  );
}

export default TeamCard;
