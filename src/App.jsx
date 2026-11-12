
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import TeamPage from "./pages/TeamPage";
import NewsPage from "./pages/NewsPage";
import MemberDetailPage from "./pages/MemberDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const [members, setMembers] = useState([
    {
      id: 4,
      name: "Rina Wijaya",
      role: "Frontend Dev",
      status: "Online",
      stars: 3,
      avatar: "https://i.pravatar.cc/150?u=4",
      bio: "Frontend engineer antusias spesialis React & UI.",
    },
    {
      id: 1,
      name: "Budi Santoso",
      role: "Frontend Dev",
      status: "Online",
      stars: 2,
      avatar: "https://i.pravatar.cc/150?u=1",
      bio: "Pengembang web antarmuka responsif & performa tinggi.",
    },
    {
      id: 2,
      name: "Siti Rahma",
      role: "UI/UX Designer",
      status: "Offline",
      stars: 5,
      avatar: "https://i.pravatar.cc/150?u=2",
      bio: "Desainer interaksi fokus kesederhanaan desain sistem.",
    },
    {
      id: 3,
      name: "Ahmad Fauzi",
      role: "Backend Engineer",
      status: "Online",
      stars: 1,
      avatar: "https://i.pravatar.cc/150?u=3",
      bio: "Arsitek API Node.js dan keandalan sistem cloud.",
    },
  ]);

  const handleAddMember = (newMember) => {
    setMembers((prev) => [
      ...prev,
      { ...newMember, id: Date.now(), stars: 0 },
    ]);
  };

  const handleToggleStatus = (id) => {
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

  const handleGiveStar = (id) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, stars: member.stars + 1 }
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
    </div>
  );
}
