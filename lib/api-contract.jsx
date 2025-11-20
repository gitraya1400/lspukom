/**
 * ========================================
 * KONTRAK API LMS LSP Polstat STIS
 * ========================================
 *
 * Dokumen ini adalah referensi TUNGGAL (Single Source of Truth) untuk tim Frontend dan Backend.
 * Semua endpoint dan struktur data (DTO - Data Transfer Object) yang disepakati WAJIB
 * mengikuti kontrak ini untuk memastikan integrasi yang stabil.
 *
 * - Frontend: Gunakan ini sebagai acuan untuk tipe data yang diterima (response) dan dikirim (payload).
 * - Backend: Gunakan ini sebagai spesifikasi untuk implementasi endpoint, termasuk struktur response.
 *
 * @status FINAL (Diperbarui 2025-11-16)
 * @author Tim Frontend (RPL2 3SI1 2025)
 */

// ========================================
//   TIPOLOGI DATA (DTO)
// ========================================

/*
// ----- Standar Wrapper API -----
// Semua response sukses dari Backend WAJIB dibungkus seperti ini.
const ApiResponse<T> = {
  success: true,
  message: "Data berhasil diambil.", // Pesan deskriptif
  data: T // T bisa berupa Objek {} atau Array []
}

// ----- Standar Wrapper Error -----
// Semua response error (4xx, 5xx) WAJIB dibungkus seperti ini.
const ApiErrorResponse = {
  success: false,
  message: "Terjadi kesalahan.", // Pesan error yang aman untuk user
  error: "Detail error teknis (opsional, untuk debugging)."
}
*/

/* // ----- Data User (Hasil Login / GET User) -----
// Digunakan untuk auth, manajemen user, dan data pemateri/asesor.
const User = {
  id: "user-123",                 // string (UUID atau ID unik)
  email: "222310001@stis.ac.id",    // string
  nama: "Nadia Nisrina",          // string
  role: "ASESI",                  // "ASESI" | "ASESOR" | "ADMIN_LSP"
  
  // Atribut opsional (bisa null/undefined)
  nim: "222310001",               // string | null (Hanya untuk ASESI)
  nip: "19900101...",             // string | null (Hanya untuk ASESOR / ADMIN_LSP)
  skemaId: "DS",                  // string | null ("ADS" | "DS", hanya untuk ASESI)
  kelas: "4SI1",                  // string | null (Hanya untuk ASESI)
  skemaKeahlian: ["DS", "ADS"]    // string[] | null (Hanya untuk ASESOR)
}
*/

/* // ----- Data Skema (Dropdown, List) -----
const Skema = {
  id: "DS",       // string (ID unik, e.g., "ADS", "DS")
  judul: "Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D4 Statistika.",
  totalUnit: 11   // number (dihitung oleh backend)
}
*/

/* // ----- Data Unit Kompetensi (Halaman Learning & Admin Skema) -----
const Unit = {
  id: "DS-1",        // string (Format: "{skemaId}-{nomorUnit}")
  skemaId: "DS",
  nomorUnit: 1,      // number
  kodeUnit: "J.62DMI00.001.1", // string (Kode resmi skema)
  judul: "Menentukan Objektif Bisnis",
  deskripsi: "Deskripsi lengkap untuk unit...",
  materiCount: 3,    // number (dihitung backend)
  soalCount: 8,      // number (dihitung backend)
  durasiTeori: 20, // number (Durasi ujian teori unit ini, dalam MENIT)
  tahunAjaran: "2024/2025", // tahun ajaran skema ini berlaku
  urutan: 1        // number
}
*/

/* // ----- Data Materi (di dalam Unit Learning) -----
const Materi = {
  id: "materi-1",
  unitId: "DS-1",
  judul: "Video: Pengenalan Unit",
  jenis: "VIDEO", // "VIDEO" | "PDF" | "LINK"
  urlKonten: "https://www.youtube.com/watch?v=...", // URL ke resource
  urutan: 1
}
*/

/* // ----- Data Soal Ujian Teori / Tryout (Esai) -----
// Soal Ujian Praktikum memiliki tipe data sendiri (lihat di bawah)
const Soal = {
  id: "soal-1",
  unitId: "DS-1",         // string (null jika tipeSoal = 'TRYOUT')
  tipeSoal: "UJIAN_TEORI",  // "UJIAN_TEORI" | "TRYOUT"
  tipeJawaban: "ESAI",    // "ESAI" | "PILIHAN_GANDA"
  teks: "Jelaskan konsep utama dari Data Science?",
  tahnAjaran: "2024/2025", // tahun ajaran skema ini berlaku
  urutan: 1,
  
  // Opsional, hanya untuk Pilihan Ganda
  pilihan: ["A. ...", "B. ..."], // string[]
  kunciJawaban: "A",             // string
}
*/

/* // ----- Data Soal Ujian Praktikum (Studi Kasus) -----
// Ini adalah tipe data KHUSUS untuk soal praktikum gabungan
const SoalPraktikum = {
  id: "ADS-PRAKTIKUM-01",
  skemaId: "ADS",
  tipeSoal: "UJIAN_PRAKTIKUM",
  tipeJawaban: "UPLOAD_FILE",
  tahunAjaran: "2024/2025", // tahun ajaran skema ini berlaku
  judul: "Studi Kasus: Analisis Data Penjualan Ritel",
  teks: "Instruksi pengerjaan studi kasus...\n1. Lakukan...\n2. Buat...",
  filePendukung: [ // Array file yang bisa di-download asesi
    { id: 'f1', nama: "dataset_penjualan_2024.csv", url: "/api/download/...", size: "2.1 MB" },
    { id: 'f2', nama: "panduan_pengerjaan.pdf", url: "/api/download/...", size: "310 KB" },
  ]
}
*/

/* // ----- Data Progress Asesi (Halaman Dashboard Asesi & Cek Prasyarat) -----
const ProgressAsesi = {
  asesiId: "user-123",
  skemaId: "DS",
  fase: "PEMBELAJARAN", // "PRA_ASESMEN" | "PEMBELAJARAN" | "TRYOUT" | "UJIAN_TEORI" | "UJIAN_PRAKTIKUM" | "UNJUK_DIRI" | "SELESAI"
  
  // Halaman Learning
  completedUnitIds: ["DS-1", "DS-2"], // string[] (Array ID unit yang selesai)
  viewedMateriIds: ["materi-1", "materi-2"], // string[] (Array ID materi yang dilihat)
  progressPembelajaran: 18, // number (persentase 0-100)

  // Cek Prasyarat
  statusPraAsesmen: "SELESAI", // "BELUM" | "SELESAI"
  tryoutSelesai: true, // boolean
  ujianTeoriSelesai: false, // boolean
  ujianPraktikumSelesai: false, // boolean
  unjukDiriSelesai: false // boolean
}
*/

/* // ----- Data Penugasan (Halaman Asesor) -----
const Penugasan = {
  id: "penugasan-1",
  asesorId: "asesor-1",
  asesiId: "user-123",
  asesiNama: "Nadia Nisrina",
  asesiKelas: "4SI1",                
  skemaId: "DS",
  
  tipe: "TEORI", // "TEORI" | "PRAKTIKUM" | "UNJUK_DIRI"
  
  // Jika tipe = "TEORI", ini diisi
  unitId: 1, // number (Hanya nomor unit)
  unitJudul: "Pengenalan Data Science Advanced",
  
  // Jika tipe = "PRAKTIKUM" atau "UNJUK_DIRI", unitId = null
  // unitJudul: "Studi Kasus Praktikum (Gabungan)", 
  
  statusPenilaian: "BELUM_DINILAI", // "BELUM_DINILAI" | "SELESAI"
  
  // Data hasil penilaian (diisi setelah 'SELESAI')
  nilaiKompetensi: "BELUM_KOMPETEN", // "BELUM_DINILAI" | "KOMPETEN" | "BELUM_KOMPETEN"
  feedback: "Jawaban kurang mendalam...", // string
  tanggalPenilaian: "2025-11-10T10:00:00Z" // string (ISO Date) | null
}
*/

/* // ----- Data Sesi Ujian Offline (Halaman Admin Timeline & Asesi Schedule) -----
const SesiUjianOffline = {
  id: "sesi-ds-1",
  skemaId: "DS",
  tanggal: "2025-11-10T09:00:00Z", // string (ISO Date)
  waktu: "09:00", // string "HH:mm"
  tipeUjian: "UNJUK_DIRI", // "TEORI" | "UNJUK_DIRI" (Praktikum tidak offline)
  ruangan: "Auditorium STIS",
  kapasitas: 50, // number
  durasi: 180, // number (Total durasi sesi dalam MENIT)
  
  // Hanya ada di response GET /:id (Detail)
  asesiTerplot: [User, User, ...] // User[]
}
*/

/* // ----- Data Linimasa (Admin Timeline & Asesi Schedule) -----
const Linimasa = {
  id: "lin-1",
  skemaId: "ADS", // string | "UMUM"
  judul: "Sosialisasi & Pembukaan Sertifikasi ADS",
  deskripsi: "Penjelasan detail tentang ujian kompetensi ADS.",
  tanggal: "2025-11-12T13:00:00Z", // string (ISO Date)
  waktu: "13:00", // string "HH:mm"
  urlZoom: "https://zoom.us/j/12345678901", // string | null
  tipe: "PEMBELAJARAN", // "PEMBELAJARAN" | "PENGUMUMAN"
  pemateriAsesorId: "asesor-ads-1" // string | null
}
*/

/* // ----- Data Status Ujian Asesi (Halaman Asesi Exams) -----
// Endpoint ini MENGGABUNGKAN data ProgressAsesi + SesiUjianOffline
const ExamStatus = {
  teori: {
    status: "SIAP_DIJADWALKAN", // "TERKUNCI" | "MENUNGGU_JADWAL" | "SIAP_DIJADWALKAN" | "SELESAI"
    jadwal: SesiUjianOffline | null // null jika status bukan "SIAP_DIJADWALKAN"
  },
  praktikum: {
    status: "AKTIF", // "TERKUNCI" | "AKTIF" | "SELESAI"
    deadline: "2025-11-09T23:59:59Z" // string (ISO Date) | null (Deadline H-1 Unjuk Diri)
  },
  unjukDiri: {
    status: "MENUNGGU_JADWAL", // "TERKUNCI" | "MENUNGGU_JADWAL" | "SIAP_DIJADWALKAN" | "SELESAI"
    jadwal: SesiUjianOffline | null
  }
}
*/

/* // ----- Data Hasil Akhir (Halaman Asesi Results) -----
const HasilAkhir = {
  asesiId: "user-123",
  skemaId: "DS",
  statusAkhir: "BELUM_KOMPETEN", // "KOMPETEN" | "BELUM_KOMPETEN"
  
  // Penilaian tunggal
  hasilPraktikum: "KOMPETEN", // "BELUM_DINILAI" | "KOMPETEN" | "BELUM_KOMPETEN"
  hasilUnjukDiri: "KOMPETEN", // "BELUM_DINILAI" | "KOMPETEN" | "BELUM_KOMPETEN"
  
  // Penilaian Teori (Akumulasi)
  hasilTeori: {
    statusAkumulasi: "BELUM_KOMPETEN", // "BELUM_DINILAI" | "KOMPETEN" | "BELUM_KOMPETEN"
    totalUnitLulus: 8,
    totalUnitSkema: 11,
    rincianUnit: [
      {
        unitId: "DS-1",
        judul: "Pengenalan Data Science Advanced",
        status: "KOMPETEN", // "BELUM_DINILAI" | "KOMPETEN" | "BELUM_KOMPETEN"
        soalSesuai: 3, // (jumlah soal yg dijawab "SESUAI" oleh Asesor)
        soalTotal: 4   // (total soal esai untuk unit ini)
      },
      // ... (unit lainnya)
    ]
  }
}
*/

/* // ----- Data Rekap Hasil (Halaman Admin Results) -----
// Ini adalah gabungan data Asesi + HasilAkhir + detail Asesor
const RekapHasil = {
  asesiData: { 
    id: "user-123",
    nama: "Nadia Nisrina",
    nim: "222310001",
    kelas: "4SI1" 
  },
  hasilAkhir: {
    ...HasilAkhir, // (Struktur data HasilAkhir di atas)
    
    // Informasi tambahan untuk Admin
    asesorPraktikum: "Dr. Ernawati P", // string (nama asesor)
    asesorUnjukDiri: "Dr. Erni T",    // string (nama asesor)
    asesorTeoriDetail: [
      {
        unitId: 1,
        unitJudul: "Pengenalan Data Science Advanced",
        asesorId: "asesor-1",
        asesorNama: "Dr. Ernawati P"
      },
      // ... (unit lainnya)
    ]
  }
}
*/

/* // ----- Data Statistik Admin (Halaman Admin Dashboard) -----
const StatistikAdmin = {
  totalAsesi: 350,
  totalAsesor: 20,
  totalPenugasan: 3850,
  pendingGrading: 150, // Jumlah penugasan status "BELUM_DINILAI"
  readyForExam: 50     // Jumlah asesi yang sudah fase "TRYOUT" atau "UJIAN_TEORI"
}
*/


// ========================================
//   ENDPOINT MAPPING (FRONTEND -> BACKEND)
// ========================================

/**
 * ========================================
 * 1. AUTHENTICATION (PUBLIC)
 * ========================================
 */

/**
 * [AUTH] Login User (SSO / Manual Mock)
 * Endpoint: POST /api/auth/login
 * Deskripsi: Autentikasi user. Di produksi, ini akan handle callback SSO.
 * Untuk dev, backend bisa membuat/mencari user berdasarkan email & nama.
 * Payload: { email: string, nama: string }
 * Response: ApiResponse<User>
 * Mock: mockLoginSSO
 */


/**
 * ========================================
 * 2. ASESI (ROLE: ASESI)
 * ========================================
 * Catatan: Backend harus mengambil Asesi ID & Skema ID dari token JWT.
 */

/**
 * [ASESI] Mendapatkan Progress Utama Asesi
 * Endpoint: GET /api/asesi/progress
 * Deskripsi: Mengambil data progres Asesi. Dipakai di banyak halaman untuk
 * cek prasyarat (gated content).
 * Response: ApiResponse<ProgressAsesi>
 * Mock: mockGetProgressAsesi
 */

/**
 * [ASESI] Submit Form Pra-Asesmen
 * Endpoint: POST /api/asesi/pra-asesmen
 * Deskripsi: Menyimpan data form pra-asesmen (halaman pertama Asesi).
 * Payload: { telepon: string, tempatLahir: string, tanggalLahir: string, alamat: string }
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockSubmitPraAsesmen
 */

/**
 * [ASESI] Mendapatkan Daftar Unit Kompetensi (Learning)
 * Endpoint: GET /api/asesi/units
 * Deskripsi: Mengambil semua unit kompetensi untuk skema Asesi yang sedang login.
 * Response: ApiResponse<Unit[]>
 * Mock: mockGetUnitsForSkema
 */

/**
 * [ASESI] Mendapatkan Daftar Materi per Unit
 * Endpoint: GET /api/asesi/materi
 * Query: ?unitId=DS-1
 * Deskripsi: Mengambil semua materi untuk 1 unit spesifik.
 * Response: ApiResponse<Materi[]>
 * Mock: mockGetMateriForUnit
 */

/**
 * [ASESI] Menandai Materi Telah Dilihat
 * Endpoint: POST /api/asesi/materi/view
 * Deskripsi: Memberi tahu backend bahwa asesi telah mengklik/membuka materi.
 * Payload: { materiId: string }
 * Response: ApiResponse<ProgressAsesi> (Mengembalikan data progress terbaru)
 * Mock: mockMarkMateriViewed
 */

/**
 * [ASESI] Menandai Unit Selesai (Learning)
 * Endpoint: POST /api/asesi/units/complete
 * Deskripsi: Asesi menekan tombol "Selesaikan Unit" setelah semua materi dilihat.
 * Payload: { unitId: string }
 * Response: ApiResponse<ProgressAsesi> (Mengembalikan data progress terbaru)
 * Mock: mockMarkUnitCompleted
 */

/**
 * [ASESI] Mendapatkan Soal Tryout Gabungan
 * Endpoint: GET /api/asesi/soal/tryout
 * Deskripsi: Mengambil SEMUA soal tipe 'TRYOUT' untuk skema Asesi.
 * Response: ApiResponse<Soal[]>
 * Mock: mockGetSoalTryoutGabungan
 */

/**
 * [ASESI] Submit Jawaban Tryout
 * Endpoint: POST /api/asesi/tryout/submit
 * Deskripsi: Mengirim semua jawaban tryout (esai) setelah timer habis atau user selesai.
 * Payload: { answers: { "soal-id-1": "jawaban...", "soal-id-2": "jawaban..." } }
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockSubmitTryout
 */

/**
 * [ASESI] Mendapatkan Status Ujian (Hub Ujian)
 * Endpoint: GET /api/asesi/exam-status
 * Deskripsi: Endpoint KRUSIAL. Mengambil status semua 3 tipe ujian (Teori, Praktikum, Unjuk Diri)
 * beserta jadwal jika sudah di-plot oleh Admin.
 * Response: ApiResponse<ExamStatus>
 * Mock: mockGetExamStatus
 */

/**
 * [ASESI] Mendapatkan Soal Ujian Teori (Gabungan)
 * Endpoint: GET /api/asesi/soal/teori
 * Deskripsi: Mengambil SEMUA soal tipe 'UJIAN_TEORI' untuk skema Asesi,
 * digabung dari semua unit.
 * Response: ApiResponse<Soal[]>
 * Mock: mockGetSoalForUnit (di-looping di frontend-mock, backend harusnya 1 call)
 */

/**
 * [ASESI] Submit Jawaban Ujian Teori
 * Endpoint: POST /api/asesi/exams/teori/submit
 * Deskripsi: Mengirim semua jawaban ujian teori (esai) setelah timer habis.
 * Payload: { answers: { "soal-id-1": "jawaban...", "soal-id-2": "jawaban..." } }
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockSubmitUjianTeori
 */

/**
 * [ASESI] Mendapatkan Soal Ujian Praktikum (Gabungan)
 * Endpoint: GET /api/asesi/soal/praktikum
 * Deskripsi: Mengambil 1 soal studi kasus praktikum untuk skema Asesi.
 * Response: ApiResponse<SoalPraktikum>
 * Mock: mockGetSoalPraktikumGabungan
 */

/**
 * [ASESI] Submit Jawaban Ujian Praktikum
 * Endpoint: POST /api/asesi/exams/praktikum/submit
 * Deskripsi: Mengunggah file jawaban (.ppt / .pptx) untuk ujian praktikum.
 * Payload: FormData (file upload)
 * Response: ApiResponse<{ success: boolean, fileName: string }>
 * Mock: mockSubmitPraktikum
 */

/**
 * [ASESI] Menandai Selesai Unjuk Diri
 * Endpoint: POST /api/asesi/exams/unjuk-diri/complete
 * Deskripsi: Asesi menekan tombol konfirmasi setelah sesi unjuk diri offline selesai.
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockMarkUnjukDiriCompleted
 */

/**
 * [ASESI] Mendapatkan Hasil Akhir Penilaian
 * Endpoint: GET /api/asesi/results
 * Deskripsi: Mengambil hasil akhir kompilasi dari 3 tipe ujian.
 * Response: ApiResponse<HasilAkhir>
 * Mock: mockGetHasilAkhir
 */

/**
 * [ASESI] Mendapatkan Jadwal Linimasa
 * Endpoint: GET /api/asesi/schedule
 * Deskripsi: Mengambil semua event Linimasa (non-ujian) untuk skema Asesi + UMUM.
 * Response: ApiResponse<Linimasa[]>
 * Mock: mockGetLinimasa
 */

/**
 * [ASESI] Mendapatkan Jadwal Ujian Offline (Plotting)
 * Endpoint: GET /api/asesi/schedule/offline
 * Deskripsi: Mengambil jadwal ujian (Teori/Unjuk Diri) yang di-plot untuk Asesi ini.
 * Response: ApiResponse<SesiUjianOffline[]>
 * Mock: mockGetPlottingAsesi
 */


/**
 * ========================================
 * 3. ASESOR (ROLE: ASESOR)
 * ========================================
 * Catatan: Backend harus mengambil Asesor ID dari token JWT.
 */

/**
 * [ASESOR] Mendapatkan Semua Penugasan
 * Endpoint: GET /api/asesor/penugasan
 * Deskripsi: Mengambil semua list tugas (Teori, Praktikum, Unjuk Diri) untuk Asesor ybs.
 * Response: ApiResponse<Penugasan[]>
 * Mock: mockGetPenugasanAsesor
 */

/**
 * [ASESOR] Mendapatkan Detail 1 Penugasan
 * Endpoint: GET /api/asesor/penugasan/:id
 * Param: :id (ID Penugasan)
 * Deskripsi: Mengambil detail 1 tugas, termasuk jawaban asesi (link/teks).
 * Response: ApiResponse<Penugasan>
 * Mock: mockGetPenugasanDetail
 */

/**
 * [ASESOR] Submit Penilaian
 * Endpoint: POST /api/asesor/penugasan/:id/submit
 * Param: :id (ID Penugasan)
 * Deskripsi: Menyimpan hasil penilaian (Kompeten/Belum Kompeten) dan feedback.
 * Payload: { nilaiKompetensi: "KOMPETEN" | "BELUM_KOMPETEN", feedback: string }
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockSubmitNilai
 */

/**
 * [ASESOR] Mendapatkan Daftar Asesi yang Ditugaskan
 * Endpoint: GET /api/asesor/asesi-list
 * Deskripsi: Mengambil daftar unik Asesi yang ditugaskan ke Asesor ybs.
 * Response: ApiResponse<{ id, nama, skemaId, belumDinilai, selesai, firstPendingTaskId, firstCompletedTaskId }[]>
 * Catatan: Backend perlu melakukan agregasi data penugasan per asesi.
 * Mock: mockGetPenugasanAsesor (lalu di-proses di frontend)
 */

/**
 * [ASESOR] Mendapatkan Jadwal Linimasa
 * Endpoint: GET /api/asesor/schedule
 * Deskripsi: Mengambil semua event Linimasa (non-ujian) untuk skema Asesor + UMUM.
 * Response: ApiResponse<Linimasa[]>
 * Mock: mockGetLinimasa
 */


/**
 * ========================================
 * 4. ADMIN LSP (ROLE: ADMIN_LSP)
 * ========================================
 */

/**
 * [ADMIN] Mendapatkan Statistik Dashboard
 * Endpoint: GET /api/admin/stats
 * Deskripsi: Mengambil data agregat untuk dashboard Admin.
 * Response: ApiResponse<StatistikAdmin>
 * Mock: mockGetStatistics
 */

/**
 * [ADMIN] Mendapatkan Daftar User (General)
 * Endpoint: GET /api/admin/users
 * Deskripsi: Mengambil semua user.
 * Response: ApiResponse<User[]>
 * Mock: mockGetAllUsers
 */

/**
 * [ADMIN] Mendapatkan Daftar User (Filter per Role)
 * Endpoint: GET /api/admin/users
 * Query: ?role=ASESI (atau ASESOR, ADMIN_LSP)
 * Deskripsi: Mengambil user berdasarkan role.
 * Response: ApiResponse<User[]>
 * Mock: mockGetAsesiUsers, mockGetAsesorUsers, mockGetAdminUsers
 */

/**
 * [ADMIN] Update Role User
 * Endpoint: POST /api/admin/users/:id/role
 * Param: :id (User ID)
 * Deskripsi: Mengubah role user (hanya bisa ASESOR <-> ADMIN_LSP).
 * Payload: { role: "ASESOR" | "ADMIN_LSP" }
 * Response: ApiResponse<User> (User yang sudah di-update)
 * Mock: mockUpdateUserRole
 */

/**
 * [ADMIN] Mendapatkan Daftar Skema
 * Endpoint: GET /api/admin/skema
 * Deskripsi: Mengambil semua skema sertifikasi yang ada.
 * Response: ApiResponse<Skema[]>
 * Mock: mockGetAllSkema
 */

/**
 * [ADMIN] Membuat Skema Baru
 * Endpoint: POST /api/admin/skema
 * Deskripsi: Membuat skema sertifikasi baru.
 * Payload: { id: string (e.g., "AI_OPS"), judul: string, deskripsi: string }
 * Response: ApiResponse<Skema> (Skema yang baru dibuat)
 * Mock: mockCreateSkema
 */

/**
 * [ADMIN] Menghapus Skema
 * Endpoint: DELETE /api/admin/skema/:id
 * Param: :id (Skema ID)
 * Deskripsi: Menghapus skema beserta unit dan soal terkait.
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockDeleteSkema
 */

/**
 * [ADMIN] Mendapatkan Daftar Unit per Skema
 * Endpoint: GET /api/admin/units
 * Query: ?skemaId=DS
 * Deskripsi: Mengambil semua unit untuk 1 skema (mirip Asesi).
 * Response: ApiResponse<Unit[]>
 * Mock: mockGetUnitsForSkema
 */



/**
 * [ADMIN] Membuat Unit Kompetensi Baru
 * Endpoint: POST /api/admin/units
 * Query: ?skemaId=DS
 * Payload: { nomorUnit, kodeUnit, judul, deskripsi, durasiTeori }
 * Response: ApiResponse<Unit>
 * Mock: mockCreateUnit
 */

/**
 * [ADMIN] Update Unit Kompetensi
 * Endpoint: PUT /api/admin/units/:id
 * Param: :id (Unit ID, e.g., "DS-1")
 * Payload: { nomorUnit, kodeUnit, judul, deskripsi, durasiTeori }
 * Response: ApiResponse<Unit>
 * Mock: mockUpdateUnit
 */

/**
 * [ADMIN] Menghapus Unit Kompetensi
 * Endpoint: DELETE /api/admin/units/:id
 * Param: :id (Unit ID, e.g., "DS-1")
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockDeleteUnit
 */

/**
 * [ADMIN] Mendapatkan Daftar Materi per Unit
 * Endpoint: GET /api/admin/materi
 * Query: ?unitId=DS-1
 * Deskripsi: Mengambil semua materi untuk 1 unit (mirip Asesi).
 * Response: ApiResponse<Materi[]>
 * Mock: mockGetMateriForUnit
 */



/**
 * [ADMIN] Membuat Materi Baru
 * Endpoint: POST /api/admin/materi
 * Query: ?unitId=DS-1
 * Payload: { judul, jenis, urlKonten, file(jika jenis=PDF) }
 * Response: ApiResponse<Materi>
 * Mock: mockCreateMateri
 */

/**
 * [ADMIN] Update Materi
 * Endpoint: PUT /api/admin/materi/:id
 * Param: :id (Materi ID)
 * Payload: { judul, jenis, urlKonten, file(jika jenis=PDF) }
 * Response: ApiResponse<Materi>
 * Mock: mockUpdateMateri
 */

/**
 * [ADMIN] Menghapus Materi
 * Endpoint: DELETE /api/admin/materi/:id
 * Param: :id (Materi ID)
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockDeleteMateri
 */

/**
 * [ADMIN] Mendapatkan Daftar Soal per Unit/Skema
 * Endpoint: GET /api/admin/soal
 * Query: ?unitId=DS-1&tipeSoal=UJIAN_TEORI (Untuk Ujian Teori)
 * Query: ?skemaId=DS&tipeSoal=TRYOUT (Untuk Tryout)
 * Response: ApiResponse<Soal[]>
 * Mock: mockGetSoalForUnit
 */



/**
 * [ADMIN] Membuat Soal Baru (Teori atau Tryout)
 * Endpoint: POST /api/admin/soal
 * Query: ?unitId=DS-1 (Jika UJIAN_TEORI)
 * Query: ?skemaId=DS (Jika TRYOUT)
 * Payload: { tipeSoal, tipeJawaban, teks, pilihan, kunciJawaban }
 * Response: ApiResponse<Soal>
 * Mock: mockCreateSoal, mockCreateTryout
 */

/**
 * [ADMIN] Update Soal (Teori atau Tryout)
 * Endpoint: PUT /api/admin/soal/:id
 * Param: :id (Soal ID)
 * Payload: { tipeJawaban, teks, pilihan, kunciJawaban }
 * Response: ApiResponse<Soal>
 * Mock: mockUpdateSoal
 */

/**
 * [ADMIN] Membuat/Update Soal Praktikum
 * Endpoint: POST /api/admin/soal/praktikum
 * Query: ?skemaId=DS
 * Deskripsi: Endpoint khusus untuk Create/Update soal praktikum gabungan per skema.
 * Payload: { id(opsional), judul, teks, filePendukung[] }
 * Response: ApiResponse<SoalPraktikum>
 * Mock: mockUpsertPraktikum
 */

/**
 * [ADMIN] Menghapus Soal (Semua Tipe)
 * Endpoint: DELETE /api/admin/soal/:id
 * Param: :id (Soal ID)
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockDeleteSoal
 */

/**
 * [ADMIN] Menugaskan Asesor ke Asesi (Bulk)
 * Endpoint: POST /api/admin/assignments
 * Deskripsi: Menyimpan/Update penugasan asesor untuk 1 Asesi.
 * Payload: {
 * asesiId: string,
 * assignments: [
 * { tipe: "TEORI", unitId: 1, asesorId: "asesor-1" },
 * { tipe: "TEORI", unitId: 2, asesorId: "asesor-2" },
 * { tipe: "PRAKTIKUM", unitId: null, asesorId: "asesor-1" },
 * { tipe: "UNJUK_DIRI", unitId: null, asesorId: "asesor-2" }
 * ]
 * }
 * Response: ApiResponse<{ success: boolean, count: number }>
 * Mock: mockAssignAsesorPerUnit
 */

/**
 * [ADMIN] Mendapatkan Semua Linimasa
 * Endpoint: GET /api/admin/timeline
 * Query: ?skemaId=ALL (atau DS, ADS)
 * Deskripsi: Mengambil data Linimasa (non-ujian) untuk kalender.
 * Response: ApiResponse<Linimasa[]>
 * Mock: mockGetLinimasa
 */

/**
 * [ADMIN] Membuat Kegiatan Linimasa Baru
 * Endpoint: POST /api/admin/linimasa
 * Deskripsi: Membuat event baru (Pengumuman / Sesi Pembelajaran Zoom).
 * Payload: { skemaId, tipe, judul, deskripsi, tanggal, waktu, urlZoom, pemateriAsesorId }
 * Response: ApiResponse<Linimasa> (Event yang baru dibuat)
 * Mock: mockCreateLinimasa
 */
 


/**
 * [ADMIN] Update Kegiatan Linimasa
 * Endpoint: PUT /api/admin/linimasa/:id
 * Param: :id (Linimasa ID)
 * Payload: { (Data yang sama dengan create) }
 * Response: ApiResponse<Linimasa>
 * Mock: mockUpdateLinimasa
 */
 
/**
 * [ADMIN] Hapus Kegiatan Linimasa
 * Endpoint: DELETE /api/admin/linimasa/:id
 * Param: :id (Linimasa ID)
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockDeleteLinimasa
 */

/**
 * [ADMIN] Mendapatkan Semua Sesi Ujian Offline
 * Endpoint: GET /api/admin/offline-exam-sesi
 * Query: ?skemaId=ALL (atau DS, ADS)
 * Deskripsi: Mengambil data Sesi Ujian (ujian) untuk kalender.
 * Response: ApiResponse<SesiUjianOffline[]>
 * Mock: mockGetSesiUjianOffline
 */

/**
 * [ADMIN] Membuat Sesi Ujian Offline Baru
 * Endpoint: POST /api/admin/offline-exam-sesi
 * Deskripsi: Membuat jadwal sesi ujian (Teori / Unjuk Diri).
 * Payload: { skemaId, tipeUjian, tanggal, waktu, ruangan, kapasitas, durasi }
 * Response: ApiResponse<SesiUjianOffline> (Sesi yang baru dibuat)
 * Mock: mockCreateSesiUjianOffline
 */
 

 
/**
 * [ADMIN] Update Sesi Ujian Offline
 * Endpoint: PUT /api/admin/offline-exam-sesi/:id
 * Param: :id (Sesi ID)
 * Payload: { (Data yang sama dengan create) }
 * Response: ApiResponse<SesiUjianOffline>
 * Mock: mockUpdateSesiUjianOffline
 */
 
/**
 * [ADMIN] Hapus Sesi Ujian Offline
 * Endpoint: DELETE /api/admin/offline-exam-sesi/:id
 * Param: :id (Sesi ID)
 * Response: ApiResponse<{ success: boolean }>
 * Mock: mockDeleteSesiUjianOffline
 */

/**
 * [ADMIN] Mendapatkan Detail Sesi Ujian (Termasuk Peserta)
 * Endpoint: GET /api/admin/offline-exam-sesi/:id
 * Param: :id (Sesi ID)
 * Deskripsi: Mengambil detail 1 sesi ujian, TERMASUK daftar Asesi yang sudah di-plot.
 * Response: ApiResponse<SesiUjianOffline> (dengan properti `asesiTerplot` berisi User[])
 * Mock: mockGetSesiUjianDetail
 */

/**
 * [ADMIN] Mendapatkan Asesi yang Tersedia untuk Sesi
 * Endpoint: GET /api/admin/asesi-available
 * Query: ?skemaId=DS&sesiId=sesi-ds-1
 * Deskripsi: Mengambil daftar Asesi (per kelas) yang BELUM di-plot ke sesi manapun.
 * Response: ApiResponse< { namaKelas: string, asesi: User[] }[] >
 * Mock: mockGetAsesiBelumDiplot
 */

/**
 * [ADMIN] Update Plotting Peserta Sesi
 * Endpoint: POST /api/admin/offline-exam-sesi/:id/plotting
 * Param: :id (Sesi ID)
 * Deskripsi: Mengirim daftar LENGKAP Asesi ID yang di-plot untuk sesi ini.
 * Payload: { asesiIds: ["user-1", "user-2", ...] }
 * Response: ApiResponse<{ success: boolean, count: number }>
 * Mock: mockUpdatePlottingSesi
 */

/**
 * [ADMIN] Mendapatkan Rekapitulasi Hasil Akhir (Semua Asesi)
 * Endpoint: GET /api/admin/results/rekap
 * Deskripsi: Mengambil data hasil akhir semua asesi untuk halaman rekap admin.
 * Response: ApiResponse<RekapHasil[]>
 * Mock: mockGetRekapHasilAkhir
 */