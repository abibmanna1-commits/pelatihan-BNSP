import { z } from 'zod';
import { useState } from 'react';
import useFadeIn from '../fadein';
import './AddMember.css';

const memberSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  role: z.string().min(1, 'Wajib memilih salah satu posisi tim'),
  bio: z
    .string()
    .min(5, 'Bio minimal 5 karakter')
    .max(120, 'Bio maksimal 120 karakter'),
});

const emptyForm = {
  name: '',
  email: '',
  role: '',
  bio: '',
};

function AddMemberForm({
  onAddMember,
  onClose,
  onSubmit,
  initialData = null,
  submitLabel = '+ Simpan Anggota',
  title = 'Tambah Anggota Tim Baru',
}) {
  const [formData, setFormData] = useState(() => initialData || emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ref, tampil] = useFadeIn();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = memberSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const payload = {
      name: result.data.name.trim(),
      email: result.data.email.trim(),
      role: result.data.role,
      bio: result.data.bio.trim(),
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(result.data.name)}`,
      status: 'Online',
      stars: 0,
    };

    setIsSubmitting(true);
    try {
      const succeeded = onSubmit
        ? await onSubmit(payload)
        : await onAddMember?.(payload);
      if (succeeded === false) return;

      setFormData(emptyForm);
      setErrors({});
      if (onClose) onClose();
    } catch (submitError) {
      setErrors((prev) => ({
        ...prev,
        _form: submitError.message || 'Gagal menyimpan data anggota.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={ref}
      className={`add-member-form ${tampil ? 'tampil' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="form-header">
        <h3 className="form-title">{title}</h3>
        {onClose && (
          <button
            type="button"
            className="btn-close-form"
            onClick={onClose}
            aria-label="Tutup form"
          >
            ✕
          </button>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="form-member-name">Nama Lengkap</label>
        <input
          id="form-member-name"
          name="name"
          placeholder="Contoh: Rina Wijaya"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-text">⚠️ {errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="form-member-email">Email Perusahaan</label>
        <input
          id="form-member-email"
          name="email"
          type="email"
          placeholder="Contoh: rina@perusahaan.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="error-text">⚠️ {errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="form-member-role">Posisi / Peran Tim</label>
        <select
          id="form-member-role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={errors.role ? 'input-error' : ''}
        >
          <option value="">-- Pilih Posisi --</option>
          <option value="Frontend Dev">Frontend Dev</option>
          <option value="Backend Engineer">Backend Engineer</option>
          <option value="UI/UX Designer">UI/UX Designer</option>
          <option value="Fullstack Developer">Fullstack Developer</option>
          <option value="Project Manager">Project Manager</option>
          <option value="QA Engineer">QA Engineer</option>
        </select>
        {errors.role && <span className="error-text">⚠️ {errors.role}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="form-member-bio">Bio Singkat</label>
        <textarea
          id="form-member-bio"
          name="bio"
          rows={3}
          placeholder="Contoh: Frontend engineer antusias spesialis React & UI"
          value={formData.bio}
          onChange={handleChange}
          className={errors.bio ? 'input-error' : ''}
        />
        {errors.bio && <span className="error-text">⚠️ {errors.bio}</span>}
      </div>

      <div className="form-actions">
        {errors._form && <p className="error-text" role="alert">{errors._form}</p>}
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default AddMemberForm;
