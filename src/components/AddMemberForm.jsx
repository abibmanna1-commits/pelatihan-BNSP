
import { useState } from 'react';
import { z } from 'zod';

const memberSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  role: z.string().min(1, 'Jabatan harus diisi'),
  bio: z.string().min(5, 'Bio minimal 5 karakter'),
});

export default function AddMemberForm({ onAddMember }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = memberSchema.safeParse(formData);

    if (!result.success) {
      const newErrors = {};

      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0]] = issue.message;
      });

      setErrors(newErrors);
      return;
    }

    onAddMember({
      ...result.data,
      status: 'Online',
    });

    setFormData({
      name: '',
      email: '',
      role: '',
      bio: '',
    });

    setErrors({});
  };

  return (
    <div className="add-member-container">
      <h2>Tambah Anggota Baru</h2>
      <p>Masukkan informasi anggota tim yang baru.</p>

      <form onSubmit={handleSubmit} className="member-form">
        <div className="form-group">
          <label>Nama Lengkap</label>
          <input
            type="text"
            name="name"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <small>{errors.name}</small>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="contoh@email.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <small>{errors.email}</small>}
        </div>

        <div className="form-group">
          <label>Jabatan</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Pilih Jabatan</option>
            <option value="Frontend Dev">Frontend Dev</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="Fullstack Developer">Fullstack Developer</option>
          </select>
          {errors.role && <small>{errors.role}</small>}
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            placeholder="Tuliskan deskripsi singkat..."
            value={formData.bio}
            onChange={handleChange}
          />
          {errors.bio && <small>{errors.bio}</small>}
        </div>

        <button type="submit" className="btn-submit">
          + Tambahkan Anggota
        </button>
      </form>
    </div>
  );
}
