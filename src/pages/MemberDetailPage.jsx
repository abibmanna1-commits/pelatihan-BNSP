
import { useParams, Link } from 'react-router-dom';

export default function MemberDetailPage({ members }) {
  const { id } = useParams();

  const member = members.find(
    (item) => item.id === Number(id)
  );

  if (!member) {
    return (
      <div className="not-found">
        <h2>Anggota Tidak Ditemukan</h2>
        <Link to="/">Kembali ke Direktori Tim</Link>
      </div>
    );
  }

  return (
    <div className="detail-container">

      <Link to="/" className="back-link">
        ← Kembali ke Direktori Tim
      </Link>

      <div className="profile-card">

        <img
          src={member.avatar}
          alt={member.name}
          className="profile-avatar"
        />

        <h2>{member.name}</h2>

        <p className="profile-role">
          {member.role}
        </p>

        <span className={
          member.status === 'Online'
            ? 'profile-status online'
            : 'profile-status offline'
        }>
          ● {member.status}
        </span>

        <p className="profile-email">
          📧 {member.email}
        </p>

        <p className="profile-bio">
          "{member.bio}"
        </p>

        <div className="profile-stars">
          ⭐ {member.stars} Bintang Apresiasi
        </div>

      </div>
    </div>
  );
}
