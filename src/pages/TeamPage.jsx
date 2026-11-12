
import { useState } from 'react';
import AddMemberForm from '../components/AddMemberForm';
import TeamCard from '../components/TeamCard';

export default function TeamPage({
  members,
  onAddMember,
  onToggle,
  onGiveStar,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOnline, setFilterOnline] = useState(false);

  const totalMembers = members.length;

  const onlineMembers = members.filter(
    (m) => m.status === 'Online'
  ).length;

  const offlineMembers = totalMembers - onlineMembers;

  const filteredMembers = members.filter((m) => {
    const matchName = m.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchStatus = filterOnline
      ? m.status === 'Online'
      : true;

    return matchName && matchStatus;
  });

  return (
    <div className="directory-container">
      {/* Statistik Anggota */}
      <div className="stats-bar">
        <div className="stat-box">
          <span className="stat-num">{totalMembers}</span>
          <span className="stat-label">Total Members</span>
        </div>

        <div className="stat-box">
          <span className="stat-num online">{onlineMembers}</span>
          <span className="stat-label">Online</span>
        </div>

        <div className="stat-box">
          <span className="stat-num offline">{offlineMembers}</span>
          <span className="stat-label">Offline</span>
        </div>
      </div>

      {/* Form Tambah Anggota */}
      <AddMemberForm onAddMember={onAddMember} />

      {/* Pencarian dan Filter */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Cari nama anggota tim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <button
          onClick={() => setFilterOnline(!filterOnline)}
          className={`filter-btn ${filterOnline ? 'active' : ''}`}
        >
          {filterOnline
            ? '🟢 Tampilkan Semua'
            : '⚪ Hanya Online'}
        </button>
      </div>

      {/* Grid Anggota */}
      <div className="team-grid">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
              onToggle={onToggle}
              onGiveStar={onGiveStar}
            />
          ))
        ) : (
          <div className="empty-state">
            <h3>Anggota Tidak Ditemukan</h3>
            <p>
              Tidak ada anggota yang sesuai dengan pencarian.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
