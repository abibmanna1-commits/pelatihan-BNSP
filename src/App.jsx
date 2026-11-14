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

      setMembers((prev) => [createdMember, ...prev]);
      setError('');
      return createdMember;
    } catch (err) {
      console.warn('Backend add member error (saving locally):', err);
      const localNewMember = {
        id: String(Date.now()),
        name: newMember.name?.trim() || 'Anggota Baru',
        email: newMember.email || 'member@perusahaan.com',
        role: newMember.role || 'Frontend Dev',
        bio: newMember.bio || 'Belum ada deskripsi anggota.',
        avatar:
          newMember.avatar ||
          newMember.image ||
          `https://i.pravatar.cc/150?u=${encodeURIComponent(newMember.name || 'new')}`,
        status: newMember.status || 'Online',
        stars: 0,
      };
      setMembers((prev) => [localNewMember, ...prev]);
      setError('');
      return localNewMember;
    }
  };

  const handleToggleStatus = async (id) => {
    const member = members.find((item) => String(item.id) === String(id));
    if (!member) return false;

    const nextStatus = member.status === 'Online' ? 'Offline' : 'Online';
    try {
      const updatedMember = await updateMemberApi(id, { status: nextStatus, bio: member.bio });
      setMembers((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updatedMember : item))
      );
      setError('');
      return true;
    } catch (err) {
      console.warn('Backend status update error (updating locally):', err);
      setMembers((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? { ...item, status: nextStatus } : item
        )
      );
      setError('');
      return true;
    }
  };

  const handleGiveStar = async (id) => {
    const member = members.find((item) => String(item.id) === String(id));
    if (!member) return false;

    const nextStars = (member.stars ?? 0) + 1;
    try {
      const updatedMember = await updateMemberApi(id, { stars: nextStars, bio: member.bio });
      setMembers((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updatedMember : item))
      );
      setError('');
      return true;
    } catch (err) {
      console.warn('Backend give star error (updating locally):', err);
      setMembers((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? { ...item, stars: nextStars } : item
        )
      );
      setError('');
      return true;
    }
  };

  const handleUpdateMember = async (id, updates) => {
    const member = members.find((item) => String(item.id) === String(id));
    if (!member) return null;

    try {
      const updatedMember = await updateMemberApi(id, {
        ...updates,
        bio: updates.bio ?? member.bio,
      });
      setMembers((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? { ...item, ...updatedMember } : item
        )
      );
      setError('');
      return updatedMember;
    } catch (err) {
      console.warn('Backend update error (updating locally):', err);
      const localUpdated = { ...member, ...updates };
      setMembers((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? localUpdated : item
        )
      );
      setError('');
      return localUpdated;
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteMember(id);
    } catch (err) {
      console.warn('Backend delete error (deleting locally):', err);
    }
    setMembers((prev) => prev.filter((member) => String(member.id) !== String(id)));
    setError('');
    return true;
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
                onDelete={handleDeleteMember}
                onUpdateMember={handleUpdateMember}
                onEditMember={handleUpdateMember}
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
