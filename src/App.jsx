import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import TeamPage from './pages/TeamPage';
import NewsPage from './pages/NewsPage';
import BarangPage from './pages/BarangPage';
import MemberDetailPage from './pages/MemberDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import {
  createMember,
  deleteMember,
  fallbackMembers,
  fetchMembers,
  updateMember as updateMemberApi,
} from './api/members';
import './App.css';

export default function App() {
  const [members, setMembers] = useState(fallbackMembers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      try {
        const data = await fetchMembers();
        if (isMounted) {
          setMembers(data);
          setError('');
        }
      } catch (loadError) {
        if (isMounted) {
          setMembers(fallbackMembers);
          setError(loadError.message || 'Gagal memuat data anggota.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddMember = async (newMember) => {
    try {
      const createdMember = await createMember({
        ...newMember,
        name: newMember.name?.trim() || 'Anggota Baru',
        email: newMember.email || 'member@perusahaan.com',
        role: newMember.role || 'Frontend Dev',
        bio: newMember.bio || 'Belum ada deskripsi anggota.',
      });

      setMembers((prev) => [...prev, createdMember]);
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Gagal menambahkan anggota baru.');
      return false;
    }
  };

  const handleToggleStatus = async (id) => {
    const member = members.find((item) => item.id === id);
    if (!member) return;

    try {
      const nextStatus = member.status === 'Online' ? 'Offline' : 'Online';
      const updatedMember = await updateMemberApi(id, { status: nextStatus, bio: member.bio });
      setMembers((prev) =>
        prev.map((item) => (item.id === id ? updatedMember : item))
      );
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Gagal mengubah status anggota.');
      return false;
    }
  };

  const handleGiveStar = async (id) => {
    const member = members.find((item) => item.id === id);
    if (!member) return;

    try {
      const nextStars = (member.stars ?? 0) + 1;
      const updatedMember = await updateMemberApi(id, { stars: nextStars, bio: member.bio });
      setMembers((prev) =>
        prev.map((item) => (item.id === id ? updatedMember : item))
      );
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Gagal menambahkan bintang.');
      return false;
    }
  };

  const handleUpdateMember = async (id, updates) => {
    const member = members.find((item) => item.id === id);
    if (!member) return;

    try {
      const updatedMember = await updateMemberApi(id, {
        ...updates,
        bio: updates.bio ?? member.bio,
      });
      setMembers((prev) =>
        prev.map((item) => (item.id === id ? { ...updatedMember, bio: updates.bio ?? member.bio } : item))
      );
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Gagal memperbarui anggota.');
      return false;
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteMember(id);
      setMembers((prev) => prev.filter((member) => member.id !== id));
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Gagal menghapus anggota.');
      return false;
    }
  };

  return (
    <div className="app-layout">
      <Navbar totalMembers={members.length} />

      <main className="content-area">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {isLoading && members.length === 0 && (
          <div className="empty-state">Memuat data anggota...</div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <TeamPage
                members={members}
                onAddMember={handleAddMember}
                onToggle={handleToggleStatus}
                onGiveStar={handleGiveStar}
                onDeleteMember={handleDeleteMember}
                onUpdateMember={handleUpdateMember}
              />
            }
          />

          <Route path="/news" element={<NewsPage />} />
          <Route path="/barang" element={<BarangPage />} />

          <Route
            path="/member/:id"
            element={<MemberDetailPage members={members} />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© 2026 Direktori Tim & Portal Berita. Dibuat dengan React & Vite.</p>
      </footer>
    </div>
  );
}
