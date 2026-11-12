import { useState } from 'react';
import TeamCard from '../components/TeamCard';
import AddMemberForm from '../components/AddMember';
import useFadeIn from '../fadein';

export default function TeamPage({
  members = [],
  onAddMember,
  onToggle,
  onGiveStar,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showForm, setShowForm] = useState(false);
  const [ref, tampil] = useFadeIn();

  const totalMembers = members.length;
  const onlineMembers = members.filter((m) => m.status === 'Online').length;
  const offlineMembers = totalMembers - onlineMembers;

  const filteredMembers = members.filter((m) => {
    const query = searchTerm.trim().toLowerCase();
    const matchName = m.name.toLowerCase().includes(query);
    const matchRole = m.role && m.role.toLowerCase().includes(query);
    const matchStatus =
      filterStatus === 'Semua' ? true : m.status === filterStatus;
    return (matchName || matchRole) && matchStatus;
  });

  return (
    <div className={`directory-container ${tampil ? 'tampil' : ''}`} ref={ref}>
      <header className="page-header">
        <div>
          <span className="eyebrow">MANAJEMEN ANGGOTA</span>
          <h1 className="page-title">Direktori Tim</h1>
          <p className="page-subtitle">
            Kenali anggota tim dan kelola profil serta status mereka dalam satu tempat.
          </p>
        </div>

        <button
          type="button"
          className="btn-toggle-form"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Tutup Form' : '+ Tambah Anggota'}
        </button>
      </header>

      {/* Ringkasan Statistik */}
      <section className="stats-bar">
        <div className="stat-box">
          <span className="stat-label">Total Anggota</span>
          <strong className="stat-num">{totalMembers}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-label">Sedang Online</span>
          <strong className="stat-num online">{onlineMembers}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-label">Sedang Offline</span>
          <strong className="stat-num offline">{offlineMembers}</strong>
        </div>
      </section>

      {/* Form Tambah Anggota */}
      {showForm && (
        <div className="form-toggle-wrapper">
          <AddMemberForm
            onAddMember={(data) => {
              onAddMember(data);
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Pencarian dan Filter */}
      <section className="filter-section">
        <input
          type="text"
          placeholder="🔍 Cari nama atau posisi anggota..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          {['Semua', 'Online', 'Offline'].map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Daftar Anggota */}
      <section className="members-section">
        <div className="section-header">
          <h2>Anggota Tim</h2>
          <span className="badge-count">{filteredMembers.length} orang</span>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="empty-state">
            ⚠️ Tidak ada anggota tim yang cocok dengan pencarian
            {searchTerm && <> "{searchTerm}"</>}
            {filterStatus !== 'Semua' && <> berstatus {filterStatus}</>}.
          </div>
        ) : (
          <div className="team-grid">
            {filteredMembers.map((member) => (
              <TeamCard
                key={member.id}
                {...member}
                onToggleStatus={onToggle}
                onAddStar={onGiveStar}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
