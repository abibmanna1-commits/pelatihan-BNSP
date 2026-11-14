const API_URL = '/api/members';

export const fallbackMembers = [
  {
    id: 1,
    name: 'Budi Santoso',
    role: 'Frontend Dev',
    status: 'Online',
    stars: 2,
    avatar: 'https://i.pravatar.cc/150?u=1',
    bio: 'Pengembang web antarmuka responsif dan berkinerja tinggi.',
    email: 'budi.santoso@perusahaan.com',
  },
  {
    id: 2,
    name: 'Siti Rahma',
    role: 'UI/UX Designer',
    status: 'Offline',
    stars: 5,
    avatar: 'https://i.pravatar.cc/150?u=2',
    bio: 'Desainer interaksi berfokus pada desain sistem dan pengalaman pengguna.',
    email: 'siti.rahma@perusahaan.com',
  },
  {
    id: 3,
    name: 'Ahmad Fauzi',
    role: 'Backend Engineer',
    status: 'Online',
    stars: 1,
    avatar: 'https://i.pravatar.cc/150?u=3',
    bio: 'Arsitek API Node.js dan keandalan sistem cloud backend.',
    email: 'ahmad.fauzi@perusahaan.com',
  },
  {
    id: 4,
    name: 'Rina Wijaya',
    role: 'Frontend Dev',
    status: 'Online',
    stars: 3,
    avatar: 'https://i.pravatar.cc/150?u=4',
    bio: 'Frontend engineer yang antusias spesialis React dan desain UI.',
    email: 'rina.wijaya@perusahaan.com',
  },
];

export function normalizeMember(member) {
  if (!member) return null;

  return {
    id: member.id,
    name: member.namaLengkap ?? member.name,
    email: member.email,
    role: member.posisi ?? member.role,
    status: member.status ?? 'Online',
    stars: member.rating ?? member.stars ?? 0,
    avatar:
      member.avatar ??
      `https://i.pravatar.cc/150?u=${encodeURIComponent(
        String(member.id ?? member.name ?? 'member')
      )}`,
    bio: member.bio ?? 'Belum ada deskripsi anggota.',
  };
}

async function parseJsonResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server mengirim respons dengan format yang tidak valid.');
  }

  return response.json();
}

export async function fetchMembers() {
  const response = await fetch(API_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Gagal memuat data anggota dari server.');
  }

  const data = await parseJsonResponse(response);
  if (!Array.isArray(data)) {
    throw new Error('Format data anggota dari server tidak valid.');
  }
  return data.map(normalizeMember);
}

export async function createMember(memberData) {
  const payload = {
    namaLengkap: memberData.name,
    email: memberData.email,
    posisi: memberData.role,
    status: memberData.status || 'Online',
    rating: Number(memberData.stars ?? 0),
    bio: memberData.bio,
    avatar:
      memberData.avatar ||
      `https://i.pravatar.cc/150?u=${encodeURIComponent(memberData.name || 'member')}`,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || 'Gagal menambahkan anggota baru.');
  }

  return normalizeMember(data);
}

export async function updateMember(id, updates) {
  const payload = {};

  if (updates.name) payload.namaLengkap = updates.name;
  if (updates.email) payload.email = updates.email;
  if (updates.role) payload.posisi = updates.role;
  if (updates.status) payload.status = updates.status;
  if (updates.stars !== undefined) payload.rating = Number(updates.stars);
  if (updates.bio !== undefined) payload.bio = updates.bio;

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || 'Gagal memperbarui data anggota.');
  }

  return normalizeMember(data);
}

export async function deleteMember(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 204) {
    return true;
  }

  const data = await parseJsonResponse(response);
  throw new Error(data?.message || 'Gagal menghapus anggota.');
}
