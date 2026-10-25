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
    loginNikFailed: 'NIk atau kata sandi salah',
    emailUsed: 'Email sudah terdaftar',
    nikUsed: 'NIK sudah terdaftar',
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

  odgjResident: {
    retrieved: 'Data warga ODGJ berhasil diambil',
    created: 'Warga ODGJ berhasil ditambahkan',
    updated: 'Data warga ODGJ berhasil diperbarui',
    deleted: 'Data warga ODGJ berhasil dihapus',
    notFound: 'Data warga ODGJ tidak ditemukan',
    duplicate: 'Warga sudah terdaftar sebagai ODGJ',
    residentNotFound: 'Warga tidak ditemukan',
    scheduleCreated: 'Jadwal pemeriksaan berhasil ditambahkan',
    recurringSchedulesCreated:
      'Jadwal pemeriksaan berulang berhasil ditambahkan',
    scheduleUpdated: 'Jadwal pemeriksaan berhasil diperbarui',
    scheduleDeleted: 'Jadwal pemeriksaan berhasil dihapus',
    scheduleNotFound: 'Jadwal pemeriksaan tidak ditemukan',
    recurrenceCountMin:
      'Jadwal pemeriksaan berulang memerlukan minimal 2 pertemuan',
    recurrenceCountMax:
      'Jadwal pemeriksaan berulang tidak boleh melebihi 120 pertemuan',
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
    nik: 'Nomor Induk Kependudukan (NIK)',
    email: 'Alamat Email',
    phoneNumber: 'Nomor Telepon',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    gender: 'Jenis Kelamin',
    birthDate: 'Tanggal Lahir',
    profession: 'Pekerjaan',
    RukunWargaId: 'Rukun Warga',
    RukunTetanggaId: 'Rukun Tetangga',
    MarriageStatusId: 'Status Pernikahan',
    EducationId: 'Pendidikan Terakhir',
    SalaryRangeId: 'Rentang Gaji',
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
    isKader: 'Status Kader',
    confirmNewPassword: 'Konfirmasi Kata Sandi Baru',
    count: 'Jumlah',
    name: 'Nama',
    examinationDate: 'Tanggal Pemeriksaan',
    notes: 'Catatan',
    scheduleId: 'ID Jadwal',
    recurrenceType: 'Pola Pengulangan',
    recurrenceCount: 'Jumlah Pertemuan',
  },
}

export default id
