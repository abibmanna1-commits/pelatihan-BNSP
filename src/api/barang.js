const API_BARANG_URL = '/api/barang';
const API_KATEGORI_URL = '/api/kategori';

export const fallbackKategori = [
  { id: 1, nama: 'Elektronik' },
  { id: 2, nama: 'ATK' },
  { id: 3, nama: 'Perabot' },
];

export const fallbackBarang = [
  {
    id: 1,
    nama: 'Laptop ThinkPad T480',
    kategoriId: 1,
    kategori: 'Elektronik',
    stok: 5,
  },
  {
    id: 2,
    nama: 'Mouse Wireless Logitech',
    kategoriId: 1,
    kategori: 'Elektronik',
    stok: 12,
  },
  {
    id: 3,
    nama: 'Kertas HVS A4 80gr',
    kategoriId: 2,
    kategori: 'ATK',
    stok: 25,
  },
  {
    id: 4,
    nama: 'Spidol Whiteboard Hitam',
    kategoriId: 2,
    kategori: 'ATK',
    stok: 40,
  },
  {
    id: 5,
    nama: 'Kursi Kerja Ergonomis',
    kategoriId: 3,
    kategori: 'Perabot',
    stok: 8,
  },
  {
    id: 6,
    nama: 'Meja Komputer Minimalis',
    kategoriId: 3,
    kategori: 'Perabot',
    stok: 4,
  },
];

export async function fetchBarang() {
  const response = await fetch(API_BARANG_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal memuat barang (HTTP ${response.status})`);
  }

  return response.json();
}

export async function fetchKategori() {
  const response = await fetch(API_KATEGORI_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal memuat kategori (HTTP ${response.status})`);
  }

  return response.json();
}

export async function createBarang(data) {
  const response = await fetch(API_BARANG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      nama: data.nama?.trim(),
      kategoriId: Number(data.kategoriId),
      stok: Number(data.stok ?? 0),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal menambahkan barang');
  }

  return response.json();
}

export async function updateBarang(id, data) {
  const payload = {};
  if (data.nama !== undefined) payload.nama = data.nama.trim();
  if (data.kategoriId !== undefined) payload.kategoriId = Number(data.kategoriId);
  if (data.stok !== undefined) payload.stok = Number(data.stok);

  const response = await fetch(`${API_BARANG_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal memperbarui barang');
  }

  return response.json();
}

export async function deleteBarang(id) {
  const response = await fetch(`${API_BARANG_URL}/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal menghapus barang');
  }

  return response.json();
}
