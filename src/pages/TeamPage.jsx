import { useMemo, useState } from "react";
import "./TeamPage.css";

const API_URL = "/api/members";

const emptyForm = {
  name: "",
  email: "",
  role: "",
  bio: "",
  image: "",
};

export default function TeamPage({
  members = [],
  onToggle,
  onGiveStar,
  onDelete,
  onDeleteMember,
  onEditMember,
  onUpdateMember,
  onAddMember,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");

  // Modal State ('add' | 'edit' | null)
  const [modalMode, setModalMode] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = onDeleteMember || onDelete;
  const updateHandler = onUpdateMember || onEditMember;
  const addHandler = onAddMember;

  const visibleMembers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return members.filter((member) => {
      const name = String(member.name || "").toLowerCase();
      const role = String(member.role || member.position || "").toLowerCase();
      const online =
        member.online ??
        member.isOnline ??
        (String(member.status || "").toLowerCase() === "online");

      const matchesSearch =
        name.includes(keyword) || role.includes(keyword);

      const matchesFilter =
        filter === "semua" ||
        (filter === "online" && Boolean(online)) ||
        (filter === "offline" && !online);

      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  const totalOnline = members.filter((member) => {
    return (
      member.online ??
      member.isOnline ??
      (String(member.status || "").toLowerCase() === "online")
    );
  }).length;

  function openAdd() {
    setMessage("");
    setModalMode("add");
    setEditingMember(null);
    setForm(emptyForm);
  }

  function openEdit(member) {
    setMessage("");
    setModalMode("edit");
    setEditingMember(member);

    setForm({
      name: member.name || "",
      email: member.email || "",
      role: member.role || member.position || "",
      bio: member.bio || "",
      image: member.image || member.avatar || "",
    });
  }

  function closeModal() {
    if (saving) return;
    setModalMode(null);
    setEditingMember(null);
    setForm(emptyForm);
    setMessage("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim()) {
      setMessage("Nama lengkap wajib diisi (minimal 3 karakter).");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setMessage("Format email tidak valid.");
      return;
    }
    if (!form.role.trim()) {
      setMessage("Posisi atau jabatan  wajib diisi.");
      return;
    }

    setSaving(true);
    setMessage("");

    const avatarUrl =
      form.image.trim() ||
      `https://i.pravatar.cc/150?u=${encodeURIComponent(form.name.trim())}`;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      bio: form.bio.trim() || "Anggota tim profesional.",
      image: avatarUrl,
      avatar: avatarUrl,
      status: editingMember?.status || "Online",
      stars: editingMember?.stars ?? 0,
    };

    try {
      if (modalMode === "add") {
        if (addHandler) {
          await addHandler(payload);
        } else {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.message || "Gagal menambahkan anggota baru.");
          }
        }
      } else if (modalMode === "edit" && editingMember) {
        if (updateHandler) {
          await updateHandler(editingMember.id, payload);
        } else {
          const response = await fetch(
            `${API_URL}/${encodeURIComponent(editingMember.id)}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.message || "Gagal menyimpan perubahan anggota.");
          }
        }
      }

      closeModal();
    } catch (error) {
      setMessage(
        error.message ||
          "Tidak dapat menyimpan perubahan. Periksa koneksi backend."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(member) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus anggota ${member.name}?`
    );

    if (!confirmed) return;

    try {
      if (deleteHandler) {
        await deleteHandler(member.id);
      } else {
        const response = await fetch(
          `${API_URL}/${encodeURIComponent(member.id)}`,
          { method: "DELETE" }
        );

        if (!response.ok && response.status !== 404) {
          throw new Error("Gagal menghapus anggota dari server.");
        }
      }
    } catch (error) {
      console.warn("Delete error:", error);
    }
  }

  function handleStatus(member) {
    if (onToggle) {
      onToggle(member.id);
      return;
    }

    window.alert(
      "Fitur status memerlukan fungsi onToggle dari komponen induk."
    );
  }

  function handleStar(member) {
    if (onGiveStar) {
      onGiveStar(member.id);
      return;
    }

    window.alert(
      "Fitur bintang memerlukan fungsi onGiveStar dari komponen induk."
    );
  }

  function isOnline(member) {
    return Boolean(
      member.online ??
        member.isOnline ??
        (String(member.status || "").toLowerCase() === "online")
    );
  }

  function getStars(member) {
    return Number(member.stars ?? member.star ?? 0);
  }

  return (
    <main className="team-page">
      <section className="team-heading">
        <div>
          <span className="team-eyebrow">MANAJEMEN ANGGOTA</span>
          <h1>Direktori Tim</h1>
          <p>
            Kenali  dan kelola profil serta status mereka
            dalam satu tempat.
          </p>
        </div>

        <button
          type="button"
          className="team-btn team-btn-primary"
          onClick={openAdd}
        >
          <span aria-hidden="true">＋</span> Tambah Anggota
        </button>
      </section>

      <section className="team-stats">
        <article className="team-stat-card">
          <span>Total Anggota</span>
          <strong>{members.length}</strong>
        </article>

        <article className="team-stat-card">
          <span>Sedang Online</span>
          <strong className="stat-green">{totalOnline}</strong>
        </article>

        <article className="team-stat-card">
          <span>Sedang Offline</span>
          <strong className="stat-gray">
            {members.length - totalOnline}
          </strong>
        </article>
      </section>

      <section className="team-toolbar">
        <label className="team-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau posisi anggota..."
            aria-label="Cari anggota"
          />
        </label>

        <div className="team-filters" aria-label="Filter status anggota">
          {[
            ["semua", "Semua"],
            ["online", "Online"],
            ["offline", "Offline"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`team-filter ${
                filter === value ? "active" : ""
              }`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {message && !modalMode && (
        <div className="team-message" role="alert">
          {message}
        </div>
      )}

      <div className="team-list-heading">
        <h2>Anggota Tim</h2>
        <span>{visibleMembers.length} orang</span>
      </div>

      {visibleMembers.length === 0 ? (
        <div className="team-empty">
          <span aria-hidden="true">👥</span>
          <h3>Anggota tidak ditemukan</h3>
          <p>Coba ubah kata kunci pencarian atau filter status.</p>
        </div>
      ) : (
        <section className="team-grid">
          {visibleMembers.map((member) => {
            const online = isOnline(member);
            const image = member.image || member.avatar;

            return (
              <article className="team-card" key={member.id}>
                <div className="team-card-top">
                  <span className="team-member-id">
                    ID #{member.id}
                  </span>
                  <span
                    className={`team-status ${
                      online ? "online" : "offline"
                    }`}
                  >
                    <span className="status-dot" />
                    {online ? "Online" : "Offline"}
                  </span>
                </div>

                {image ? (
                  <img
                    className="team-avatar"
                    src={image}
                    alt={`Foto ${member.name}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = `https://i.pravatar.cc/150?u=${encodeURIComponent(member.name || "user")}`;
                    }}
                  />
                ) : (
                  <div className="team-avatar team-avatar-fallback">
                    {(member.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}

                <h3>{member.name}</h3>
                <p className="team-role">
                  {member.role || member.position || "Anggota Tim"}
                </p>

                <p className="team-bio">
                  {member.bio || "Belum ada deskripsi anggota."}
                </p>

                <div className="team-star-count">
                  <span aria-hidden="true">★</span>
                  {getStars(member)} Bintang
                </div>

                <div className="team-card-actions">
                  <button
                    type="button"
                    className="team-btn team-btn-star"
                    onClick={() => handleStar(member)}
                  >
                    ★ Beri Bintang
                  </button>

                  <button
                    type="button"
                    className="team-btn team-btn-status"
                    onClick={() => handleStatus(member)}
                  >
                    {online ? "Jadikan Offline" : "Jadikan Online"}
                  </button>
                </div>

                <div className="team-card-actions secondary-actions">
                  <button
                    type="button"
                    className="team-btn team-btn-edit"
                    onClick={() => openEdit(member)}
                  >
                    <span aria-hidden="true">✎</span> Edit
                  </button>

                  <button
                    type="button"
                    className="team-btn team-btn-delete"
                    onClick={() => handleDelete(member)}
                  >
                    <span aria-hidden="true">🗑️</span> Hapus
                  </button>
                </div>

                <button
                  type="button"
                  className="team-profile-link"
                  onClick={() => {
                    window.location.href = `/member/${member.id}`;
                  }}
                >
                  Lihat profil detail <span aria-hidden="true">→</span>
                </button>
              </article>
            );
          })}
        </section>
      )}

      {/* Modal Tambah & Edit Anggota */}
      {modalMode && (
        <div
          className="team-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
          >
            <div className="team-modal-header">
              <div>
                <span className="team-eyebrow">
                  {modalMode === "add" ? "TAMBAH ANGGOTA BARU" : "PENGATURAN PROFIL"}
                </span>
                <h2 id="member-modal-title">
                  {modalMode === "add" ? "Tambah Anggota Tim" : "Edit Anggota"}
                </h2>
                <p>
                  {modalMode === "add"
                    ? "Isi formulir di bawah untuk menambahkan  baru."
                    : "Perbarui informasi profil  kamu."}
                </p>
              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Tutup formulir"
              >
                ×
              </button>
            </div>

            <form className="team-edit-form" onSubmit={handleSave}>
              <label>
                Nama lengkap <span>*</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Rina Wijaya"
                  required
                />
              </label>

              <label>
                Email <span>*</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="rina@perusahaan.com"
                  required
                />
              </label>

              <label>
                Posisi / Jabatan <span>*</span>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="Contoh: Frontend Developer"
                  required
                />
              </label>

              <label>
                URL foto profil (opsional)
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://contoh.com/foto.jpg"
                />
              </label>

              <label>
                Deskripsi anggota / Bio
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tuliskan deskripsi singkat anggota..."
                  rows={4}
                />
              </label>

              {message && (
                <div className="team-message" role="alert">
                  {message}
                </div>
              )}

              <div className="team-modal-actions">
                <button
                  type="button"
                  className="team-btn team-btn-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="team-btn team-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : modalMode === "add"
                    ? "＋ Simpan Anggota Baru"
                    : "✓ Simpan Perubahan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
