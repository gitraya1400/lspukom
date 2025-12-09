/**
 * ============================================================================
 * KONTRAK API & DOKUMENTASI DATA (DTO) - LMS LSP POLSTAT STIS
 * ============================================================================
 * * Dokumen ini berfungsi sebagai "Single Source of Truth" untuk spesifikasi 
 * pertukaran data antara Frontend (Next.js) dan Backend (Mock/Real).
 * * STATUS: FINAL & SYNCHRONIZED WITH API-MOCK.JS
 * LAST UPDATE: 2025-12-09
 * * DAFTAR ISI:
 * 1. Definisi Tipe Data (DTO)
 * 2. Endpoint: Autentikasi
 * 3. Endpoint: Role Asesi (Peserta)
 * 4. Endpoint: Role Asesor (Penilai)
 * 5. Endpoint: Role Admin (Manajemen)
 * ============================================================================
 */

// ============================================================================
// 1. DEFINISI TIPE DATA (DATA TRANSFER OBJECTS)
// ============================================================================

/**
 * Wrapper Response Standar
 * Semua response sukses dari backend mengikuti format ini.
 */
const ApiResponse = {
  success: true,      // boolean
  message: "Sukses",  // string (opsional)
  data: {}            // Object | Array | null
};

/**
 * User (Pengguna)
 * Representasi entitas pengguna dalam sistem.
 */
const UserDTO = {
  id: "user-123",                 // string (Unique ID)
  email: "222310001@stis.ac.id",  // string (Email unik)
  nama: "Nadia Nisrina",          // string
  role: "ASESI",                  // "ASESI" | "ASESOR" | "ADMIN_LSP"
  
  // Atribut Khusus ASESI
  nim: "222310001",               // string | undefined
  skemaId: "DS",                  // "DS" | "ADS" | undefined
  kelas: "4SI1",                  // string | undefined
  
  // Atribut Khusus ASESOR / ADMIN
  nip: "19900101...",             // string | undefined
  skemaKeahlian: ["DS", "ADS"],   // string[] | undefined (Hanya Asesor)
  
  createdAt: "2025-01-01T00:00:00Z", // string (ISO Date)
  updatedAt: "2025-01-01T00:00:00Z"  // string (ISO Date)
};

/**
 * Skema Sertifikasi
 */
const SkemaDTO = {
  id: "DS",                       // string (ID Unik: "DS", "ADS")
  judul: "Data Scientist",        // string
  deskripsi: "Sertifikasi...",    // string
  totalUnit: 11,                  // number (Jumlah unit aktif)
  tahunAjaranList: ["2024/2025"]  // string[] (List tahun ajaran yang tersedia)
};

/**
 * Unit Kompetensi
 */
const UnitDTO = {
  id: "DS-1-20242025-xyz",        // string
  skemaId: "DS",                  // string
  tahunAjaran: "2024/2025",       // string
  nomorUnit: 1,                   // number
  kodeUnit: "J.62DMI00.001.1",    // string
  judul: "Menentukan Objektif",   // string
  deskripsi: "Deskripsi unit...", // string
  durasiTeori: 20,                // number (Menit)
  materiCount: 3,                 // number (Hitungan materi)
  soalCount: 5,                   // number (Hitungan soal teori)
  urutan: 1                       // number
};

/**
 * Materi Pembelajaran
 */
const MateriDTO = {
  id: "MAT-DS-1-123",             // string
  unitId: "DS-1",                 // string
  judul: "Video Pengantar",       // string
  jenis: "VIDEO",                 // "VIDEO" | "PDF" | "LINK"
  urlKonten: "https://...",       // string
  urutan: 1,                      // number
  createdAt: "..."                // string (ISO Date)
};

/**
 * Soal (Teori / Tryout)
 */
const SoalDTO = {
  id: "SOAL-DS-1-123",            // string
  unitId: "DS-1",                 // string (Null jika Tryout Skema)
  tipeSoal: "UJIAN_TEORI",        // "UJIAN_TEORI" | "TRYOUT"
  tipeJawaban: "ESAI",            // "ESAI" | "PILIHAN_GANDA"
  teks: "Jelaskan definisi...",   // string (Pertanyaan)
  tahunAjaran: "2024/2025",       // string
  urutan: 1,                      // number
  
  // Opsional (Pilihan Ganda)
  pilihan: ["A", "B"],            // string[] | undefined
  kunciJawaban: "A",              // string | undefined
};

/**
 * Soal Praktikum (Studi Kasus)
 */
const SoalPraktikumDTO = {
  id: "DS-PRAKTIKUM-2024-123",    // string
  skemaId: "DS",                  // string
  tahunAjaran: "2024/2025",       // string
  tipeSoal: "UJIAN_PRAKTIKUM",    // string (Fixed)
  tipeJawaban: "UPLOAD_FILE",     // string (Fixed)
  judul: "Studi Kasus Churn",     // string
  teks: "Instruksi...",           // string
  filePendukung: [                // array object
    { 
      id: "f1", 
      nama: "dataset.csv", 
      url: "/api/...", 
      size: "2 MB" 
    }
  ]
};

/**
 * Progress Asesi
 */
const ProgressAsesiDTO = {
  asesiId: "user-123",
  skemaId: "DS",
  fase: "PEMBELAJARAN",           // "PRA_ASESMEN"|"PEMBELAJARAN"|"TRYOUT"|"UJIAN_TEORI"|"SELESAI"
  
  // Tracking
  completedUnitIds: ["DS-1"],     // string[]
  viewedMateriIds: ["m1", "m2"],  // string[]
  progressPembelajaran: 10,       // number (0-100)
  
  // Flags Status
  statusPraAsesmen: "SELESAI",    // "BELUM" | "SELESAI"
  tryoutSelesai: true,            // boolean
  ujianTeoriSelesai: false,       // boolean
  ujianPraktikumSelesai: false,   // boolean
  unjukDiriSelesai: false         // boolean
};

/**
 * Status Hub Ujian (Dashboard Asesi)
 */
const ExamStatusDTO = {
  teori: {
    status: "SIAP_DIJADWALKAN",   // "TERKUNCI"|"MENUNGGU_JADWAL"|"SIAP_DIJADWALKAN"|"SELESAI"
    jadwal: {}                    // SesiUjianOfflineDTO | null
  },
  praktikum: {
    status: "AKTIF",              // "TERKUNCI"|"AKTIF"|"SELESAI"
    deadline: "2025-11-20...",    // string (ISO Date) | null
    jadwal: null
  },
  unjukDiri: {
    status: "MENUNGGU_JADWAL",    // "TERKUNCI"|"MENUNGGU_JADWAL"|"SIAP_DIJADWALKAN"|"SELESAI"
    jadwal: {}                    // SesiUjianOfflineDTO | null
  }
};

/**
 * Penugasan (Tugas Penilaian Asesor)
 */
const PenugasanDTO = {
  id: "penugasan-1",              // string
  asesorId: "asesor-1",           // string
  asesiId: "user-123",            // string
  asesiNama: "Budi",              // string
  asesiKelas: "4SI1",             // string
  skemaId: "DS",                  // string
  
  tipe: "TEORI",                  // "TEORI" | "PRAKTIKUM" | "UNJUK_DIRI"
  unitId: 1,                      // number | null (Null jika Praktikum/Unjuk Diri)
  unitJudul: "Unit 1...",         // string
  
  statusPenilaian: "BELUM_DINILAI", // "BELUM_DINILAI" | "SELESAI" | "BELUM_ADA_PENILAIAN"
  nilai: 85,                      // number | null
  nilaiKompetensi: "KOMPETEN",    // "KOMPETEN" | "BELUM_KOMPETEN" | "BELUM_DINILAI"
  feedback: "Bagus...",           // string | null
  tanggalPenilaian: "..."         // string (ISO Date)
};

/**
 * Sesi Ujian Offline (Jadwal)
 */
const SesiUjianOfflineDTO = {
  id: "sesi-1",                   // string
  skemaId: "DS",                  // string
  tipeUjian: "TEORI",             // "TEORI" | "UNJUK_DIRI"
  tanggal: "2025-11-20T00:00...", // string (ISO Date)
  waktu: "09:00",                 // string
  ruangan: "Lab 1",               // string
  kapasitas: 40,                  // number
  durasi: 120,                    // number (Menit)
  kelas: "4SI1",                  // string (Target kelas)
  
  // Field tambahan saat get detail:
  asesiTerplot: [UserDTO]         // UserDTO[]
};

/**
 * Kegiatan Linimasa
 */
const LinimasaDTO = {
  id: "lin-1",                    // string
  skemaId: "DS",                  // string | "UMUM"
  judul: "Sosialisasi",           // string
  deskripsi: "...",               // string
  tanggal: "2025-11-10...",       // string
  waktu: "13:00",                 // string
  urlZoom: "https://...",         // string | null
  tipe: "PEMBELAJARAN",           // "PEMBELAJARAN" | "PENGUMUMAN"
  pemateriAsesorId: "asesor-1"    // string | null
};

/**
 * Hasil Akhir (Detail Kelulusan)
 */
const HasilAkhirDTO = {
  asesiId: "user-123",
  skemaId: "DS",
  statusAkhir: "KOMPETEN",        // "KOMPETEN" | "BELUM_KOMPETEN" | "SEDANG_DINILAI" | "BELUM_DINILAI"
  
  hasilPraktikum: {               // Detail komponen
    status: "KOMPETEN", 
    nilai: 80, 
    feedback: "..." 
  },
  hasilUnjukDiri: {               // Detail komponen
    status: "KOMPETEN", 
    nilai: 85, 
    feedback: "..." 
  },
  hasilTeori: {
    statusAkumulasi: "KOMPETEN",  // Status agregat teori
    totalUnitLulus: 8,
    totalUnitSkema: 11,
    rincianUnit: [                // Array detail per unit
      {
        unitId: "DS-1",
        judul: "Unit 1",
        status: "KOMPETEN",
        soalSesuai: 4,
        soalTotal: 4,
        displayStatus: "4 dari 4 soal SESUAI"
      }
    ]
  }
};

/**
 * Rekapitulasi Hasil (Admin View)
 */
const RekapHasilDTO = {
  asesiData: {                    // Ringkasan data asesi
    id: "u1", 
    nama: "Budi", 
    nim: "...", 
    kelas: "..." 
  },
  hasilAkhir: {                   // Extend HasilAkhirDTO
    ...HasilAkhirDTO,
    asesorPraktikum: "Dr. A",     // string (Nama Asesor)
    asesorUnjukDiri: "Dr. B",     // string (Nama Asesor)
    asesorTeoriDetail: [          // Detail siapa menilai unit apa
      {
        unitId: 1,
        unitJudul: "Unit 1",
        asesorId: "as1",
        asesorNama: "Dr. C",
        status: "KOMPETEN"
      }
    ]
  }
};


// ============================================================================
// 2. ENDPOINT: AUTENTIKASI (AUTH)
// ============================================================================

export const AuthAPI = {
  /**
   * Login User (Simulasi SSO)
   * POST /api/auth/login
   * @param {Object} payload { email: string, nama: string }
   * @returns {Promise<UserDTO>} Data user lengkap dengan role
   */
  login: (payload) => {}, // Implementasi: mockLoginSSO
};


// ============================================================================
// 3. ENDPOINT: ROLE ASESI (PESERTA)
// ============================================================================

export const AsesiAPI = {
  /**
   * Mengambil data progress, fase, dan status kelengkapan asesi
   * GET /api/asesi/progress
   * @returns {Promise<ProgressAsesiDTO>}
   */
  getProgress: () => {}, // Implementasi: mockGetProgressAsesi

  /**
   * Menyimpan data form pra-asesmen
   * POST /api/asesi/pra-asesmen
   * @param {Object} data { telepon, tempatLahir, tanggalLahir, alamat }
   * @returns {Promise<{success: boolean}>}
   */
  submitPraAsesmen: (data) => {}, // Implementasi: mockSubmitPraAsesmen

  /**
   * Mengambil daftar unit kompetensi (Learning Path)
   * GET /api/asesi/units
   * @returns {Promise<UnitDTO[]>}
   */
  getUnits: () => {}, // Implementasi: mockGetUnitsForSkema

  /**
   * Mengambil materi pembelajaran untuk satu unit spesifik
   * GET /api/asesi/materi?unitId=...
   * @param {string} unitId 
   * @returns {Promise<MateriDTO[]>}
   */
  getMateriByUnit: (unitId) => {}, // Implementasi: mockGetMateriForUnit

  /**
   * Menandai materi spesifik sudah dilihat/dibuka
   * POST /api/asesi/materi/view
   * @param {string} asesiId 
   * @param {string} materiId 
   * @returns {Promise<ProgressAsesiDTO>} Data progress terbaru
   */
  markMateriViewed: (asesiId, materiId) => {}, // Implementasi: mockMarkMateriViewed

  /**
   * Menandai unit kompetensi selesai (setelah materi habis)
   * POST /api/asesi/units/complete
   * @param {string} asesiId 
   * @param {string} unitId 
   * @returns {Promise<ProgressAsesiDTO>} Data progress terbaru
   */
  markUnitCompleted: (asesiId, unitId) => {}, // Implementasi: mockMarkUnitCompleted

  /**
   * Mengambil soal Tryout (Gabungan semua unit)
   * GET /api/asesi/soal/tryout
   * @param {string} skemaId 
   * @returns {Promise<SoalDTO[]>}
   */
  getSoalTryout: (skemaId) => {}, // Implementasi: mockGetSoalTryoutGabungan

  /**
   * Submit jawaban Tryout
   * POST /api/asesi/tryout/submit
   * @param {string} asesiId 
   * @param {Object} answers { "soalId": "jawaban" }
   * @returns {Promise<{success: boolean}>}
   */
  submitTryout: (asesiId, answers) => {}, // Implementasi: mockSubmitTryout

  /**
   * Cek status ketersediaan ujian (Teori, Praktik, Unjuk Diri)
   * GET /api/asesi/exam-status
   * @param {string} asesiId 
   * @returns {Promise<ExamStatusDTO>}
   */
  getExamStatus: (asesiId) => {}, // Implementasi: mockGetExamStatus

  /**
   * Mengambil soal Ujian Teori (Gabungan Unit)
   * GET /api/asesi/soal/teori
   * @param {string} skemaId 
   * @returns {Promise<SoalDTO[]>}
   */
  getSoalTeori: (skemaId) => {}, // Implementasi via loop mockGetSoalForUnit

  /**
   * Submit jawaban Ujian Teori
   * POST /api/asesi/exams/teori/submit
   * @param {string} asesiId 
   * @param {Object} answers { "soalId": "jawaban" }
   * @returns {Promise<{success: boolean}>}
   */
  submitUjianTeori: (asesiId, answers) => {}, // Implementasi: mockSubmitUjianTeori

  /**
   * Mengambil soal Ujian Praktikum (Studi Kasus)
   * GET /api/asesi/soal/praktikum
   * @param {string} skemaId 
   * @returns {Promise<SoalPraktikumDTO[]>}
   */
  getSoalPraktikum: (skemaId) => {}, // Implementasi: mockGetSoalPraktikumGabungan

  /**
   * Upload file jawaban Praktikum
   * POST /api/asesi/exams/praktikum/submit
   * @param {string} asesiId 
   * @param {string} fileName (Simulasi nama file)
   * @returns {Promise<{success: boolean}>}
   */
  submitPraktikum: (asesiId, fileName) => {}, // Implementasi: mockSubmitPraktikum

  /**
   * Konfirmasi selesai Unjuk Diri (Manual oleh Asesi setelah sesi offline)
   * POST /api/asesi/exams/unjuk-diri/complete
   * @param {string} asesiId 
   * @returns {Promise<{success: boolean}>}
   */
  completeUnjukDiri: (asesiId) => {}, // Implementasi: mockMarkUnjukDiriCompleted

  /**
   * Melihat hasil penilaian akhir dan kelulusan
   * GET /api/asesi/results
   * @param {string} asesiId 
   * @returns {Promise<HasilAkhirDTO>}
   */
  getHasilAkhir: (asesiId) => {}, // Implementasi: mockGetHasilAkhir

  /**
   * Melihat jadwal umum (Linimasa)
   * GET /api/asesi/schedule
   * @param {string} skemaId 
   * @returns {Promise<LinimasaDTO[]>}
   */
  getJadwalUmum: (skemaId) => {}, // Implementasi: mockGetLinimasa

  /**
   * Melihat jadwal personal (Plotting Ujian Offline)
   * GET /api/asesi/schedule/offline
   * @param {string} asesiId 
   * @returns {Promise<SesiUjianOfflineDTO[]>}
   */
  getJadwalPersonal: (asesiId) => {}, // Implementasi: mockGetPlottingAsesi
};


// ============================================================================
// 4. ENDPOINT: ROLE ASESOR (PENILAI)
// ============================================================================

export const AsesorAPI = {
  /**
   * Mengambil daftar tugas penilaian (Teori/Praktik/Unjuk Diri)
   * GET /api/asesor/penugasan
   * @param {string} asesorId 
   * @returns {Promise<PenugasanDTO[]>}
   */
  getPenugasan: (asesorId) => {}, // Implementasi: mockGetPenugasanAsesor

  /**
   * Mengambil detail satu tugas penilaian
   * GET /api/asesor/penugasan/:id
   * @param {string} penugasanId 
   * @returns {Promise<PenugasanDTO>}
   */
  getDetailPenugasan: (penugasanId) => {}, // Implementasi: mockGetPenugasanDetail

  /**
   * Menyimpan nilai dan feedback untuk tugas
   * POST /api/asesor/penugasan/:id/submit
   * @param {string} penugasanId 
   * @param {number} nilai 
   * @param {string} status ("KOMPETEN" | "BELUM_KOMPETEN")
   * @param {string} feedback 
   * @returns {Promise<PenugasanDTO>}
   */
  submitNilai: (penugasanId, nilai, status, feedback) => {}, // Implementasi: mockSubmitNilai

  /**
   * Mengambil jadwal kegiatan/menguji
   * GET /api/asesor/schedule
   * @param {string} skemaId (Biasanya "ALL")
   * @returns {Promise<LinimasaDTO[]>}
   */
  getJadwal: (skemaId) => {}, // Implementasi: mockGetLinimasa
};


// ============================================================================
// 5. ENDPOINT: ROLE ADMIN (PENGELOLA)
// ============================================================================

export const AdminAPI = {
  // --- DASHBOARD & USER ---
  
  /**
   * Statistik Dashboard Utama
   * GET /api/admin/stats
   * @returns {Promise<{totalAsesi, totalAsesor, totalPenugasan, pendingGrading, readyForExam}>}
   */
  getStats: () => {}, // Implementasi: mockGetStatistics

  /**
   * Manajemen User (List & Filter)
   * GET /api/admin/users
   * @returns {Promise<UserDTO[]>}
   */
  getAllUsers: () => {}, // Implementasi: mockGetAllUsers (bisa difilter di FE/BE)

  /**
   * Ubah Role User (Promote/Demote)
   * POST /api/admin/users/:id/role
   * @param {string} userId 
   * @param {string} newRole 
   * @returns {Promise<UserDTO>}
   */
  updateUserRole: (userId, newRole) => {}, // Implementasi: mockUpdateUserRole

  // --- MANAJEMEN SKEMA & TAHUN AJARAN ---

  /**
   * List Semua Skema
   * GET /api/admin/skema
   * @returns {Promise<SkemaDTO[]>}
   */
  getSkema: () => {}, // Implementasi: mockGetAllSkema

  /**
   * Buat Skema Baru
   * POST /api/admin/skema
   * @param {Object} data { id, judul, deskripsi }
   * @returns {Promise<SkemaDTO>}
   */
  createSkema: (data) => {}, // Implementasi: mockCreateSkema

  /**
   * Hapus Skema
   * DELETE /api/admin/skema/:id
   * @param {string} skemaId 
   * @returns {Promise<{success: boolean}>}
   */
  deleteSkema: (skemaId) => {}, // Implementasi: mockDeleteSkema

  /**
   * Ambil List Tahun Ajaran per Skema
   * GET /api/admin/skema/:id/years
   * @param {string} skemaId 
   * @returns {Promise<string[]>} List tahun ["2024/2025", "2023/2024"]
   */
  getYearsForSkema: (skemaId) => {}, // Implementasi: mockGetYearsForSkema

  /**
   * Tambah Tahun Ajaran Baru (Duplikasi Konten Opsional)
   * POST /api/admin/skema/:id/years
   * @param {string} skemaId 
   * @param {string} tahunBaru 
   * @param {string|null} copyFromTahun 
   * @returns {Promise<string[]>}
   */
  addYearToSkema: (skemaId, tahunBaru, copyFromTahun) => {}, // Implementasi: mockAddYearToSkema

  /**
   * Hapus Tahun Ajaran
   * DELETE /api/admin/skema/:id/years/:tahun
   * @param {string} skemaId 
   * @param {string} tahunAjaran 
   * @returns {Promise<SkemaDTO>}
   */
  deleteYearFromSkema: (skemaId, tahunAjaran) => {}, // Implementasi: mockDeleteYearFromSkema

  // --- MANAJEMEN KONTEN (UNIT, MATERI, SOAL) ---

  /**
   * List Unit Kompetensi (Filter per Tahun)
   * GET /api/admin/units
   * @param {string} skemaId 
   * @param {string} tahunAjaran 
   * @returns {Promise<UnitDTO[]>}
   */
  getUnits: (skemaId, tahunAjaran) => {}, // Implementasi: mockGetUnitsForSkema

  /**
   * Create Unit
   * POST /api/admin/units
   */
  createUnit: (skemaId, data) => {}, // Implementasi: mockCreateUnit

  /**
   * Update Unit
   * PUT /api/admin/units/:id
   */
  updateUnit: (skemaId, unitId, data) => {}, // Implementasi: mockUpdateUnit

  /**
   * Delete Unit
   * DELETE /api/admin/units/:id
   */
  deleteUnit: (skemaId, unitId) => {}, // Implementasi: mockDeleteUnit

  /**
   * List Materi per Unit
   * GET /api/admin/materi
   */
  getMateri: (unitId) => {}, // Implementasi: mockGetMateriForUnit

  /**
   * Create Materi
   * POST /api/admin/materi
   */
  createMateri: (unitId, data) => {}, // Implementasi: mockCreateMateri

  /**
   * Update Materi
   * PUT /api/admin/materi/:id
   */
  updateMateri: (unitId, materiId, data) => {}, // Implementasi: mockUpdateMateri

  /**
   * Delete Materi
   * DELETE /api/admin/materi/:id
   */
  deleteMateri: (unitId, materiId) => {}, // Implementasi: mockDeleteMateri

  /**
   * List Soal (Teori/Tryout) per Unit
   * GET /api/admin/soal
   * @param {string} unitId 
   * @param {string} tipeSoal ("UJIAN_TEORI" | "TRYOUT")
   */
  getSoal: (unitId, tipeSoal) => {}, // Implementasi: mockGetSoalForUnit

  /**
   * Create Soal
   * POST /api/admin/soal
   */
  createSoal: (unitId, data) => {}, // Implementasi: mockCreateSoal

  /**
   * Create Soal Tryout (Level Skema)
   * POST /api/admin/tryout
   */
  createTryout: (skemaId, data, tahunAjaran) => {}, // Implementasi: mockCreateTryout

  /**
   * Update Soal
   * PUT /api/admin/soal/:id
   */
  updateSoal: (unitId, soalId, data) => {}, // Implementasi: mockUpdateSoal

  /**
   * Delete Soal
   * DELETE /api/admin/soal/:id
   */
  deleteSoal: (skemaId, soalId) => {}, // Implementasi: mockDeleteSoal

  /**
   * Get/Create/Update Soal Praktikum (Gabungan)
   * POST /api/admin/soal/praktikum
   */
  upsertPraktikum: (skemaId, data) => {}, // Implementasi: mockUpsertPraktikum

  /**
   * Get Soal Praktikum (Untuk Admin)
   */
  getPraktikum: (skemaId, tahunAjaran) => {}, // Implementasi: mockGetSoalPraktikumGabungan

  // --- MANAJEMEN PENILAIAN & JADWAL ---

  /**
   * Penugasan Asesor ke Asesi (Bulk per Unit)
   * POST /api/admin/assignments
   */
  assignAsesor: (asesiId, assignments) => {}, // Implementasi: mockAssignAsesorPerUnit

  /**
   * CRUD Linimasa
   */
  getLinimasa: (skemaId) => {}, // Implementasi: mockGetLinimasa
  createLinimasa: (data) => {}, // Implementasi: mockCreateLinimasa
  updateLinimasa: (id, data) => {}, // Implementasi: mockUpdateLinimasa
  deleteLinimasa: (id) => {}, // Implementasi: mockDeleteLinimasa

  /**
   * CRUD Sesi Ujian Offline
   */
  getSesiUjian: (skemaId) => {}, // Implementasi: mockGetSesiUjianOffline
  getDetailSesi: (id) => {}, // Implementasi: mockGetSesiUjianDetail
  createSesiUjian: (data) => {}, // Implementasi: mockCreateSesiUjianOffline
  updateSesiUjian: (id, data) => {}, // Implementasi: mockUpdateSesiUjianOffline
  deleteSesiUjian: (id) => {}, // Implementasi: mockDeleteSesiUjianOffline

  /**
   * Plotting Peserta ke Sesi Ujian
   */
  getAsesiAvailable: (skemaId, sesiId) => {}, // Implementasi: mockGetAsesiBelumDiplot
  updatePlotting: (sesiId, asesiIds) => {}, // Implementasi: mockUpdatePlottingSesi

  /**
   * Rekapitulasi Hasil Akhir
   * GET /api/admin/results/rekap
   * @returns {Promise<RekapHasilDTO[]>}
   */
  getRekapHasil: () => {}, // Implementasi: mockGetRekapHasilAkhir
};