import { useParams, Link, useNavigate } from 'react-router-dom';

export default function MemberDetailPage({ members = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = members.find((m) => String(m.id) === String(id));

  if (!member) {
    return (
      <div className="page-card not-found-container">
        <h2>Anggota Tidak Ditemukan</h2>
        <p>Data dengan ID #{id} tidak terdaftar di direktori.</p>
        <Link to="/" className="btn-primary">
          Kembali ke Direktori
        </Link>
      </div>
    );
  }

  const isOnline = member.status === 'Online';

  return (
    <div className="page-card profile-detail-container">
      <button
        type="button"
        className="btn-nav-back"
        onClick={() => navigate(-1)}
      >
        ← Kembali
      </button>

      <img
        src={member.avatar || `https://i.pravatar.cc/150?u=${member.id}`}
        alt={member.name}
        className="avatar-large"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://placehold.co/100x100?text=User';
        }}
      />
      <h2>{member.name}</h2>
      <p className="profile-role">{member.role}</p>

      <span className={isOnline ? 'badge-on' : 'badge-off'}>
        {isOnline ? 'Online' : 'Offline'}
      </span>

      {member.email && <p className="profile-email">✉️ {member.email}</p>}
      {member.bio && <p className="profile-bio">"{member.bio}"</p>}

      <span className="profile-stars">⭐ {member.stars ?? 0} bintang apresiasi</span>

      <div style={{ marginTop: '20px' }}>
        <Link to="/" className="btn-primary">
          Kembali ke Direktori
        </Link>
      </div>
    </div>
  );
}
