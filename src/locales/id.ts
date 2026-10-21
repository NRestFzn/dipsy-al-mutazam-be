import en from './en'

type Translation = typeof en

const id: Translation = {
  common: {
    success: 'Operasi berhasil',
    error: 'Terjadi kesalahan',
  },

  success: {
    created: 'Data berhasil dibuat',
    retrieved: 'Data berhasil diambil',
    updated: 'Data berhasil diperbarui',
    deleted: 'Data berhasil dihapus',
    restored: 'Data berhasil dipulihkan',
  },

  errors: {
    badRequest: 'Permintaan tidak valid',
    forbidden: 'Anda tidak memiliki izin untuk mengakses sumber daya ini',
    internalServer: 'Terjadi kesalahan pada server',
    notFound: 'Data tidak ditemukan',
    unauthorized: 'Akses tidak diizinkan',
  },

  auth: {
    loginFailed: 'Email atau kata sandi salah',
    loginNikFailed: 'NISN atau kata sandi salah',
    loginNisnFailed: 'NISN atau kata sandi salah',
    emailUsed: 'Email sudah terdaftar',
    nikUsed: 'NISN sudah terdaftar',
    nisnUsed: 'NISN sudah terdaftar',
    phoneUsed: 'Nomor telepon sudah terdaftar',
    loginSuccess: 'Login berhasil',
    registerSuccess: 'Pengguna berhasil didaftarkan',
  },

  user: {
    notFound: 'Pengguna tidak ditemukan',
    profileUpdated: 'Profil berhasil diperbarui',
    profilePictureUpdated: 'Foto profil berhasil diperbarui',
    inCompleteDetail: 'Pengguna belum mengisi data lengkap',
  },

  student: {
    created: 'Data siswa berhasil dibuat',
    retrieved: 'Data siswa berhasil diambil',
    updated: 'Data siswa berhasil diperbarui',
    deleted: 'Data siswa berhasil dihapus',
    notFound: 'Data siswa tidak ditemukan',
  },

  grade: {
    created: 'Data tingkat berhasil dibuat',
    retrieved: 'Data tingkat berhasil diambil',
    updated: 'Data tingkat berhasil diperbarui',
    deleted: 'Data tingkat berhasil dihapus',
    notFound: 'Data tingkat tidak ditemukan',
  },

  class: {
    created: 'Data kelas berhasil dibuat',
    retrieved: 'Data kelas berhasil diambil',
    updated: 'Data kelas berhasil diperbarui',
    deleted: 'Data kelas berhasil dihapus',
    notFound: 'Data kelas tidak ditemukan',
  },

  questionnaire: {
    duplicateOrder: 'Urutan berganda ditemukan',
    inCompleteAnswer: 'Mohon jawab semua pertanyaan yang tersedia',
    exceededAnswer:
      'Jawaban yang dikirim melebihi jumlah pertanyaan yang tersedia',
    notFound: 'Kuesioner tidak ditemukan',
    questionNotFound: 'Pertanyaan dengan id {id} tidak ditemukan',
    noQuestion: 'Kuesioner belum memiliki pertanyaan',
    invalidScoringConfig: 'Konfigurasi penilaian kuesioner tidak valid',
    invalidQuestionCategory: 'Kelompok penilaian pertanyaan tidak valid',
    invalidQuestionScoreOverrides: 'Perubahan skor pertanyaan tidak valid',
    invalidAnswerOption: 'Pilihan jawaban untuk pertanyaan {id} tidak valid',
    scoreOutsideResultRange:
      'Skor berada di luar rentang hasil yang telah dikonfigurasi',
    duplicateAnswer: 'Satu pertanyaan tidak boleh dijawab lebih dari sekali',
    questionNotInQuestionnaire:
      'Pertanyaan dengan id {id} bukan bagian dari kuesioner ini',
  },

  validation: {
    required: '{field} wajib diisi',
    email: 'Format {field} tidak valid',
    min: '{field} terlalu pendek',
    max: '{field} terlalu panjang',
    unique: '{field} sudah terdaftar',
    same: '{field} harus sama',
    oneOf: 'Pilihan {field} tidak valid',
    positive: '{field} harus berupa angka positif',
    integer: '{field} harus berupa bilangan bulat',
    number: '{field} harus berupa angka',
  },

  attributes: {
    fullname: 'Nama Lengkap',
    nisn: 'Nomor Induk Siswa Nasional (NISN)',
    nis: 'Nomor Induk Siswa (NIS)',
    entryYear: 'Tahun Masuk',
    academicYear: 'Tahun Ajaran',
    GradeId: 'Tingkat',
    ClassId: 'Kelas',
    TingkatId: 'Tingkat',
    KelasId: 'Kelas',
    email: 'Alamat Email',
    phoneNumber: 'Nomor Telepon',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    gender: 'Jenis Kelamin',
    birthDate: 'Tanggal Lahir',
    title: 'Judul',
    description: 'Deskripsi',
    status: 'Status',
    riskThreshold: 'Ambang Batas Risiko',
    scoringType: 'Tipe Penilaian',
    scoringConfig: 'Konfigurasi Penilaian',
    scoringCategory: 'Kelompok Penilaian',
    scoreOverrides: 'Perubahan Skor',
    cooldownInMinutes: 'Waktu Jeda (Menit)',
    CategoryId: 'Kategori',
    QuestionnaireId: 'Kuesioner',
    questionText: 'Teks Pertanyaan',
    questionType: 'Tipe Pertanyaan',
    order: 'Urutan',
    id: 'ID',
    UserId: 'Pengguna',
    SubmittedBy: 'Diserahkan Oleh',
    isAssisted: 'Dibantu Pengisian',
    answers: 'Daftar Jawaban',
    QuestionId: 'Pertanyaan',
    answerValue: 'Jawaban',
    startDate: 'Tanggal Mulai',
    endDate: 'Tanggal Selesai',
    confirmNewPassword: 'Konfirmasi Kata Sandi Baru',
    count: 'Jumlah',
    name: 'Nama',
  },
}

export default id
