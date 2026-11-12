import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import TeamPage from './pages/TeamPage';
import NewsPage from './pages/NewsPage';
import MemberDetailPage from './pages/MemberDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const initialMembers = [
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

export default function App() {
  const [members, setMembers] = useState(initialMembers);

  const handleAddMember = (newMember) => {
    setMembers((prev) => [
      ...prev,
      {
        ...newMember,
        id: Date.now(),
        status: newMember.status || 'Online',
        stars: newMember.stars ?? 0,
        avatar:
          newMember.avatar ||
          `https://i.pravatar.cc/150?u=${encodeURIComponent(newMember.name || Date.now())}`,
      },
    ]);
  };

  const handleToggleStatus = (id) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? {
              ...member,
              status: member.status === 'Online' ? 'Offline' : 'Online',
            }
          : member
      )
    );
  };

  const handleGiveStar = (id) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, stars: (member.stars ?? 0) + 1 }
          : member
      )
    );
  };

  return (
    <div className="app-layout">
      <Navbar totalMembers={members.length} />

      <main className="content-area">
        <Routes>
          <Route
            path="/"
            element={
              <TeamPage
                members={members}
                onAddMember={handleAddMember}
                onToggle={handleToggleStatus}
                onGiveStar={handleGiveStar}
              />
            }
          />

          <Route path="/news" element={<NewsPage />} />

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
