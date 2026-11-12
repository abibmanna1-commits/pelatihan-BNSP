
import { useState } from "react";
import "./TeamDirectory.css";

function TeamDirectory() {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Amru Favian",
      email: "rina@perusahaan.com",
      role: "Frontend Dev",
      bio: "Senior React Developer & UI Specialist",
      avatar: "https://i.pravatar.cc/150?u=1",
      status: "Online",
      stars: 0,
    },
    {
      id: 2,
      name: "habib",
      email: "budi@perusahaan.com",
      role: "Frontend Dev",
      bio: "Passionate in React & Modern UI",
      avatar: "https://i.pravatar.cc/150?u=2",
      status: "Online",
      stars: 2,
    },
    {
      id: 3,
      name: "arlot",
      email: "siti@perusahaan.com",
      role: "UI/UX Designer",
      bio: "Design Master & User Advocate",
      avatar: "https://i.pravatar.cc/150?u=3",
      status: "Offline",
      stars: 5,
    },
    {
      id: 4,
      name: "Ahmad Fauzi",
      email: "ahmad@perusahaan.com",
      role: "Backend Engineer",
      bio: "Expert API & Cloud Services",
      avatar: "https://i.pravatar.cc/150?u=4",
      status: "Online",
      stars: 1,
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Frontend Dev",
    bio: "",
  });

  const [search, setSearch] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const totalMembers = members.length;

  const onlineMembers = members.filter(
    (member) => member.status === "Online"
  ).length;

  const offlineMembers = totalMembers - onlineMembers;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMember = (e) => {
    e.preventDefault();

    if (
      formData.name.trim().length < 3 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
      !formData.role
    ) {
      alert("Periksa kembali nama, email, dan posisi anggota!");
      return;
    }

    const newMember = {
      id: Date.now(),
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      bio: formData.bio.trim(),
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      status: "Online",
      stars: 0,
    };

    setMembers((prev) => [...prev, newMember]);

    setFormData({
      name: "",
      email: "",
      role: "Frontend Dev",
      bio: "",
    });
  };

  const toggleStatus = (id) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? {
              ...member,
              status:
                member.status === "Online" ? "Offline" : "Online",
            }
          : member
      )
    );
  };

  const giveStar = (id) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, stars: member.stars + 1 }
          : member
      )
    );
  };

  const filteredMembers = members.filter((member) => {
    const searchText = `${member.name} ${member.role} ${member.email}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = onlineOnly
      ? member.status === "Online"
      : true;

    return searchText && matchesStatus;
  });

  return (
    <main className="team-directory">
      <header className="team-header">
        <div>
          <span className="eyebrow">TEAM WORKSPACE</span>
          <h1>Direktori Tim</h1>
          <p>
            Kelola anggota tim, pantau aktivitas, dan apresiasi
            kontribusi mereka.
          </p>
        </div>

        <div className="header-total">
          <span className="header-total-icon">✦</span>
          <div>
            <strong>{totalMembers} Anggota</strong>
            <span>Tim kamu saat ini</span>
          </div>
        </div>
      </header>

      {/* Statistik anggota */}
      <section className="stats-container">
        <div className="stat-card stat-total">
          <div className="stat-top">
            <span>Total Members</span>
            <span className="stat-icon">👥</span>
          </div>
          <h2>{totalMembers}</h2>
          <p>Seluruh anggota tim</p>
        </div>

        <div className="stat-card stat-online">
          <div className="stat-top">
            <span>Online</span>
            <span className="stat-icon">🟢</span>
          </div>
          <h2 className="online-number">{onlineMembers}</h2>
          <p>Anggota sedang online</p>
        </div>

        <div className="stat-card stat-offline">
          <div className="stat-top">
            <span>Offline</span>
            <span className="stat-icon">🌙</span>
          </div>
          <h2 className="offline-number">{offlineMembers}</h2>
          <p>Anggota sedang offline</p>
        </div>
      </section>

      {/* Form tambah anggota */}
      <section className="add-member-form">
        <div className="section-heading">
          <div className="section-icon">＋</div>
          <div>
            <h2>Tambah Anggota Tim</h2>
            <p>Lengkapi informasi anggota baru di bawah ini.</p>
          </div>
        </div>

        <form onSubmit={handleAddMember}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="member-name">Nama Lengkap</label>
              <input
                id="member-name"
                type="text"
                name="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="member-email">Email Perusahaan</label>
              <input
                id="member-email"
                type="email"
                name="email"
                placeholder="nama@perusahaan.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="member-role">Posisi / Peran</label>
              <select
                id="member-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Frontend Dev">Frontend Dev</option>
                <option value="Backend Engineer">
                  Backend Engineer
                </option>
                <option value="UI/UX Designer">UI/UX Designer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="member-bio">Bio Singkat</label>
              <input
                id="member-bio"
                type="text"
                name="bio"
                placeholder="Ceritakan tentang anggota"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-footer">
            <span className="form-hint">
              * Nama minimal 3 karakter dan email harus valid.
            </span>
            <button type="submit" className="btn-submit">
              <span>＋</span> Tambah Anggota
            </button>
          </div>
        </form>
      </section>

      {/* Pencarian dan filter */}
      <section className="members-section">
        <div className="members-heading">
          <div>
            <h2>Anggota Tim</h2>
            <p>
              Menampilkan {filteredMembers.length} dari {totalMembers}{" "}
              anggota
            </p>
          </div>

          <button
            type="button"
            className={`btn-filter ${onlineOnly ? "active" : ""}`}
            onClick={() => setOnlineOnly((prev) => !prev)}
            aria-pressed={onlineOnly}
          >
            <span className="filter-dot" />
            {onlineOnly ? "Tampilkan Semua" : "Hanya Online"}
          </button>
        </div>

        <div className="search-container">
          <span className="search-icon">⌕</span>
          <input
            type="search"
            aria-label="Cari anggota tim"
            placeholder="Cari nama, email, atau posisi anggota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="btn-clear"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div>

        {/* Kartu anggota */}
        <div className="team-grid">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <article className="team-card" key={member.id}>
                <div className="card-top">
                  <div className="avatar-wrapper">
                    <img
                      src={member.avatar}
                      alt={`Foto ${member.name}`}
                      className="card-avatar"
                      loading="lazy"
                    />
                    <span
                      className={`avatar-status ${
                        member.status === "Online"
                          ? "is-online"
                          : "is-offline"
                      }`}
                    />
                  </div>

                  <span
                    className={`status-badge ${
                      member.status === "Online"
                        ? "status-online"
                        : "status-offline"
                    }`}
                  >
                    <span className="status-dot" />
                    {member.status}
                  </span>
                </div>

                <h3 className="card-name">{member.name}</h3>
                <p className="card-role">{member.role}</p>
                <p className="card-email">{member.email}</p>

                <p className="card-bio">
                  {member.bio || "Belum ada bio anggota."}
                </p>

                <div className="card-meta">
                  <span className="star-count">
                    ⭐ <strong>{member.stars}</strong> Bintang
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="btn-star"
                    onClick={() => giveStar(member.id)}
                  >
                    ⭐ Beri Bintang
                  </button>

                  <button
                    type="button"
                    className="btn-status"
                    onClick={() => toggleStatus(member.id)}
                  >
                    Ubah ke{" "}
                    {member.status === "Online" ? "Offline" : "Online"}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-message">
              <span>🔎</span>
              <h3>Anggota tidak ditemukan</h3>
              <p>
                Coba kata kunci lain atau ubah filter anggota.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setOnlineOnly(false);
                }}
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
<TeamCard
  key={member.id}
  id={member.id}
  name={member.name}
  role={member.role}
  avatar={member.avatar}
  status={member.status}
  stars={member.stars}
/>
export default TeamDirectory;
