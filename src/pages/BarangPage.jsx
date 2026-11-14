import { useEffect, useState } from 'react';
import {
  createBarang,
  createKategori,
  deleteBarang,
  deleteKategori,
  fallbackBarang,
  fallbackKategori,
  fetchBarang,
  fetchKategori,
  updateBarang,
} from '../api/barang';
import './BarangPage.css';

export default function BarangPage() {
  const [barangList, setBarangList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('all');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    kategoriId: '',
    stok: 0,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const handleReload = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [barangData, kategoriData] = await Promise.all([
        fetchBarang().catch(() => null),
        fetchKategori().catch(() => null),
      ]);

      if (barangData && Array.isArray(barangData)) {
        setBarangList(barangData);
      } else {
        setBarangList(fallbackBarang);
      }

      if (kategoriData && Array.isArray(kategoriData)) {
        setKategoriList(kategoriData);
      } else {
        setKategoriList(fallbackKategori);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data inventaris barang.');
      setBarangList(fallbackBarang);
      setKategoriList(fallbackKategori);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function initialFetch() {
      try {
        const [barangData, kategoriData] = await Promise.all([
          fetchBarang().catch(() => null),
          fetchKategori().catch(() => null),
        ]);

        if (ignore) return;

        if (barangData && Array.isArray(barangData)) {
          setBarangList(barangData);
        } else {
          setBarangList(fallbackBarang);
        }

        if (kategoriData && Array.isArray(kategoriData)) {
          setKategoriList(kategoriData);
        } else {
          setKategoriList(fallbackKategori);
        }
      } catch (err) {
        if (ignore) return;
        setError(err.message || 'Gagal memuat data inventaris barang.');
        setBarangList(fallbackBarang);
        setKategoriList(fallbackKategori);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initialFetch();

    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      kategoriId:
        selectedKategori !== 'all'
          ? selectedKategori
          : kategoriList[0]?.id
            ? String(kategoriList[0].id)
            : '1',
      stok: 0,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      kategoriId: String(item.kategoriId || '1'),
      stok: item.stok,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError('');
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setCategoryError('Nama kategori wajib diisi.');
      return;
    }

    setIsSavingCategory(true);
    setCategoryError('');
    try {
      const created = await createKategori(trimmedName);
      setKategoriList((previous) =>
        [...previous, created].sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
      );
      setSelectedKategori(String(created.id));
      setCategoryName('');
    } catch (err) {
      setCategoryError(err.message || 'Gagal menambahkan kategori.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (
      !window.confirm(
        `Hapus kategori "${category.nama}"? Kategori yang masih digunakan barang tidak dapat dihapus.`
      )
    ) {
      return;
    }

    setDeletingCategoryId(category.id);
    setCategoryError('');
    try {
      await deleteKategori(category.id);
      setKategoriList((previous) =>
        previous.filter((item) => item.id !== category.id)
      );
      setSelectedKategori((current) =>
        String(current) === String(category.id) ? 'all' : current
      );
      setFormData((previous) =>
        String(previous.kategoriId) === String(category.id)
          ? { ...previous, kategoriId: '' }
          : previous
      );
    } catch (err) {
      setCategoryError(err.message || 'Gagal menghapus kategori.');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setFormError('Nama barang tidak boleh kosong.');
      return;
    }
    if (Number(formData.stok) < 0) {
      setFormError('Stok barang tidak boleh negatif.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingId) {
        const updated = await updateBarang(editingId, formData).catch(() => ({
          id: editingId,
          nama: formData.nama,
          kategoriId: Number(formData.kategoriId),
          kategori:
            kategoriList.find((k) => k.id === Number(formData.kategoriId))?.nama ||
            'Kategori',
          stok: Number(formData.stok),
        }));

        setBarangList((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...updated } : item))
        );
      } else {
        const created = await createBarang(formData).catch(() => ({
          id: Date.now(),
          nama: formData.nama,
          kategoriId: Number(formData.kategoriId),
          kategori:
            kategoriList.find((k) => k.id === Number(formData.kategoriId))?.nama ||
            'Kategori',
          stok: Number(formData.stok),
        }));

        setBarangList((prev) => [created, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data barang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus "${nama}"?`)) {
      return;
    }

    try {
      await deleteBarang(id).catch(() => true);
      setBarangList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Gagal menghapus barang.');
    }
  };

  // Filtered List
  const filteredBarang = barangList.filter((item) => {
    const matchesSearch = item.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedKategori === 'all' ||
      String(item.kategoriId) === String(selectedKategori) ||
      item.kategori?.toLowerCase() === selectedKategori.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalStok = barangList.reduce((acc, curr) => acc + (Number(curr.stok) || 0), 0);
  const lowStockCount = barangList.filter((item) => (Number(item.stok) || 0) < 5).length;

  return (
    <div className="barang-page">
      <header className="barang-header">
        <div className="barang-heading">
          <span className="barang-eyebrow">INVENTARIS & DATABASE</span>
          <h1>Manajemen Data Barang</h1>
          <p>
            Kelola data persediaan barang, stok, dan kategori secara real-time
            terhubung dengan database MySQL.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-barang"
          onClick={handleOpenAddModal}
        >
          <span aria-hidden="true">➕</span> Tambah Barang
        </button>
      </header>

      {/* Statistik Cepat */}
      <div className="barang-stats-grid">
        <div className="barang-stat-card">
          <span className="stat-label">Total Jenis Barang</span>
          <span className="stat-value">{barangList.length}</span>
        </div>
        <div className="barang-stat-card">
          <span className="stat-label">Total Stok Tersedia</span>
          <span className="stat-value">{totalStok}</span>
        </div>
        <div className="barang-stat-card">
          <span className="stat-label">Stok Kritis (&lt; 5)</span>
          <span className={`stat-value ${lowStockCount > 0 ? 'text-warning' : ''}`}>
            {lowStockCount}
          </span>
        </div>
      </div>

      {error && (
        <div className="barang-alert-banner">
          <span>⚠️ {error}</span>
          <button type="button" onClick={handleReload}>
            Muat Ulang
          </button>
        </div>
      )}

      {/* Filter dan Pencarian */}
      <div className="barang-toolbar">
        <div className="barang-search-box">
          <span aria-hidden="true" className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="barang-filter-category">
          <label htmlFor="kategori-filter">Kategori:</label>
          <select
            id="kategori-filter"
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat.id} value={kat.id}>
                {kat.nama}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-add-category"
            onClick={() => {
              setCategoryError('');
              setShowCategoryModal(true);
            }}
          >
            <span aria-hidden="true">＋</span> Kategori
          </button>
        </div>
      </div>

      {/* Konten / Tabel Barang */}
      {isLoading ? (
        <div className="barang-loading">
          <div className="barang-spinner" />
          <p>Memuat inventaris barang...</p>
        </div>
      ) : filteredBarang.length === 0 ? (
        <div className="barang-empty">
          <span className="empty-icon">📦</span>
          <h3>Tidak ada barang yang ditemukan</h3>
          <p>Coba gunakan kata kunci pencarian lain atau tambahkan barang baru.</p>
        </div>
      ) : (
        <div className="barang-table-wrapper">
          <table className="barang-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '80px' }}>ID</th>
                <th scope="col">Nama Barang</th>
                <th scope="col">Kategori</th>
                <th scope="col" style={{ width: '120px' }}>Stok</th>
                <th scope="col" style={{ width: '150px' }}>Status</th>
                <th scope="col" style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBarang.map((item) => {
                const stokNum = Number(item.stok) || 0;
                let statusBadge = { label: 'Tersedia', className: 'status-in-stock' };
                if (stokNum === 0) {
                  statusBadge = { label: 'Habis', className: 'status-out-of-stock' };
                } else if (stokNum < 5) {
                  statusBadge = { label: 'Menipis', className: 'status-low-stock' };
                }

                return (
                  <tr key={item.id}>
                    <td className="col-id">#{item.id}</td>
                    <td className="col-nama">
                      <strong>{item.nama}</strong>
                    </td>
                    <td className="col-kategori">
                      <span className="badge-kategori">
                        {item.kategori || 'Elektronik'}
                      </span>
                    </td>
                    <td className="col-stok">
                      <strong>{stokNum}</strong> unit
                    </td>
                    <td>
                      <span className={`badge-status ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="col-actions">
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit Barang"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleDelete(item.id, item.nama)}
                        title="Hapus Barang"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah / Edit Barang */}
      {showModal && (
        <div className="barang-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="barang-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{editingId ? 'Edit Data Barang' : 'Tambah Barang Baru'}</h2>
              <button
                type="button"
                className="btn-close-modal"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="modal-error-message">{formError}</div>
              )}

              <div className="form-group">
                <label htmlFor="nama">Nama Barang *</label>
                <input
                  id="nama"
                  type="text"
                  required
                  placeholder="Contoh: Monitor LED 24 Inch"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="kategoriId">Kategori *</label>
                <select
                  id="kategoriId"
                  value={formData.kategoriId}
                  onChange={(e) =>
                    setFormData({ ...formData, kategoriId: e.target.value })
                  }
                >
                  {kategoriList.map((kat) => (
                    <option key={kat.id} value={kat.id}>
                      {kat.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stok">Jumlah Stok *</label>
                <input
                  id="stok"
                  type="number"
                  min="0"
                  required
                  value={formData.stok}
                  onChange={(e) =>
                    setFormData({ ...formData, stok: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div
          className="barang-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSavingCategory) {
              setShowCategoryModal(false);
            }
          }}
        >
          <section
            className="barang-modal-card category-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="barang-eyebrow">PENGELOLAAN INVENTARIS</span>
                <h2 id="category-modal-title">Kelola Kategori</h2>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowCategoryModal(false)}
                disabled={isSavingCategory}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="category-modal-content">
              <p className="category-modal-description">
                Tambahkan kategori baru atau hapus kategori yang sudah tidak digunakan.
              </p>
              {categoryError && (
                <div className="modal-error-message" role="alert">
                  {categoryError}
                </div>
              )}

              <ul className="category-list">
                {kategoriList.map((category) => (
                  <li className="category-list-item" key={category.id}>
                    <span>{category.nama}</span>
                    <button
                      type="button"
                      className="category-delete-button"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={
                        isSavingCategory ||
                        deletingCategoryId !== null
                      }
                      aria-label={`Hapus kategori ${category.nama}`}
                    >
                      {deletingCategoryId === category.id
                        ? 'Menghapus...'
                        : 'Hapus'}
                    </button>
                  </li>
                ))}
                {kategoriList.length === 0 && (
                  <li className="category-list-empty">Belum ada kategori.</li>
                )}
              </ul>

              <form className="category-create-form" onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label htmlFor="nama-kategori">Tambah kategori baru</label>
                  <input
                    id="nama-kategori"
                    type="text"
                    maxLength={80}
                    autoFocus
                    required
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Contoh: Peralatan Kantor"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowCategoryModal(false)}
                    disabled={isSavingCategory || deletingCategoryId !== null}
                  >
                    Selesai
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={isSavingCategory || deletingCategoryId !== null}
                  >
                    {isSavingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
