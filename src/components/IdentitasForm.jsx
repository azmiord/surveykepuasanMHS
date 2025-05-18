// IdentitasForm.jsx
import { useEffect, useState } from 'react';

const prodiOptions = {
  'Fakultas Ekonomi dan Bisnis (FEB)': [
    'Program Sarjana - Manajemen',
    'Program Sarjana - Ekonomi Pembangunan',
    'Program Sarjana - Ekonomi Syariah',
    'Program Sarjana - Akuntansi',
    'Program Sarjana - Akuntansi Keuangan Publik',
    'Program Sarjana - Pariwisata',
    'Program Sarjana - Kewirausahaan'
  ],
  'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)': [
    'Program Sarjana - Pendidikan Bahasa dan Sastra Indonesia',
    'Program Sarjana - Pendidikan Bahasa Inggris',
    'Program Sarjana - Pendidikan Biologi',
    'Program Sarjana - Pendidikan Fisika',
    'Program Sarjana - Pendidikan Kimia',
    'Program Sarjana - Pendidikan Matematika',
    'Program Sarjana - Pendidikan Ekonomi',
    'Program Sarjana - Pendidikan Pancasila dan Kewarganegaraan',
    'Program Sarjana - Mata Kuliah Umum',
    'Program Sarjana - Teknologi Pendidikan',
    'Program Sarjana - Pendidikan Guru Sekolah Dasar (PGSD)',
    'Program Sarjana - Pendidikan Guru Pendidikan Anak Usia Dini (PGPAUD)',
    'Program Sarjana - Program Pendidikan Profesi Guru (PPG)',
    'Program Sarjana - Pendidikan Agama Islam (PAI)'
  ],
  'Fakultas Sains dan Teknologi (FST)': [
    'Program Sarjana - Statistika',
    'Program Sarjana - Matematika',
    'Program Sarjana - Biologi',
    'Program Sarjana - Teknologi Pangan',
    'Program Sarjana - Agribisnis',
    'Program Sarjana - Perencanaan Wilayah dan Kota',
    'Program Sarjana - Sistem Informasi',
    'Program Sarjana - Sains Data'
  ],
  'Fakultas Hukum Ilmu Sosial dan Ilmu Politik (FHISIP)': [
    'Program Diploma - Kearsipan (D4)',
    'Program Diploma - Perpajakan (D3)',
    'Program Sarjana - Administrasi Negara',
    'Program Sarjana - Administrasi Bisnis',
    'Program Sarjana - Hukum',
    'Program Sarjana - Ilmu Pemerintahan',
    'Program Sarjana - Ilmu Komunikasi',
    'Program Sarjana - Ilmu Perpustakaan',
    'Program Sarjana - Sosiologi',
    'Program Sarjana - Sastra Inggris',
    'Program Sarjana - Perpajakan'
  ],
  'Sekolah Pascasarjana (SPs)': [
    'Magister S2 - Magister Studi Lingkungan',
    'Magister S2 - Magister Manajemen Perikanan',
    'Magister S2 - Magister Administrasi Publik',
    'Magister S2 - Magister Manajemen',
    'Magister S2 - Magister Pendidikan Dasar',
    'Magister S2 - Magister Pendidikan Matematika',
    'Magister S2 - Magister Pendidikan Bahasa Inggris',
    'Magister S2 - Magister Pendidikan Anak Usia Dini (MPAD)',
    'Magister S2 - Magister Hukum',
    'Doktoral S3 - Doktor Ilmu Manajemen',
    'Doktoral S3 - Doktor Administrasi Publik'
  ]
};


const IdentitasForm = ({ formData, handleChange, onValidationChange }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.nama || formData.nama.trim().length < 2 || !/^[A-Za-z\s]+$/.test(formData.nama)) {
      newErrors.nama = 'Nama minimal 2 huruf dan hanya huruf/spasi';
    }

    if (!formData.fakultas) newErrors.fakultas = 'Wajib pilih fakultas';
    if (!formData.prodi) newErrors.prodi = 'Wajib pilih prodi';
    if (!formData.nim) newErrors.nim = 'Wajib isi NIM. NIM hanya bisa untuk satu kali pengisian form';
    if (!formData.asal_ut) newErrors.asal_ut = 'Wajib pilih asal UT';
    if (!formData.semester || isNaN(formData.semester) || formData.semester < 3) {
  newErrors.semester = 'Minimal semester 3';
}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Gunakan email Ecampus';
    }

    if (!formData.no_hp || !/^08\d{8,11}$/.test(formData.no_hp)) {
      newErrors.no_hp = 'No HP harus diawali 08 dan 10–13 digit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const isValid = validate();
    onValidationChange(isValid);
  }, [formData]);

  const inputStyle =
    "w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const renderField = ({ label, name, type = 'text', options }) => (
    <div key={name}>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>

      {options ? (
  <select
    id={name}
    name={name}
    value={formData[name]}
    onChange={handleChange}
    required
    className={inputStyle}
  >
    <option value="">Pilih...</option>
    {options.map((opt, idx) => (
      <option key={idx} value={opt}>{opt}</option>
    ))}
  </select>
) : (
  <input
    type={type}
    id={name}
    name={name}
    value={formData[name]}
    onChange={handleChange}
    className={inputStyle}
  />
)}

      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <form className="space-y-5">
        {renderField({ label: 'Nama Lengkap', name: 'nama' })}
        {renderField({ label: 'Email', name: 'email', type: 'email' })}
        {renderField({ label: 'No. HP (WhatsApp)', name: 'no_hp' })}
        {renderField({ label: 'NIM', name: 'nim' })}
        {renderField({ label: 'Asal UT Daerah', name: 'asal_ut', options: ['UT Ambon', 'UT Banda Aceh', 'UT Bandar Lampung', 'UT Bandung', 'UT Banjarmasin', 'UT Batam', 'UT Bengkulu', 'UT Bogor', 'UT Denpasar', 'UT Gorontalo', 'UT Jakarta', 'UT Jambi', 'UT Jayapura', 'UT Jember', 'UT Kendari', 'UT Kupang', 'UT Luar Negeri', 'UT Majene', 'UT Makassar', 'UT Malang', 'UT Manado', 'UT Mataram', 'UT Medan', 'UT Padang', 'UT Palangkaraya', 'UT Palembang', 'UT Palu', 'UT Pangkal Pinang', 'UT Pekanbaru', 'UT Pontianak', 'UT Purwokerto', 'UT Samarinda', 'UT Semarang', 'UT Serang', 'UT Sorong', 'UT Surabaya', 'UT Surakarta', 'UT Tarakan', 'UT Ternate', 'UT Yogyakarta'] })}
        {renderField({ label: 'Fakultas', name: 'fakultas', options: Object.keys(prodiOptions) })}
        {renderField({ label: 'Program Studi', name: 'prodi', options: prodiOptions[formData.fakultas] || [] })}        
        {renderField({ label: 'Semester', name: 'semester', type: 'number' })}
      </form>
    </div>
  );
};

export default IdentitasForm;
