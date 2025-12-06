/**
 * API Mock untuk Learning Management System (LMS) - LSP Polstat STIS
 * 
 * File ini menyediakan simulasi backend API menggunakan in-memory database.
 * Digunakan untuk development dan testing sebelum integrasi dengan backend real.
 * 
 * Struktur Data:
 * - Skema Sertifikasi (ADS, DS)
 * - Unit Kompetensi per Skema
 * - Soal (Tryout, Teori, Praktikum)
 * - Materi Pembelajaran
 * - User Management (Admin, Asesor, Asesi)
 * - Progress Pembelajaran Asesi
 * - Penugasan Asesor ke Asesi
 * - Jadwal Ujian Offline & Linimasa
 * 
 * @module api-mock
 * @version 3.0
 */

// ==================== KONSTANTA & KONFIGURASI ====================

const DEFAULT_TAHUN_AJARAN = "2024/2025";

const SKEMA_ADS_UNITS = [
  { nomorUnit: 1, kodeUnit: "J.62DMI00.004.1", judul: "Mengumpulkan data", durasiTeori: 15 },
  { nomorUnit: 2, kodeUnit: "J.62DMI00.005.1", judul: "Menelaah Data", durasiTeori: 20 },
  { nomorUnit: 3, kodeUnit: "J.62DMI00.006.1", judul: "Memvalidasi Data", durasiTeori: 20 },
  { nomorUnit: 4, kodeUnit: "J.62DMI00.007.1", judul: "Menentukan Objek Data", durasiTeori: 20 },
  { nomorUnit: 5, kodeUnit: "J.62DMI00.008.1", judul: "Membersihkan Data", durasiTeori: 15 },
  { nomorUnit: 6, kodeUnit: "J.62DMI00.009.1", judul: "Mengkonstruksi Data", durasiTeori: 25 },
  { nomorUnit: 7, kodeUnit: "J.62DMI00.010.1", judul: "Menentukan Label Data", durasiTeori: 25 },
  { nomorUnit: 8, kodeUnit: "J.62DMI00.013.1", judul: "Membangun Model", durasiTeori: 15 },
  { nomorUnit: 9, kodeUnit: "J.62DMI00.014.1", judul: "Mengevaluasi Hasil Pemodelan", durasiTeori: 30 },
];

const SKEMA_DS_UNITS = [
  { nomorUnit: 1, kodeUnit: "J.62DMI00.001.1", judul: "Menentukan Objektif Bisnis", durasiTeori: 20 },
  { nomorUnit: 2, kodeUnit: "J.62DMI00.002.1", judul: "Menentukan Tujuan Teknis Data Science", durasiTeori: 25 },
  { nomorUnit: 3, kodeUnit: "J.62DMI00.005.1", judul: "Menelaah Data", durasiTeori: 25 },
  { nomorUnit: 4, kodeUnit: "J.62DMI00.006.1", judul: "Memvalidasi Data", durasiTeori: 20 },
  { nomorUnit: 5, kodeUnit: "J.62DMI00.007.1", judul: "Menentukan Objek Data", durasiTeori: 15 },
  { nomorUnit: 6, kodeUnit: "J.62DMI00.008.1", judul: "Membersihkan Data", durasiTeori: 30 },
  { nomorUnit: 7, kodeUnit: "J.62DMI00.009.1", judul: "Mengkonstruksi Data", durasiTeori: 30 },
  { nomorUnit: 8, kodeUnit: "J.62DMI00.012.1", judul: "Membangun Skenario Model", durasiTeori: 25 },
  { nomorUnit: 9, kodeUnit: "J.62DMI00.013.1", judul: "Membangun Model", durasiTeori: 25 },
  { nomorUnit: 10, kodeUnit: "J.62DMI00.014.1", judul: "Mengevaluasi Hasil Pemodelan", durasiTeori: 20 },
  { nomorUnit: 11, kodeUnit: "J.62DMI00.015.1", judul: "Melakukan Proses Review Pemodelan", durasiTeori: 35 },
];

// ==================== DATABASE IN-MEMORY ====================

const allSkemaDb = new Map();
allSkemaDb.set("ADS", {
  id: "ADS",
  judul: "Associate Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D3 Statistika.",
  totalUnit: SKEMA_ADS_UNITS.length,
  tahunAjaranList: [DEFAULT_TAHUN_AJARAN],
});
allSkemaDb.set("DS", {
  id: "DS",
  judul: "Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D4 Statistika.",
  totalUnit: SKEMA_DS_UNITS.length,
  tahunAjaranList: [DEFAULT_TAHUN_AJARAN],
});

const allUnitsDb = new Map();
allUnitsDb.set(
  "ADS",
  SKEMA_ADS_UNITS.map((unit, idx) => ({
    id: `ADS-${unit.nomorUnit}`,
    skemaId: "ADS",
    tahunAjaran: DEFAULT_TAHUN_AJARAN,
    nomorUnit: unit.nomorUnit,
    kodeUnit: unit.kodeUnit,
    judul: unit.judul,
    deskripsi: `Deskripsi lengkap untuk ${unit.judul}`,
    materiCount: unit.nomorUnit === 1 ? 3 : 1,
    soalCount: 2,
    durasiTeori: unit.durasiTeori || 15,
    urutan: idx + 1,
  }))
);
allUnitsDb.set(
  "DS",
  SKEMA_DS_UNITS.map((unit, idx) => ({
    id: `DS-${unit.nomorUnit}`,
    skemaId: "DS",
    tahunAjaran: DEFAULT_TAHUN_AJARAN,
    nomorUnit: unit.nomorUnit,
    kodeUnit: unit.kodeUnit,
    judul: unit.judul,
    deskripsi: `Deskripsi lengkap untuk ${unit.judul}`,
    materiCount: unit.nomorUnit === 1 ? 3 : 1,
    soalCount: 2,
    durasiTeori: unit.durasiTeori || 15,
    urutan: idx + 1,
  }))
);

const allSoalDb = new Map();
allUnitsDb.get("ADS").forEach((unit) => {
  const unitId = unit.id;
  allSoalDb.set(unitId, [
    {
      id: `${unitId}-tryout-1`,
      unitId,
      tipeSoal: "TRYOUT",
      tipeJawaban: "ESAI",
      teks: `[Tryout ADS] Jelaskan konsep utama dari ${unit.judul}?`,
      urutan: 1,
    },
    {
      id: `${unitId}-teori-1`,
      unitId,
      tipeSoal: "UJIAN_TEORI",
      tipeJawaban: "ESAI",
      teks: `[Ujian Teori ADS] Apa definisi dan aplikasi dari ${unit.judul}?`,
      kunciJawaban: "definisi|aplikasi",
      urutan: 1,
    },
  ]);
});

allUnitsDb.get("DS").forEach((unit) => {
  const unitId = unit.id;
  allSoalDb.set(unitId, [
    {
      id: `${unitId}-tryout-1`,
      unitId,
      tipeSoal: "TRYOUT",
      tipeJawaban: "ESAI",
      teks: `[Tryout DS] Jelaskan konsep utama dari ${unit.judul}?`,
      urutan: 1,
    },
    {
      id: `${unitId}-teori-1`,
      unitId,
      tipeSoal: "UJIAN_TEORI",
      tipeJawaban: "ESAI",
      teks: `[Ujian Teori DS] Apa perbedaan ${unit.judul} dengan metode konvensional?`,
      kunciJawaban: "definisi|aplikasi",
      urutan: 1,
    },
  ]);
});

const allPraktikumSoalDb = new Map();
allPraktikumSoalDb.set("ADS", [
  {
    id: "ADS-PRAKTIKUM-01",
    skemaId: "ADS",
    tahunAjaran: DEFAULT_TAHUN_AJARAN,
    tipeSoal: "UJIAN_PRAKTIKUM",
    tipeJawaban: "UPLOAD_FILE",
    judul: "Studi Kasus: Analisis Data Penjualan Ritel",
    teks: "Anda ditugaskan sebagai Associate Data Scientist di sebuah perusahaan ritel. Perusahaan ingin memahami pola pembelian pelanggan untuk mengoptimalkan strategi marketing.\n\nTugas Anda:\n1. Lakukan pembersihan dan pra-pemrosesan data.\n2. Lakukan analisis deskriptif untuk menemukan wawasan (misal: produk terlaris, waktu pembelian tersibuk).\n3. Buat segmentasi pelanggan sederhana (misal: berdasarkan frekuensi atau nilai pembelian).\n4. Buat visualisasi data yang relevan.\n5. Susun temuan Anda dalam file presentasi (.ppt) untuk dipresentasikan saat Unjuk Diri.",
    filePendukung: [
      { id: "f1", nama: "dataset_penjualan_2024.csv", url: "/api/mock-download/dataset_penjualan_2024.csv", size: "2.1 MB" },
      { id: "f2", nama: "panduan_pengerjaan.pdf", url: "/api/mock-download/panduan_pengerjaan.pdf", size: "310 KB" },
      { id: "f3", nama: "template_presentasi.pptx", url: "/api/mock-download/template_presentasi.pptx", size: "88 KB" },
    ],
    createdAt: new Date(),
  },
]);

allPraktikumSoalDb.set("DS", [
  {
    id: "DS-PRAKTIKUM-01",
    skemaId: "DS",
    tahunAjaran: DEFAULT_TAHUN_AJARAN,
    tipeSoal: "UJIAN_PRAKTIKUM",
    tipeJawaban: "UPLOAD_FILE",
    judul: "Studi Kasus: Prediksi Churn Pelanggan Telekomunikasi",
    teks: "Anda adalah Data Scientist di perusahaan telekomunikasi. Disediakan data historis pelanggan (demografi, layanan, tagihan, dan status churn).\n\nTugas Anda:\n1. Lakukan Exploratory Data Analysis (EDA) dan Feature Engineering.\n2. Bangun model klasifikasi untuk memprediksi pelanggan yang akan churn.\n3. Evaluasi performa model Anda (cantumkan metrik seperti Accuracy, Precision, Recall, F1-Score, dan ROC-AUC).\n4. Berikan rekomendasi bisnis berdasarkan temuan model.\n5. Susun laporan dan analisis Anda dalam file presentasi (.ppt) untuk Unjuk Diri.",
    filePendukung: [
      { id: "f1", nama: "dataset_churn_telekomunikasi.csv", url: "/api/mock-download/dataset_churn_telekomunikasi.csv", size: "15.4 MB" },
      { id: "f2", nama: "kamus_data.pdf", url: "/api/mock-download/kamus_data.pdf", size: "450 KB" },
      { id: "f3", nama: "template_presentasi_ds.pptx", url: "/api/mock-download/template_presentasi_ds.pptx", size: "92 KB" },
    ],
    createdAt: new Date(),
  },
]);

// ==================== DATA GENERATORS ====================

const firstNames = ["Nadia", "Rezky", "Rani", "Galang", "Nailatur", "Meldiro", "Naila", "Budi", "Siti", "Ahmad", "Dewi", "Eko", "Fitri", "Hadi", "Indah", "Joko"];
const lastNames = ["Nisrina", "Kilwouw", "Kusumawati", "Nugroho", "Rajaa", "Ferreira", "Hanifa", "Santoso", "Nurhaliza", "Ridho", "Lestari", "Prasetyo", "Handayani", "Wijaya", "Permata", "Susanto"];
const getRandomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

function generateAsesiData() {
  const asesiList = [];
  const dsKelasList = ["4SI1", "4SI2", "4SD1", "4SE1", "4SK1"];

  for (let i = 1; i <= 350; i++) {
    const nim = String(222310000 + i);
    let kelas = dsKelasList[i % dsKelasList.length];
    asesiList.push({
      id: `asesi-ds-${i}`,
      email: `${nim}@stis.ac.id`,
      nama: getRandomName(),
      role: "ASESI",
      nim,
      skemaId: "DS",
      kelas: kelas,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  for (let i = 1; i <= 12; i++) {
    const nim = String(222350000 + i);
    asesiList.push({
      id: `asesi-ads-3d31-${i}`,
      email: `${nim}@stis.ac.id`,
      nama: getRandomName(),
      role: "ASESI",
      nim,
      skemaId: "ADS",
      kelas: "3D31",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const otherAdsKelas = ["3D32", "3D33"];
  for (let i = 1; i <= 50; i++) {
    const nim = String(222360000 + i);
    let kelas = otherAdsKelas[i % otherAdsKelas.length];
    asesiList.push({
      id: `asesi-ads-other-${i}`,
      email: `${nim}@stis.ac.id`,
      nama: getRandomName(),
      role: "ASESI",
      nim,
      skemaId: "ADS",
      kelas: kelas,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return asesiList;
}

function generateAsesorData() {
  const asesorList = [];
  const dosenNames = ["Dr. Ernawati P", "Nori Wilantika", "Dr. Erni T", "Dr. Novi H", "Ibnu Santoso", "Rini Rahani", "Budi Yuniarto", "Sukim", "Winih Budiarti", "Sri Herwanto"];
  
  for (let i = 1; i <= 10; i++) {
    asesorList.push({
      id: `asesor-ds-${i}`,
      email: `asesor.ds${i}@stis.ac.id`,
      nama: dosenNames[i - 1],
      role: "ASESOR",
      nip: String(198001010000000000 + i),
      skemaKeahlian: ["DS"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  for (let i = 1; i <= 10; i++) {
    asesorList.push({
      id: `asesor-ads-${i}`,
      email: `asesor.ads${i}@stis.ac.id`,
      nama: dosenNames[i % dosenNames.length],
      role: "ASESOR",
      nip: String(198001010000000100 + i),
      skemaKeahlian: ["ADS"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  asesorList.push({
    id: `asesor-all-1`,
    email: `asesor1@stis.ac.id`,
    nama: "Mark Ferreira",
    role: "ASESOR",
    nip: "197001011000001",
    skemaKeahlian: ["ADS", "DS"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  asesorList.push({
    id: "asesor-client-test",
    email: "asesor2@stis.ac.id",
    nama: "Steve Rogers",
    role: "ASESOR",
    nip: "198501012025011002",
    skemaKeahlian: ["ADS", "DS"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return asesorList;
}

const adminUsers = [
  { id: "admin-1", email: "admin@stis.ac.id", nama: "admin", role: "ADMIN_LSP", nip: "1991011991001", createdAt: new Date(), updatedAt: new Date() },
  { id: "admin-2", email: "admin2@stis.ac.id", nama: "Super Admin", role: "ADMIN_LSP", nip: "199101011991001001", createdAt: new Date(), updatedAt: new Date() },
  { id: "admin-3", email: "admin1@stis.ac.id", nama: "admin1", role: "ADMIN_LSP", nip: "1991011991003", createdAt: new Date(), updatedAt: new Date() },
];

const DEMO_AKUN_ASESI = [
  { id: "asesi-dummy-1", email: "222313206@stis.ac.id", nama: "Meldiro da Cruz F", role: "ASESI", nim: "222313206", skemaId: "ADS", kelas: "3D31", createdAt: new Date(), updatedAt: new Date() },
  { id: "asesi-dummy-2", email: "222313190@stis.ac.id", nama: "Raya Kilwouw", role: "ASESI", nim: "222313190", skemaId: "DS", kelas: "4SI1", createdAt: new Date(), updatedAt: new Date() },
];

const DEMO_AKUN_ASESI_STARTER = [
  { id: "1-starter", email: "22234567@stis.ac.id", nama: "Meldiro Cruz", role: "ASESI", nim: "222313300", skemaId: "ADS", kelas: "3D31", createdAt: new Date(), updatedAt: new Date() },
  { id: "2-starter", email: "222345678@stis.ac.id", nama: "Meldiro da Cruz", role: "ASESI", nim: "222345678", skemaId: "ADS", kelas: "3D31", createdAt: new Date(), updatedAt: new Date() }
];

const DEMO_AKUN_ASESI_GRADING = [
  { id: "asesi-grading-demo", email: "2223456788@stis.ac.id", nama: "Meldiro Fereira", role: "ASESI", nim: "222399999", skemaId: "ADS", kelas: "3D32", createdAt: new Date(), updatedAt: new Date() }
];

const asesiUsers = [...DEMO_AKUN_ASESI_STARTER, ...DEMO_AKUN_ASESI, ...DEMO_AKUN_ASESI_GRADING, ...generateAsesiData()];
const asesorUsers = generateAsesorData();
const allUsers = [...adminUsers, ...asesiUsers, ...asesorUsers];

// ==================== PROGRESS & STORAGE MANAGEMENT ====================

const MOCK_DB_PROGRESS_KEY = "mockProgressMap";

function getProgressMapFromStorage() {
  if (typeof window === "undefined") return new Map();

  const data = localStorage.getItem(MOCK_DB_PROGRESS_KEY);
  if (data) {
    try {
      const arr = JSON.parse(data);
      const map = new Map(arr);
      map.forEach((value) => {
        value.completedUnitIds = new Set(value.completedUnitIds);
        value.viewedMateriIds = new Set(value.viewedMateriIds || []);
        value.unjukDiriSelesai = value.unjukDiriSelesai || false;
      });
      return map;
    } catch (e) {
      console.error("Gagal memuat mock DB progress:", e);
      return new Map();
    }
  }
  return new Map();
}

function getMateriMapFromStorage() {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem("mockMateriDb");
    if (!raw) return new Map();
    const arr = JSON.parse(raw);
    return new Map(arr);
  } catch (e) {
    console.error("Gagal memuat mockMateriDb:", e);
    return new Map();
  }
}

function saveProgressMapToStorage(map) {
  if (typeof window === "undefined") return;

  const arr = Array.from(map.entries()).map(([key, value]) => {
    return [
      key,
      {
        ...value,
        completedUnitIds: Array.from(value.completedUnitIds),
        viewedMateriIds: Array.from(value.viewedMateriIds || new Set()),
      },
    ];
  });

  localStorage.setItem(MOCK_DB_PROGRESS_KEY, JSON.stringify(arr));
}

let progressMap = getProgressMapFromStorage();

function calculateProgress(asesiId) {
  const progress = progressMap.get(asesiId);
  if (!progress) return 0;
  const unitsInSkema = allUnitsDb.get(progress.skemaId) || [];
  if (unitsInSkema.length === 0) return 0;
  return Math.round((progress.completedUnitIds.size / unitsInSkema.length) * 100);
}

// ==================== PENUGASAN & PENILAIAN ====================

const penugasanMap = new Map();

function generatePenugasanData() {
  let penugasanId = 0;
  
  const starterIds = DEMO_AKUN_ASESI_STARTER.map(u => u.id);
  
  const selectedAsesi = asesiUsers
    .filter((a) => !starterIds.includes(a.id)) 
    .slice(0, 150);

  selectedAsesi.forEach((asesi) => {
    const skema = asesi.skemaId;
    const units = allUnitsDb.get(skema) || [];
    const asesorList = asesorUsers.filter((a) => a.skemaKeahlian.includes(skema));

    const isGradingDemoAccount = asesi.id === "asesi-grading-demo";
    const isBulkKompeten = Math.random() > 0.2; 
    const bulkStatusNilai = isBulkKompeten ? "KOMPETEN" : "BELUM KOMPETEN";

    units.forEach((unit, idx) => {
      const asesor = asesorList[Math.floor(Math.random() * asesorList.length)];
      const id = `penugasan-${penugasanId++}`;
      
      let statusPenilaian, nilaiKompetensi, nilai, feedback;

      if (isGradingDemoAccount) {
        // ✅ Rina: Sebagian sudah dinilai, sebagian belum
        const randomStatus = Math.random();
        if (randomStatus > 0.6) {
          // 40% sudah dinilai
          statusPenilaian = "SELESAI";
          const isKompeten = Math.random() > 0.3;
          nilaiKompetensi = isKompeten ? "KOMPETEN" : "BELUM KOMPETEN";
          nilai = isKompeten ? 85 : 65;
          feedback = isKompeten ? "Sudah baik, pertahankan" : "Perlu perbaikan di bagian analisis";
        } else {
          // 60% belum dinilai
          statusPenilaian = "BELUM_DINILAI";
          nilaiKompetensi = "BELUM_DINILAI";
          nilai = null;
          feedback = null;
        }
      } else {
        // Akun dummy lainnya: Semua sudah dinilai
        statusPenilaian = "SELESAI";
        nilaiKompetensi = bulkStatusNilai;
        nilai = isBulkKompeten ? 85 : 50;
        feedback = "Generated by Mock System";
      }

      penugasanMap.set(id, {
        id: id,
        asesorId: asesor.id,
        asesiId: asesi.id,
        asesiNama: asesi.nama,
        asesiKelas: asesi.kelas, 
        skemaId: skema,
        unitId: unit.nomorUnit,
        unitJudul: unit.judul,
        tipe: "TEORI",
        statusPenilaian: statusPenilaian,
        nilai: nilai,
        feedback: feedback,
        nilaiKompetensi: nilaiKompetensi,
      });
    });

    const asesorPraktikum = asesorList[Math.floor(Math.random() * asesorList.length)];
    const idPraktikum = `penugasan-${penugasanId++}`;
    penugasanMap.set(idPraktikum, {
      id: idPraktikum,
      asesorId: asesorPraktikum.id,
      asesiId: asesi.id,
      asesiNama: asesi.nama,
      asesiKelas: asesi.kelas, 
      skemaId: skema,
      unitId: null,
      unitJudul: "Studi Kasus Praktikum (Gabungan)",
      tipe: "PRAKTIKUM",
      statusPenilaian: isGradingDemoAccount ? "BELUM_DINILAI" : "SELESAI",
      nilai: isGradingDemoAccount ? null : (isBulkKompeten ? 90 : 40),
      feedback: null,
      nilaiKompetensi: isGradingDemoAccount ? "BELUM DINILAI" : bulkStatusNilai,
    });

    const asesorUnjukDiri = asesorList[Math.floor(Math.random() * asesorList.length)];
    const idUnjukDiri = `penugasan-${penugasanId++}`;
    penugasanMap.set(idUnjukDiri, {
      id: idUnjukDiri,
      asesorId: asesorUnjukDiri.id,
      asesiId: asesi.id,
      asesiNama: asesi.nama,
      asesiKelas: asesi.kelas, 
      skemaId: skema,
      unitId: null,
      unitJudul: "Presentasi Unjuk Diri (Gabungan)",
      tipe: "UNJUK_DIRI",
      statusPenilaian: isGradingDemoAccount ? "BELUM_DINILAI" : "SELESAI",
      nilai: isGradingDemoAccount ? null : (isBulkKompeten ? 88 : 55),
      feedback: null,
      nilaiKompetensi: isGradingDemoAccount ? "BELUM DINILAI" : bulkStatusNilai,
    });
  });
}
generatePenugasanData();

const sesiUjianOfflineDb = new Map();
const plottingDb = new Map();

const linimasaDb = new Map();
const todayForLinimasa = new Date();
const mockLinimasaEvents = [
  {
    id: "lin-1",
    skemaId: "ADS",
    judul: "Sosialisasi & Pembukaan Sertifikasi ADS",
    deskripsi: "Penjelasan detail tentang ujian kompetensi ADS.",
    tanggal: new Date(todayForLinimasa.getTime() + 2 * 24 * 60 * 60 * 1000),
    waktu: "13:00",
    urlZoom: "https://zoom.us/j/12345678901",
    tipe: "PEMBELAJARAN",
    pemateriAsesorId: "asesor-ads-1",
  },
  {
    id: "lin-2",
    skemaId: "DS",
    judul: "Sosialisasi & Pembukaan Sertifikasi DS",
    deskripsi: "Penjelasan detail tentang ujian kompetensi DS.",
    tanggal: new Date(todayForLinimasa.getTime() + 2 * 24 * 60 * 60 * 1000),
    waktu: "15:00",
    urlZoom: "https://zoom.us/j/12345678902",
    tipe: "PEMBELAJARAN",
    pemateriAsesorId: "asesor-ds-1",
  },
  {
    id: "lin-3",
    skemaId: "UMUM",
    judul: "Sesi Q&A Pembelajaran (Semua Skema)",
    deskripsi: "Tanya jawab dengan asesor terkait materi.",
    tanggal: new Date(todayForLinimasa.getTime() + 7 * 24 * 60 * 60 * 1000),
    waktu: "14:00",
    urlZoom: "https://zoom.us/j/12345678903",
    tipe: "PEMBELAJARAN",
    pemateriAsesorId: "asesor-all-1",
  },
];
mockLinimasaEvents.forEach((event) => linimasaDb.set(event.id, event));

function generateSesiUjianData() {
  const today = new Date();

  const sesiDS_UnjukDiri = {
    id: "sesi-ds-unjukdiri-1",
    skemaId: "DS",
    tanggal: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
    waktu: "09:00",
    tipeUjian: "UNJUK_DIRI",
    ruangan: "Auditorium STIS",
    kapasitas: 50,
    durasi: 30,
    kelas: "4SI1",
  };
  sesiUjianOfflineDb.set(sesiDS_UnjukDiri.id, sesiDS_UnjukDiri);
  plottingDb.set(sesiDS_UnjukDiri.id, ["asesi-ds-1", "asesi-ds-2"]);

  const sesiADS_Teori = {
    id: "sesi-ads-teori-1",
    skemaId: "ADS",
    tanggal: new Date(today.getTime()),
    waktu: "09:00",
    tipeUjian: "TEORI",
    ruangan: "Ruang 301 (ADS)",
    kapasitas: 30,
    durasi: 185,
    kelas: "3SD1",
  };
  sesiUjianOfflineDb.set(sesiADS_Teori.id, sesiADS_Teori);
  plottingDb.set(sesiADS_Teori.id, ["asesi-dummy-1"]);

  const sesiDS_Teori = {
    id: "sesi-ds-teori-1",
    skemaId: "DS",
    tanggal: new Date(today.getTime()),
    waktu: "09:00",
    tipeUjian: "TEORI",
    ruangan: "Ruang 302 (DS)",
    kapasitas: 30,
    durasi: 270,
    kelas: "4SI1",
  };
  sesiUjianOfflineDb.set(sesiDS_Teori.id, sesiDS_Teori);
  plottingDb.set(sesiDS_Teori.id, ["asesi-dummy-2"]);
}
generateSesiUjianData();

const tahunAjaranDb = new Map();
for (const skema of allSkemaDb.values()) {
  if (!tahunAjaranDb.has(skema.id)) {
    tahunAjaranDb.set(skema.id, new Set(skema.tahunAjaranList || []));
  }
}

export async function mockGetYearsForSkema(skemaId) {
  await new Promise((r) => setTimeout(r, 200));
  const set = tahunAjaranDb.get(skemaId);
  return set ? Array.from(set).sort().reverse() : [];
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockGetAllSkema() {
  await delay(300);
  return Array.from(allSkemaDb.values());
}

export async function mockCreateSkema(skemaData) {
  await delay(500);
  const cleanId = skemaData.id.toUpperCase().replace(/\s+/g, "_");
  if (allSkemaDb.has(cleanId)) throw new Error(`ID Skema '${cleanId}' sudah ada.`);

  const newSkema = {
    id: cleanId,
    judul: skemaData.judul,
    deskripsi: skemaData.deskripsi || "",
    totalUnit: 0,
    tahunAjaranList: ["2024/2025"],
  };

  allSkemaDb.set(newSkema.id, newSkema);
  allUnitsDb.set(newSkema.id, []);
  if (typeof tahunAjaranDb !== "undefined")
    tahunAjaranDb.set(newSkema.id, new Set(["2024/2025"]));
  if (typeof allPraktikumSoalDb !== "undefined")
    allPraktikumSoalDb.set(newSkema.id, []);
  if (typeof globalThis !== "undefined") {
    if (!globalThis.allPraktikumSoalDb)
      globalThis.allPraktikumSoalDb = allPraktikumSoalDb;
    globalThis.allPraktikumSoalDb.set(
      newSkema.id,
      globalThis.allPraktikumSoalDb.get(newSkema.id) || []
    );
  }

  return newSkema;
}

export async function mockDeleteSkema(skemaId) {
  await delay(500);
  if (!allSkemaDb.has(skemaId)) {
    throw new Error(`Skema dengan ID '${skemaId}' tidak ditemukan.`);
  }

  allSkemaDb.delete(skemaId);
  allUnitsDb.delete(skemaId);
  allPraktikumSoalDb.delete(skemaId);

  return { success: true, message: `Skema ${skemaId} berhasil dihapus.` };
}

export async function mockAddYearToSkema(
  skemaId,
  tahunBaru,
  duplikasiDariTahun = null
) {
  await new Promise((r) => setTimeout(r, 400));
  if (!tahunAjaranDb.has(skemaId)) tahunAjaranDb.set(skemaId, new Set());
  const set = tahunAjaranDb.get(skemaId);
  if (set.has(tahunBaru)) throw new Error("Tahun ajaran sudah ada.");
  set.add(tahunBaru);

  // Update list tahun di objek skema
  const skema = allSkemaDb.get(skemaId);
  if (skema) {
    skema.tahunAjaranList = Array.from(
      new Set([...(skema.tahunAjaranList || []), tahunBaru])
    );
    allSkemaDb.set(skemaId, skema);
  }

  // LOGIKA DUPLIKASI
  if (duplikasiDariTahun) {
    const units = allUnitsDb.get(skemaId) || [];
    const sourceUnits = units.filter((u) => u.tahunAjaran === duplikasiDariTahun);

    const unitsToCopy = sourceUnits.map((u) => {
      const cleanTahun = tahunBaru.replace(/[^0-9]/g, "");
      const suffix =
        Date.now().toString(36).slice(-6) +
        Math.random().toString(36).slice(2, 6);
      // Format ID Baru (Generated)
      const newId = `${skemaId}-U${u.nomorUnit}-${cleanTahun}-${suffix}`;
      return {
        ...u,
        id: newId,
        tahunAjaran: tahunBaru,
      };
    });

    const mergedUnits = [...units, ...unitsToCopy];
    allUnitsDb.set(skemaId, mergedUnits);

    const materiDb =
      typeof globalThis !== "undefined" && globalThis.allMateriDb
        ? globalThis.allMateriDb
        : new Map();
    const soalDb =
      typeof globalThis !== "undefined" && globalThis.allSoalDb
        ? globalThis.allSoalDb
        : allSoalDb;

    // Loop unit lama untuk copy materi & soal
    // PENTING: Gunakan for...of loop agar bisa await
    for (let i = 0; i < sourceUnits.length; i++) {
      const oldUnit = sourceUnits[i];
      const newUnit = unitsToCopy[i];
      const oldUnitId = oldUnit.id;
      const newUnitId = newUnit.id;

      // 1. Copy Materi
      // PENTING: Panggil mockGetMateriForUnit untuk memastikan data (termasuk fallback) terambil
      const materiLama = await mockGetMateriForUnit(oldUnitId);
      
      if (materiLama && materiLama.length > 0) {
        const newMateri = materiLama.map((m) => ({
          ...m,
          id: `MAT-${newUnitId}-${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          unitId: newUnitId,
        }));
        materiDb.set(newUnitId, newMateri);
      } else {
        materiDb.set(newUnitId, []); // Pastikan kosong jika sumber kosong
      }

      // 2. Copy Soal
      const soalLama = soalDb.get(oldUnitId) || [];
      if (soalLama && soalLama.length > 0) {
        const newSoalList = soalLama.map((s) => ({
          ...s,
          id: `SOAL-${newUnitId}-${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          unitId: newUnitId,
          tahunAjaran: tahunBaru,
        }));
        soalDb.set(newUnitId, newSoalList);
      } else {
        soalDb.set(newUnitId, []);
      }
    }

    // Update Global Refs
    if (typeof globalThis !== "undefined") {
      if (globalThis.allMateriDb) globalThis.allMateriDb = materiDb;
      if (globalThis.allSoalDb) globalThis.allSoalDb = soalDb;
    }

    // Copy Soal Praktikum (Gabungan)
    let praktikumList = allPraktikumSoalDb.get(skemaId) || [];
    const praktikumToCopy = praktikumList.filter(
      (p) => p.tahunAjaran === duplikasiDariTahun
    );
    praktikumList = [
      ...praktikumList,
      ...praktikumToCopy.map((p) => ({
        ...p,
        id: `${skemaId}-PRAKTIKUM-${tahunBaru.replace(/\D/g, "")}-${Date.now()}`,
        tahunAjaran: tahunBaru,
      })),
    ];
    allPraktikumSoalDb.set(skemaId, praktikumList);
  }

  return Array.from(set).sort().reverse();
}

export async function mockDeleteYearFromSkema(skemaId, tahunAjaran) {
  await delay(500);

  const skema = allSkemaDb.get(skemaId);
  if (!skema) throw new Error("Skema tidak ditemukan");

  // Hapus dari list di object skema
  const set = new Set(skema.tahunAjaranList || []);
  set.delete(tahunAjaran);
  skema.tahunAjaranList = Array.from(set);
  allSkemaDb.set(skemaId, skema);

  // --- TAMBAHKAN BAGIAN INI ---
  // Hapus juga dari referensi database tahun ajaran agar dropdown terupdate
  if (typeof tahunAjaranDb !== "undefined" && tahunAjaranDb.has(skemaId)) {
    tahunAjaranDb.get(skemaId).delete(tahunAjaran);
  }
  // ----------------------------

  const units = allUnitsDb.get(skemaId) || [];
  const unitsToDelete = units.filter((u) => u.tahunAjaran === tahunAjaran);
  const remainingUnits = units.filter((u) => u.tahunAjaran !== tahunAjaran);

  unitsToDelete.forEach((u) => {
    if (globalThis.allMateriDb) globalThis.allMateriDb.delete(u.id);
    allSoalDb.delete(u.id);
  });
  allUnitsDb.set(skemaId, remainingUnits);

  let praktikumList = allPraktikumSoalDb.get(skemaId) || [];
  praktikumList = praktikumList.filter((p) => p.tahunAjaran !== tahunAjaran);
  allPraktikumSoalDb.set(skemaId, praktikumList);

  return skema;
}

export async function mockLoginSSO(email, nama) {
  await delay(800);
  let user = allUsers.find((u) => u.email === email);
  if (!user) {
    const isNIM = /^\d{9}@stis\.ac\.id$/.test(email);

    let skemaId, kelas;
    const nimStr = email.split("@")[0];

    const dsKelasList = ["4SI1", "4SI2", "4SD1", "4SE1", "4SK1"];
    const adsKelasList = ["3SD1", "3SD2", "3SD3"];

    if (nimStr.startsWith("22235")) {
      skemaId = "ADS";
      kelas = adsKelasList[Math.floor(Math.random() * adsKelasList.length)];
    } else {
      skemaId = "DS";
      kelas = dsKelasList[Math.floor(Math.random() * dsKelasList.length)];
    }

    user = {
      id: `user-${Date.now()}`,
      email,
      nama,
      role: isNIM ? "ASESI" : "ASESOR",
      nim: isNIM ? nimStr : undefined,
      nip: !isNIM ? "199001010000001001" : undefined,
      skemaId: isNIM ? skemaId : undefined,
      kelas: isNIM ? kelas : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    allUsers.push(user);
  }
  return user;
}

export async function mockGetAllUsers() {
  await delay(600);
  return allUsers;
}

export async function mockGetAsesiUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ASESI");
}

export async function mockGetAsesorUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ASESOR");
}

export async function mockGetAdminUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ADMIN_LSP");
}

export async function mockUpdateUserRole(userId, newRole) {
  await delay(500);
  const user = allUsers.find((u) => u.id === userId);
  if (!user) throw new Error("User tidak ditemukan");
  if (user.role === "ASESI")
    throw new Error("Role Asesi tidak dapat diubah secara manual!");
  user.role = newRole;
  user.updatedAt = new Date();
  return user;
}

export async function mockGetUnitsForSkema(skemaId, tahunAjaran) {
  await delay(400);
  const units = allUnitsDb.get(skemaId) || [];
  if (tahunAjaran) return units.filter((u) => u.tahunAjaran === tahunAjaran);
  return units;
}

export async function mockGetMateriForUnit(unitId) {
  await delay(300);

  const db =
    typeof globalThis !== "undefined" && globalThis.allMateriDb
      ? globalThis.allMateriDb
      : new Map();

  // Jika data sudah ada di DB (hasil simpanan atau duplikasi), kembalikan langsung
  if (db.has(unitId)) {
    return db.get(unitId) || [];
  }

  // --- LOGIKA BARU ---
  // Cek apakah ini Unit "Bawaan/Lama" atau "Unit Baru/Generated"
  // Unit Baru biasanya punya ID panjang dengan timestamp (misal: "ADS-U1-20252026-xyz...")
  const isGeneratedUnit = unitId.length > 15 || unitId.includes("-U");

  // Jika Unit Baru (dan tidak ada di DB), berarti KOSONG (Tanpa Duplikasi)
  if (isGeneratedUnit) {
    return [];
  }

  // Jika Unit Lama (Tahun Saat Ini), terapkan logika 3 vs 1
  let fallback = [];
  
  // Cek apakah ini Unit 1 (ID berakhiran "-1", tapi bukan "-10", "-11" dst)
  const isUnitSatu = unitId.endsWith("-1") && !unitId.match(/-\d{2,}$/);

  if (isUnitSatu) {
    // === UNIT 1: 3 Materi (Video, PDF, Link) ===
    fallback = [
      {
        id: `${unitId}-m1`,
        unitId,
        judul: "Video: Pengenalan Unit",
        jenis: "VIDEO",
        urlKonten: "https://youtu.be/NqFsSUu-4pk?si=h11YIsvai7wYrmY7",
        urutan: 1,
      },
      {
        id: `${unitId}-m2`,
        unitId,
        judul: "Materi PDF: Konsep Inti",
        jenis: "PDF",
        urlKonten:
          "https://drive.google.com/file/d/1faM_ZHi2xzEI6ZaEYh203x9qhyZliJSO/view?usp=drive_link",
        urutan: 2,
      },
      {
        id: `${unitId}-m3`,
        unitId,
        judul: "Link: Bacaan Wikipedia",
        jenis: "LINK",
        urlKonten: "https://id.wikipedia.org/wiki/Sains_data",
        urutan: 3,
      },
    ];
  } else {
    // === UNIT LAIN: Hanya 1 Materi (PDF) ===
    const nomorUnit = unitId.split("-").pop();
    fallback = [
      {
        id: `${unitId}-m1`,
        unitId,
        judul: `Materi PDF: Modul Pembelajaran Unit ${nomorUnit}`,
        jenis: "PDF",
        urlKonten: "https://drive.google.com/file/d/1faM_ZHi2xzEI6ZaEYh203x9qhyZliJSO/view?usp=drive_link",
        urutan: 1,
      },
    ];
  }

  // Simpan fallback ke memory agar konsisten
  try {
    if (typeof globalThis !== "undefined") {
      if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
      globalThis.allMateriDb.set(unitId, fallback.slice());
    }
  } catch (e) {
    // ignore
  }

  return fallback;
}

export async function mockGetSoalForUnit(unitId, tipeSoal) {
  await delay(300);
  const db =
    typeof globalThis !== "undefined" && globalThis.allSoalDb
      ? globalThis.allSoalDb
      : allSoalDb;
  const allSoal = db.get(unitId) || [];
  if (tipeSoal === "SEMUA" || !tipeSoal) {
    allSoal.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    return allSoal;
  }

  const filtered = allSoal.filter((s) => s.tipeSoal === tipeSoal);
  filtered.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  return filtered;
}

export async function mockGetSoalTryoutGabungan(skemaId, tahunAjaran) {
  await delay(600);
  const unitsInSkema = allUnitsDb.get(skemaId) || [];
  const filteredUnits = tahunAjaran
    ? unitsInSkema.filter((u) => u.tahunAjaran === tahunAjaran)
    : unitsInSkema;
  let allTryoutSoal = [];

  filteredUnits.forEach((unit) => {
    const db =
      typeof globalThis !== "undefined" && globalThis.allSoalDb
        ? globalThis.allSoalDb
        : allSoalDb;
    const soalUnit = db.get(unit.id) || [];
    const tryoutSoal = soalUnit.filter((s) => s.tipeSoal === "TRYOUT");
    allTryoutSoal.push(...tryoutSoal);
  });
  allTryoutSoal.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  return allTryoutSoal;
}

export async function mockGetSoalPraktikumGabungan(skemaId, tahunAjaran) {
  await delay(400);

  const db =
    typeof globalThis !== "undefined" && globalThis.allPraktikumSoalDb
      ? globalThis.allPraktikumSoalDb
      : allPraktikumSoalDb;

  let list = db.get(skemaId) || [];

  if (tahunAjaran) {
    list = list.filter((p) => p.tahunAjaran === tahunAjaran);
  }

  if (
    (!Array.isArray(list) || list.length === 0) &&
    (!tahunAjaran || tahunAjaran === DEFAULT_TAHUN_AJARAN)
  ) {
    return [
      {
        id: `${skemaId}-PRAKTIKUM-FALLBACK`,
        skemaId: skemaId,
        tahunAjaran: tahunAjaran || DEFAULT_TAHUN_AJARAN,
        tipeSoal: "UJIAN_PRAKTIKUM",
        tipeJawaban: "UPLOAD_FILE",
        judul: "Studi Kasus Praktikum (Gabungan)",
        teks: "Deskripsi studi kasus tidak ditemukan. Silakan unduh file soal di bawah ini.",
        filePendukung: [
          {
            id: "f1",
            nama: "soal-praktikum.zip",
            url: "/api/mock-download/soal-praktikum-umum.zip",
            size: "1.0 MB",
          },
        ],
        createdAt: new Date(),
      },
    ];
  }

  return list;
}

export async function mockGetProgressAsesi(asesiId) {
  await delay(400);

  progressMap = getProgressMapFromStorage();
  let progress = progressMap.get(asesiId);
  const user = allUsers.find((u) => u.id === asesiId);

  if (!user) {
    const skemaId = "ADS";
    progress = {
      asesiId,
      skemaId,
      fase: "PRA_ASESMEN",
      completedUnitIds: new Set(),
      viewedMateriIds: new Set(),
      progressPembelajaran: 0,
      statusPraAsesmen: "BELUM",
      tryoutSelesai: false,
      ujianTeoriSelesai: false,
      ujianPraktikumSelesai: false,
      unjukDiriSelesai: false,
    };
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds),
    };
  }

  const skemaId = user.skemaId || "ADS";
  const unitsInSkema = allUnitsDb.get(skemaId) || [];
  
  // Cek apakah ini akun starter (Meldiro dkk)
  const isStarterAccount = DEMO_AKUN_ASESI_STARTER.some(
    (d) => d.id === user.id || d.email === user.email
  );

  // Jika AKUN STARTER: Biarkan logic original (harus mengerjakan dari awal)
  if (isStarterAccount) {
     if (!progress) {
        progress = {
          asesiId,
          skemaId,
          fase: "PRA_ASESMEN",
          completedUnitIds: new Set(),
          viewedMateriIds: new Set(),
          progressPembelajaran: 0,
          statusPraAsesmen: "BELUM",
          tryoutSelesai: false,
          ujianTeoriSelesai: false,
          ujianPraktikumSelesai: false,
          unjukDiriSelesai: false,
        };
        progressMap.set(asesiId, progress);
        saveProgressMapToStorage(progressMap);
     }
  } 
  // [MODIFIKASI] Jika BUKAN akun starter (Akun Dummy Lain + Akun Grading):
  // Kita paksa statusnya jadi SELESAI semua tahap ujian agar muncul di Rekap Admin
  else {
    if (!progress) {
        const completedIds = new Set(unitsInSkema.map((u) => u.id));
        progress = {
          asesiId,
          skemaId,
          fase: "SELESAI", // Paksa fase selesai
          completedUnitIds: completedIds,
          viewedMateriIds: new Set(),
          progressPembelajaran: 100,
          statusPraAsesmen: "SELESAI",
          tryoutSelesai: true,
          ujianTeoriSelesai: true,      // Paksa TRUE
          ujianPraktikumSelesai: true,  // Paksa TRUE
          unjukDiriSelesai: true,       // Paksa TRUE
        };
        progressMap.set(asesiId, progress);
        saveProgressMapToStorage(progressMap);
    }
  }

  return {
    ...progress,
    completedUnitIds: Array.from(progress.completedUnitIds),
    viewedMateriIds: Array.from(progress.viewedMateriIds || new Set()),
    ujianPraktikumSelesai: progress.ujianPraktikumSelesai || false,
    unjukDiriSelesai: progress.unjukDiriSelesai || false,
  };
}

export async function mockMarkMateriViewed(asesiId, materiId) {
  await delay(200);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  if (progress) {
    progress.viewedMateriIds.add(materiId);
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} melihat materi ${materiId}.`);
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds),
    };
  }
  throw new Error("Progress Asesi tidak ditemukan saat menandai materi.");
}

export async function mockMarkUnitCompleted(asesiId, unitId) {
  await delay(500);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  if (progress) {
    progress.completedUnitIds.add(unitId);
    progress.progressPembelajaran = calculateProgress(asesiId);
    saveProgressMapToStorage(progressMap);
    console.log(
      `[Mock] Asesi ${asesiId} menyelesaikan unit ${unitId}. Progress: ${progress.progressPembelajaran}%`
    );
    return {
      ...progress,
      completedUnitIds: Array.from(progress.completedUnitIds),
      viewedMateriIds: Array.from(progress.viewedMateriIds),
    };
  }
  throw new Error("Progress Asesi tidak ditemukan saat menyelesaikan unit.");
}

export async function mockSubmitTryout(asesiId, answers) {
  await delay(700);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);
  if (progress) {
    progress.tryoutSelesai = true;
    progress.fase = "TRYOUT";
    saveProgressMapToStorage(progressMap);
    console.log(
      `[Mock] Asesi ${asesiId} menyelesaikan tryout. Jawaban:`,
      answers
    );
  }
  return { success: true, message: "Tryout berhasil disubmit." };
}

export async function mockSubmitUjianTeori(asesiId, answers) {
  await delay(1000);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.ujianTeoriSelesai = true;
    progress.fase = "UJIAN_TEORI";
    saveProgressMapToStorage(progressMap);
    console.log(
      `[Mock] Asesi ${asesiId} menyelesaikan Ujian Teori. Jawaban:`,
      answers
    );
  }
  return { success: true, message: "Ujian Teori berhasil disubmit." };
}

export async function mockSubmitPraktikum(asesiId, fileName) {
  await delay(1000);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.ujianPraktikumSelesai = true;
    saveProgressMapToStorage(progressMap);
    console.log(
      `[Mock] Asesi ${asesiId} mengupload file praktikum: ${fileName}`
    );
  }
  return { success: true, message: "File praktikum berhasil diunggah." };
}

export async function mockMarkUnjukDiriCompleted(asesiId) {
  await delay(600);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.unjukDiriSelesai = true;
    progress.fase = "SELESAI";
    saveProgressMapToStorage(progressMap);
    console.log(`[Mock] Asesi ${asesiId} menandai Unjuk Diri telah selesai.`);
  }
  return { success: true, message: "Unjuk Diri berhasil ditandai selesai." };
}

export async function mockSubmitPraAsesmen(asesiId, data) {
  await delay(1000);

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (progress) {
    progress.statusPraAsesmen = "SELESAI";
    saveProgressMapToStorage(progressMap);
    console.log(
      `[Mock] Asesi ${asesiId} menyelesaikan Pra-Asesmen. Data:`,
      data
    );
  }
  return { success: true, message: "Pra-Asesmen berhasil disubmit." };
}

export async function mockGetPenugasanAsesor(asesorId) {
  await delay(500);
  return Array.from(penugasanMap.values()).filter(
    (p) => p.asesorId === asesorId
  );
}

export async function mockGetPenugasanAsesi(asesiId) {
  await delay(500);
  return Array.from(penugasanMap.values()).filter((p) => p.asesiId === asesiId);
}

export async function mockGetPenugasanDetail(penugasanId) {
  await delay(300);
  const penugasan = penugasanMap.get(penugasanId);
  if (!penugasan) {
    throw new Error("Penugasan tidak ditemukan");
  }
  return penugasan;
}

export async function mockGetPlottingAsesi(asesiId) {
  await delay(300);
  const myPlotting = [];
  for (const [sesiId, asesiIds] of plottingDb.entries()) {
    if (asesiIds.includes(asesiId)) {
      const sesiDetail = sesiUjianOfflineDb.get(sesiId);
      if (sesiDetail) {
        myPlotting.push(sesiDetail);
      }
    }
  }
  return myPlotting;
}

export async function mockGetPenugasanAsesiCount() {
  await delay(300);
  return penugasanMap.size;
}

export async function mockGetPendingGradingCount() {
  await delay(300);
  return Array.from(penugasanMap.values()).filter(
    (p) => p.statusPenilaian === "BELUM_DINILAI"
  ).length;
}

export async function mockSubmitNilai(penugasanId, nilai, status, feedback) {
  await delay(600);
  const penugasan = penugasanMap.get(penugasanId);
  if (!penugasan) throw new Error("Penugasan tidak ditemukan");
  penugasan.nilai = nilai;
  penugasan.statusPenilaian = "SELESAI";
  penugasan.nilaiKompetensi = status;
  penugasan.feedback = feedback;
  penugasan.tanggalPenilaian = new Date();
  return penugasan;
}

export async function mockGetLinimasa(skemaId) {
  await delay(400);
  const allLinimasa = Array.from(linimasaDb.values());

  if (skemaId === "ALL") {
    return allLinimasa;
  }

  return allLinimasa.filter(
    (l) => l.skemaId === skemaId || l.skemaId === "UMUM"
  );
}

export async function mockGetSesiUjianOffline(skemaId) {
  await delay(400);
  const allSesi = Array.from(sesiUjianOfflineDb.values());

  if (skemaId === "ALL") {
    return allSesi;
  }

  return allSesi.filter((s) => s.skemaId === skemaId);
}

export async function mockGetSesiUjianDetail(sesiId) {
  await delay(300);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi tidak ditemukan");
  const asesiTerplot = plottingDb.get(sesiId) || [];
  const asesiDetails = allUsers.filter((u) => asesiTerplot.includes(u.id));
  return { ...sesi, asesiTerplot: asesiDetails };
}

export async function mockCreateSesiUjianOffline(sesi) {
  await delay(600);
  const id = `sesi-${Date.now()}`;
  const newSesi = { ...sesi, id };
  sesiUjianOfflineDb.set(id, newSesi);
  plottingDb.set(id, []);
  return newSesi;
}

export async function mockCreateLinimasa(eventData) {
  await delay(600);
  const id = `lin-${Date.now()}`;
  const newEvent = {
    ...eventData,
    id,
    skemaId: eventData.skemaId || "UMUM",
  };
  linimasaDb.set(id, newEvent);
  return newEvent;
}

export async function mockGetAsesiBelumDiplot(skemaId, sesiId) {
  await delay(400);

  const allAsesiSkema = allUsers.filter(
    (u) => u.role === "ASESI" && u.skemaId === skemaId
  );

  let asesiSudahDiplotDiSesiLain = [];
  for (const [key, asesiList] of plottingDb.entries()) {
    if (key !== sesiId) {
      asesiSudahDiplotDiSesiLain.push(...asesiList);
    }
  }

  const asesiAvailable = allAsesiSkema.filter(
    (u) => !asesiSudahDiplotDiSesiLain.includes(u.id)
  );

  const grupKelas = new Map();
  asesiAvailable.forEach((asesi) => {
    const namaKelas = asesi.kelas || "Lainnya";

    if (!grupKelas.has(namaKelas)) {
      grupKelas.set(namaKelas, []);
    }
    grupKelas.get(namaKelas).push(asesi);
  });

  const hasilGrup = Array.from(grupKelas.entries()).map(
    ([namaKelas, asesi]) => ({
      namaKelas,
      asesi,
    })
  );

  hasilGrup.sort((a, b) => a.namaKelas.localeCompare(b.namaKelas));

  return hasilGrup;
}

export async function mockUpdatePlottingSesi(sesiId, asesiIds) {
  await delay(500);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi tidak ditemukan");
  if (asesiIds.length > sesi.kapasitas) {
    throw new Error("Kapasitas ruangan terlampaui!");
  }
  plottingDb.set(sesiId, asesiIds);
  return { success: true, count: asesiIds.length };
}

export async function mockUpdateLinimasa(eventId, eventData) {
  await delay(200);
  if (!linimasaDb.has(eventId)) {
    throw new Error("Linimasa tidak ditemukan");
  }
  const existing = linimasaDb.get(eventId);
  const updated = {
    ...existing,
    ...eventData,
    tanggal:
      eventData.tanggal instanceof Date
        ? eventData.tanggal
        : eventData.tanggal
        ? new Date(eventData.tanggal)
        : existing.tanggal,
    updatedAt: new Date(),
  };
  linimasaDb.set(eventId, updated);
  return updated;
}

export async function mockDeleteLinimasa(eventId) {
  await delay(600);
  const event = linimasaDb.get(eventId);
  if (!event) throw new Error("Kegiatan tidak ditemukan");

  linimasaDb.delete(eventId);
  return { success: true, message: "Kegiatan berhasil dihapus" };
}

export async function mockUpdateSesiUjianOffline(sesiId, sesiData) {
  await delay(200);
  if (!sesiUjianOfflineDb.has(sesiId)) {
    throw new Error("Sesi ujian tidak ditemukan");
  }
  const existing = sesiUjianOfflineDb.get(sesiId);
  const updated = {
    ...existing,
    ...sesiData,
    tanggal:
      sesiData.tanggal instanceof Date
        ? sesiData.tanggal
        : sesiData.tanggal
        ? new Date(sesiData.tanggal)
        : existing.tanggal,
    kapasitas:
      typeof sesiData.kapasitas === "number"
        ? sesiData.kapasitas
        : Number.parseInt(sesiData.kapasitas) || existing.kapasitas,
    updatedAt: new Date(),
  };
  sesiUjianOfflineDb.set(sesiId, updated);
  return updated;
}

export async function mockDeleteSesiUjianOffline(sesiId) {
  await delay(600);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi ujian tidak ditemukan");

  if (plottingDb.has(sesiId)) {
    plottingDb.delete(sesiId);
  }

  sesiUjianOfflineDb.delete(sesiId);
  return { success: true, message: "Sesi ujian berhasil dihapus" };
}

export async function mockGetStatistics() {
  await delay(500);

  progressMap = getProgressMapFromStorage();

  const pendingCount = Array.from(penugasanMap.values()).filter(
    (p) => p.statusPenilaian === "BELUM_DINILAI"
  ).length;
  const readyForExam = Array.from(progressMap.values()).filter(
    (p) => p.fase === "TRYOUT" || p.fase === "UJIAN_TEORI"
  ).length;
  return {
    totalAsesi: asesiUsers.length,
    totalAsesor: asesorUsers.length,
    totalPenugasan: penugasanMap.size,
    pendingGrading: pendingCount,
    readyForExam: readyForExam,
  };
}

export async function mockAssignAsesorPerUnit(asesiId, assignments) {
  await delay(800);
  console.log(`[Mock] Menugaskan asesor untuk asesi ${asesiId}:`, assignments);
  const asesi = allUsers.find((u) => u.id === asesiId);
  if (!asesi) throw new Error("Asesi tidak ditemukan");

  assignments.forEach((assign) => {
    let id;
    let unitJudul;
    const units = allUnitsDb.get(asesi.skemaId) || [];

    if (assign.tipe === "TEORI") {
      id = `penugasan-${asesiId}-${assign.unitId}-${assign.tipe}`;
      const unit = units.find((u) => u.nomorUnit == assign.unitId);
      unitJudul = unit?.judul || "Unit tidak ditemukan";
    } else {
      id = `penugasan-${asesiId}-${assign.tipe}`;
      unitJudul =
        assign.tipe === "PRAKTIKUM"
          ? "Studi Kasus Praktikum (Gabungan)"
          : "Presentasi Unjuk Diri (Gabungan)";
    }

    penugasanMap.set(id, {
      id: id,
      asesorId: assign.asesorId,
      asesiId: asesiId,
      asesiNama: asesi.nama,
      skemaId: asesi.skemaId,
      unitId: assign.unitId,
      unitJudul: unitJudul,
      tipe: assign.tipe,
      statusPenilaian: "BELUM_DINILAI",
      nilai: null,
      feedback: null,
      nilaiKompetensi: "BELUM_DINILAI",
    });
  });
  return { success: true, count: assignments.length };
}

export async function mockGetExamStatus(asesiId) {
  await delay(500);
  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  if (!progress) {
    throw new Error("Progress asesi tidak ditemukan.");
  }

  const jadwalPlotting = await mockGetPlottingAsesi(asesiId);

  let jadwalTeori = jadwalPlotting.find((j) => j.tipeUjian === "TEORI");

  if (!jadwalTeori && progress.tryoutSelesai) {
    console.warn(
      "MOCK_PATCH: Asesi sudah selesai tryout tapi belum di-plot. Membuat jadwal teori palsu agar simulasi bisa lanjut."
    );
    jadwalTeori = {
      id: "sesi-teori-mock",
      skemaId: progress.skemaId,
      tanggal: new Date(),
      waktu: "09:00",
      tipeUjian: "TEORI",
      ruangan: "Ruang Simulasi 101",
      kapasitas: 50,
    };
  }

  const jadwalUnjukDiri = jadwalPlotting.find(
    (j) => j.tipeUjian === "UNJUK_DIRI"
  );

  let praktikumDeadline = null;
  if (jadwalUnjukDiri) {
    const unjukDiriDate = new Date(jadwalUnjukDiri.tanggal);
    unjukDiriDate.setDate(unjukDiriDate.getDate() - 1);
    praktikumDeadline = unjukDiriDate.toISOString();
  }

  let statusTeori = "TERKUNCI";
  if (progress.tryoutSelesai) {
    statusTeori = jadwalTeori ? "SIAP_DIJADWALKAN" : "MENUNGGU_JADWAL";
  }
  if (progress.ujianTeoriSelesai) {
    statusTeori = "SELESAI";
  }

  let statusPraktikum = "TERKUNCI";
  if (progress.tryoutSelesai) {
    statusPraktikum = progress.ujianPraktikumSelesai ? "SELESAI" : "AKTIF";
  }

  let statusUnjukDiri = "TERKUNCI";
  if (progress.unjukDiriSelesai) {
    statusUnjukDiri = "SELESAI";
  } else if (progress.ujianPraktikumSelesai) {
    statusUnjukDiri = jadwalUnjukDiri ? "SIAP_DIJADWALKAN" : "MENUNGGU_JADWAL";
  }

  return {
    teori: { status: statusTeori, jadwal: jadwalTeori || null },
    praktikum: {
      status: statusPraktikum,
      jadwal: null,
      deadline: praktikumDeadline,
    },
    unjukDiri: { status: statusUnjukDiri, jadwal: jadwalUnjukDiri || null },
  };
}

export async function mockGetHasilAkhir(asesiId) {
  await delay(700);

  const asesiUser = allUsers.find((u) => u.id === asesiId);
  const skemaId = asesiUser?.skemaId || "ADS";
  const units = allUnitsDb.get(skemaId) || [];
  const totalUnitSkema = units.length;

  progressMap = getProgressMapFromStorage();
  const progress = progressMap.get(asesiId);

  // ✅ CEK: Apakah ini akun starter?
  const isStarterAccount = DEMO_AKUN_ASESI_STARTER.some(
    (d) => d.id === asesiUser?.id || d.email === asesiUser?.email
  );

  // ✅ Jika AKUN STARTER dan belum menyelesaikan semua ujian
  if (isStarterAccount) {
    const belumSelesaiUjian = !progress || 
      !progress.ujianTeoriSelesai || 
      !progress.ujianPraktikumSelesai || 
      !progress.unjukDiriSelesai;

    if (belumSelesaiUjian) {
      return {
        asesiId,
        skemaId,
        statusAkhir: "BELUM_ADA_PENILAIAN",
        hasilPraktikum: "BELUM_ADA_PENILAIAN",
        hasilUnjukDiri: "BELUM_ADA_PENILAIAN",
        hasilTeori: {
          statusAkumulasi: "BELUM_ADA_PENILAIAN",
          totalUnitLulus: 0,
          totalUnitSkema: totalUnitSkema,
          rincianUnit: units.map(u => ({
            unitId: u.id,
            judul: u.judul,
            status: "BELUM_ADA_PENILAIAN",
            soalSesuai: 0,
            soalTotal: 4
          })),
        },
      };
    }
  }

  // ✅ Cek apakah ada penugasan
  const allPenugasan = Array.from(penugasanMap.values());
  const userTasks = allPenugasan.filter(p => p.asesiId === asesiId);

  const isPendingGrading = userTasks.some(p => p.statusPenilaian === "BELUM_DINILAI");
  const isNotAssignedYet = userTasks.length === 0;

  // ✅ Jika sedang dinilai (ada yang belum dinilai atau belum diassign)
  if (isPendingGrading || isNotAssignedYet) {
    return {
      asesiId,
      skemaId,
      statusAkhir: "SEDANG_DINILAI",
      hasilPraktikum: "SEDANG_DINILAI",
      hasilUnjukDiri: "SEDANG_DINILAI",
      hasilTeori: {
        statusAkumulasi: "SEDANG_DINILAI",
        totalUnitLulus: 0,
        totalUnitSkema: totalUnitSkema,
        rincianUnit: units.map(u => {
          const taskUnit = userTasks.find(t => t.unitId === u.nomorUnit && t.tipe === 'TEORI');
          const statusUnit = taskUnit?.statusPenilaian === 'SELESAI' 
            ? (taskUnit.nilaiKompetensi || "KOMPETEN") 
            : "SEDANG_DINILAI";
          
          return {
            unitId: u.id,
            judul: u.judul,
            status: statusUnit,
            soalSesuai: statusUnit === "KOMPETEN" ? 4 : 0, 
            soalTotal: 4
          };
        }),
      },
    };
  }

  // ✅ Semua sudah dinilai - Hitung hasil final
  const rincianUnit = units.map((unit) => {
    const task = userTasks.find(t => t.unitId === unit.nomorUnit && t.tipe === 'TEORI');
    const status = task ? task.nilaiKompetensi : "KOMPETEN"; 
    return {
      unitId: unit.id,
      judul: unit.judul,
      status: status,
      soalSesuai: status === "KOMPETEN" ? 4 : 2,
      soalTotal: 4,
    };
  });

  const totalUnitLulus = rincianUnit.filter(r => r.status === "KOMPETEN").length;
  const statusAkumulasiTeori = (totalUnitLulus / totalUnitSkema) >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";

  const taskPraktikum = userTasks.find(t => t.tipe === 'PRAKTIKUM');
  const hasilPraktikum = taskPraktikum ? taskPraktikum.nilaiKompetensi : "KOMPETEN";

  const taskUnjukDiri = userTasks.find(t => t.tipe === 'UNJUK_DIRI');
  const hasilUnjukDiri = taskUnjukDiri ? taskUnjukDiri.nilaiKompetensi : "KOMPETEN";

  const statusAkhir =
    statusAkumulasiTeori === "KOMPETEN" &&
    hasilPraktikum === "KOMPETEN" &&
    hasilUnjukDiri === "KOMPETEN"
      ? "KOMPETEN"
      : "BELUM KOMPETEN";

  return {
    asesiId,
    skemaId,
    statusAkhir,
    hasilPraktikum,
    hasilUnjukDiri,
    hasilTeori: {
      statusAkumulasi: statusAkumulasiTeori,
      totalUnitLulus,
      totalUnitSkema,
      rincianUnit,
    },
  };
}

export async function mockGetRekapHasilAkhir() {
  await delay(1200);

  const asesiUsers = allUsers.filter((u) => u.role === "ASESI");
  const allPenugasan = Array.from(penugasanMap.values());
  const findAsesorName = (asesorId) =>
    allUsers.find((u) => u.id === asesorId)?.nama || "N/A";

  const rekapPromises = asesiUsers.map(async (asesi) => {
    // ✅ TAMBAHKAN INI: Paksa progress untuk non-starter
    const isStarterAccount = DEMO_AKUN_ASESI_STARTER.some(
      (d) => d.id === asesi.id || d.email === asesi.email
    );

    // ✅ Jika bukan starter, paksa status ujian selesai sebelum ambil hasil
    if (!isStarterAccount) {
      progressMap = getProgressMapFromStorage();
      let progress = progressMap.get(asesi.id);
      
      if (!progress) {
        const skemaId = asesi.skemaId || "ADS";
        const unitsInSkema = allUnitsDb.get(skemaId) || [];
        const completedIds = new Set(unitsInSkema.map((u) => u.id));
        
        progress = {
          asesiId: asesi.id,
          skemaId,
          fase: "SELESAI",
          completedUnitIds: completedIds,
          viewedMateriIds: new Set(),
          progressPembelajaran: 100,
          statusPraAsesmen: "SELESAI",
          tryoutSelesai: true,
          ujianTeoriSelesai: true,      // ← Paksa TRUE
          ujianPraktikumSelesai: true,  // ← Paksa TRUE
          unjukDiriSelesai: true,       // ← Paksa TRUE
        };
        progressMap.set(asesi.id, progress);
        saveProgressMapToStorage(progressMap);
      }
    }

    // Lanjutkan ambil hasil akhir seperti biasa
    const hasilAkhir = await mockGetHasilAkhir(asesi.id);

    const penugasanAsesi = allPenugasan.filter((p) => p.asesiId === asesi.id);
    const units = allUnitsDb.get(asesi.skemaId) || [];

    const pTeoriAssignments = penugasanAsesi.filter((p) => p.tipe === "TEORI");
    const pPraktikum = penugasanAsesi.find((p) => p.tipe === "PRAKTIKUM");
    const pUnjukDiri = penugasanAsesi.find((p) => p.tipe === "UNJUK_DIRI");

    const asesorTeoriDetail = pTeoriAssignments.map((p) => {
      const unit = units.find((u) => u.nomorUnit === p.unitId);
      
      const unitResult = hasilAkhir.hasilTeori.rincianUnit.find(
        (r) => (unit && r.unitId === unit.id) || r.judul === p.unitJudul
      );

      return {
        unitId: p.unitId,
        unitJudul: unit?.judul || p.unitJudul || "Unit Tidak Ditemukan",
        asesorId: p.asesorId,
        asesorNama: findAsesorName(p.asesorId),
        status: unitResult ? unitResult.status : "BELUM_DINILAI",
      };
    });

    hasilAkhir.asesorTeoriDetail = asesorTeoriDetail;
    hasilAkhir.asesorPraktikum = findAsesorName(pPraktikum?.asesorId);
    hasilAkhir.asesorUnjukDiri = findAsesorName(pUnjukDiri?.asesorId);

    return {
      asesiData: {
        id: asesi.id,
        nama: asesi.nama,
        nim: asesi.nim,
        kelas: asesi.kelas || "N/A",
      },
      hasilAkhir: hasilAkhir,
    };
  });

  const rekapData = await Promise.all(rekapPromises);
  return rekapData;
}

export async function mockCreateUnit(skemaId, unitData) {
  await delay(400);
  if (!unitData.tahunAjaran) throw new Error("Tahun Ajaran wajib dipilih");
  
  const units = allUnitsDb.get(skemaId) || [];
  
  const unitsInYear = units.filter(u => u.tahunAjaran === unitData.tahunAjaran);
  
  const nomor = Number(unitData.nomorUnit) || unitsInYear.length + 1;

  const existsSameNomor = unitsInYear.find(u => Number(u.nomorUnit) === Number(nomor));
  if (existsSameNomor) {
    throw new Error(`Unit nomor ${nomor} sudah ada pada tahun ${unitData.tahunAjaran}.`);
  }
  if (unitData.kodeUnit) {
    const existsSameKode = unitsInYear.find(u => (u.kodeUnit || "").toLowerCase() === (unitData.kodeUnit || "").toLowerCase());
    if (existsSameKode) {
      throw new Error(`Kode Unit '${unitData.kodeUnit}' sudah terdaftar pada tahun ${unitData.tahunAjaran}.`);
    }
  }

  const cleanTahun = unitData.tahunAjaran.replace(/[^a-zA-Z0-9]/g, "");
  const id = `${skemaId}-U${nomor}-${cleanTahun}-${Date.now()}`;

  const newUnit = {
    id,
    skemaId,
    nomorUnit: nomor,
    tahunAjaran: unitData.tahunAjaran,
    kodeUnit: unitData.kodeUnit || `${skemaId}.UNIT.${nomor}`,
    judul: unitData.judul || `Unit ${nomor}`,
    deskripsi: unitData.deskripsi || "",
    materiCount: 0,
    soalCount: 0,
    durasiTeori: Number(unitData.durasiTeori) || 15,
    urutan: unitsInYear.length + 1,
  };

  units.push(newUnit);
  allUnitsDb.set(skemaId, units);
  allSoalDb.set(id, []); 
  return newUnit;
}

export async function mockUpdateUnit(skemaId, unitId, updates) {
  await delay(300);
  const units = allUnitsDb.get(skemaId) || [];
  
  const idx = units.findIndex((u) => u.id === unitId);
  
  if (idx === -1) {
    console.error("Debug Unit ID not found:", unitId, "Available:", units.map(u => u.id));
    throw new Error(`Unit dengan ID ${unitId} tidak ditemukan.`);
  }
  
  const existing = units[idx];
  units[idx] = { 
    ...existing, 
    ...updates,
    id: existing.id,
    tahunAjaran: existing.tahunAjaran 
  };
  
  allUnitsDb.set(skemaId, units);
  return units[idx];
}

export async function mockDeleteUnit(skemaId, unitId) {
  await delay(300);
  const units = allUnitsDb.get(skemaId) || [];
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx === -1) throw new Error("Unit tidak ditemukan");
  units.splice(idx, 1);
  units.forEach((u, i) => (u.urutan = i + 1));
  allUnitsDb.set(skemaId, units);
  allSoalDb.delete(unitId);
  const skema = allSkemaDb.get(skemaId);
  if (skema) skema.totalUnit = units.length;
  return { success: true };
}

export async function mockDeleteSoal(skemaId, soalId) {
  await delay(300);

  const prakDb =
    typeof globalThis !== "undefined" && globalThis.allPraktikumSoalDb
      ? globalThis.allPraktikumSoalDb
      : allPraktikumSoalDb;

  let praktikumList = prakDb.get(skemaId) || [];

  if (Array.isArray(praktikumList)) {
    const idx = praktikumList.findIndex(p => p.id === soalId);
    if (idx !== -1) {
      praktikumList.splice(idx, 1);
      prakDb.set(skemaId, praktikumList);
      if (typeof globalThis !== "undefined") globalThis.allPraktikumSoalDb = prakDb;
      return { success: true, removedFrom: "praktikum" };
    }
  }

  for (const [unitId, soalList] of allSoalDb.entries()) {
    const idx = soalList.findIndex(s => s.id === soalId);
    if (idx !== -1) {
      soalList.splice(idx, 1);
      allSoalDb.set(unitId, soalList);
      return { success: true, removedFrom: "unit", unitId };
    }
  }

  throw new Error(`Soal dengan ID ${soalId} tidak ditemukan.`);
}

export async function mockCreateSoal(unitId, soalData) {
  await delay(300);
  if (!unitId) throw new Error("unitId wajib untuk soal unit");
  const db =
    typeof globalThis !== "undefined" && globalThis.allSoalDb
      ? globalThis.allSoalDb
      : allSoalDb;
  const list = db.get(unitId) || [];
  const id =
    soalData.id ||
    `${unitId}-${(soalData.tipeSoal || "soal").toLowerCase()}-${Date.now()}`;
  const newSoal = {
    ...soalData,
    id,
    unitId,
    urutan: soalData.urutan ?? list.length + 1,
    createdAt: new Date(),
  };

  list.push(newSoal);

  db.set(unitId, list);
  if (typeof globalThis !== "undefined" && !globalThis.allSoalDb)
    globalThis.allSoalDb = db;
  return newSoal;
}

export async function mockUpdateSoal(unitId, soalId, updates) {
  await delay(250);

  if (updates.tipeSoal === "UJIAN_PRAKTIKUM") {
     return; 
  }

  if (unitId) {
    const list = allSoalDb.get(unitId) || [];
    const idx = list.findIndex((s) => s.id === soalId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date() };
      allSoalDb.set(unitId, list);
      return list[idx];
    }
  }

  for (const [keyUnitId, list] of allSoalDb.entries()) {
    const idx = list.findIndex((s) => s.id === soalId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date() };
      allSoalDb.set(keyUnitId, list);
      return list[idx];
    }
  }

  throw new Error(`Soal dengan ID ${soalId} tidak ditemukan di database.`);
}

export async function mockCreateTryout(skemaId, soalData, tahunAjaran) {
  await delay(300);
  const units = allUnitsDb.get(skemaId) || [];
  
  const targetUnits = tahunAjaran 
    ? units.filter(u => u.tahunAjaran === tahunAjaran) 
    : units;

  if (targetUnits.length === 0) {
    throw new Error(`Tidak ada unit kompetensi di tahun ajaran ${tahunAjaran || ''}. Buat unit terlebih dahulu sebelum membuat soal Tryout.`);
  }

  const targetUnitId = targetUnits[0].id;
  
  const db =
    typeof globalThis !== "undefined" && globalThis.allSoalDb
      ? globalThis.allSoalDb
      : allSoalDb;
  const list = db.get(targetUnitId) || [];

  const tryoutSoalCount = list.filter((s) => s.tipeSoal === "TRYOUT").length;

  const payload = {
    ...soalData,
    tipeSoal: "TRYOUT",
    urutan: soalData.urutan ?? tryoutSoalCount + 1,
    tahunAjaran: tahunAjaran
  };

  return await mockCreateSoal(targetUnitId, payload);
}

export async function mockUpsertPraktikum(skemaId, praktikumData) {
  await delay?.(300);

  if (!skemaId) throw new Error("skemaId wajib untuk praktikum");

  if ((praktikumData?.tipeJawaban === "UPLOAD_FILE" || praktikumData?.tipeJawaban === "UPLOAD") &&
      (!praktikumData.filePendukung || praktikumData.filePendukung.length === 0)) {
    throw new Error("File pendukung wajib diunggah untuk soal praktikum.");
  }

  const db =
    typeof globalThis !== "undefined" && globalThis.allPraktikumSoalDb
      ? globalThis.allPraktikumSoalDb
      : allPraktikumSoalDb;

  const currentList = Array.isArray(db.get(skemaId)) ? db.get(skemaId).slice() : [];

  if (praktikumData?.id) {
    const idx = currentList.findIndex((p) => p.id === praktikumData.id);
    if (idx !== -1) {
      currentList[idx] = { ...currentList[idx], ...praktikumData, updatedAt: new Date() };
      db.set(skemaId, currentList);
      if (typeof globalThis !== "undefined") globalThis.allPraktikumSoalDb = db;
      return currentList[idx];
    }
  }

  const id = praktikumData?.id || `${skemaId}-PRAKTIKUM-${Date.now()}`;
  const newPraktikum = {
    id,
    skemaId,
    tahunAjaran: praktikumData?.tahunAjaran || DEFAULT_TAHUN_AJARAN,
    tipeSoal: "UJIAN_PRAKTIKUM",
    tipeJawaban: praktikumData?.tipeJawaban || "UPLOAD_FILE",
    judul: praktikumData?.judul || (praktikumData?.teks || "").slice(0, 80) || "Praktikum",
    teks: praktikumData?.teks || "",
    filePendukung: praktikumData?.filePendukung || praktikumData?.file || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  currentList.push(newPraktikum);
  db.set(skemaId, currentList);

  if (typeof globalThis !== "undefined") globalThis.allPraktikumSoalDb = db;

  return newPraktikum;
}

if (typeof globalThis !== "undefined") {
  globalThis.allSoalDb = allSoalDb;
  globalThis.allPraktikumSoalDb = allPraktikumSoalDb;
  if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
}

if (typeof globalThis !== "undefined") {
  if (!globalThis.allMateriDb)
    globalThis.allMateriDb = getMateriMapFromStorage();
  if (!globalThis.allSoalDb) globalThis.allSoalDb = new Map();
  if (!globalThis.allPraktikumSoalDb) globalThis.allPraktikumSoalDb = new Map();
}

if (typeof globalThis !== "undefined") {
  try {
  } catch (e) {}
}
export async function mockCreateMateri(unitId, materiData) {
  await delay?.(200);
  if (!unitId) throw new Error("unitId wajib untuk membuat materi");
  if (typeof globalThis === "undefined")
    throw new Error("globalThis tidak tersedia");
  if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
  const db = globalThis.allMateriDb;
  const list = db.get(unitId) || [];
  const id = materiData?.id || `${unitId}-MAT-${Date.now()}`;
  const newMateri = {
    ...materiData,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  list.push(newMateri);
  db.set(unitId, list);
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(
        "mockMateriDb",
        JSON.stringify(Array.from(db.entries()))
      );
  } catch (e) {}
  return newMateri;
}

export async function mockUpdateMateri(unitId, materiId, updates) {
  await delay?.(150);
  if (!unitId || !materiId) throw new Error("unitId dan materiId wajib");
  if (typeof globalThis === "undefined")
    throw new Error("globalThis tidak tersedia");
  if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
  const db = globalThis.allMateriDb;
  const list = db.get(unitId) || [];
  const idx = list.findIndex((m) => m.id === materiId);
  if (idx === -1) throw new Error("Materi tidak ditemukan");
  const merged = { ...list[idx], ...updates, updatedAt: new Date() };
  list[idx] = merged;
  db.set(unitId, list);
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(
        "mockMateriDb",
        JSON.stringify(Array.from(db.entries()))
      );
  } catch (e) {}
  return merged;
}

export async function mockDeleteMateri(unitId, materiId) {
  await delay?.(120);
  if (!unitId || !materiId) throw new Error("unitId dan materiId wajib");
  if (typeof globalThis === "undefined")
    throw new Error("globalThis tidak tersedia");
  if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
  const db = globalThis.allMateriDb;
  const list = db.get(unitId) || [];
  const filtered = list.filter((m) => m.id !== materiId);
  db.set(unitId, filtered);
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(
        "mockMateriDb",
        JSON.stringify(Array.from(db.entries()))
      );
  } catch (e) {}
  return { success: true, deletedId: materiId };
}