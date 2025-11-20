// frontend-lms-v3-master/lib/api-mock.js

const SKEMA_ADS_UNITS = [
  {
    nomorUnit: 1,
    kodeUnit: "J.62DMI00.004.1",
    judul: "Mengumpulkan data",
    durasiTeori: 15,
  },
  {
    nomorUnit: 2,
    kodeUnit: "J.62DMI00.005.1",
    judul: "Menelaah Data",
    durasiTeori: 20,
  },
  {
    nomorUnit: 3,
    kodeUnit: "J.62DMI00.006.1",
    judul: "Memvalidasi Data",
    durasiTeori: 20,
  },
  {
    nomorUnit: 4,
    kodeUnit: "J.62DMI00.007.1",
    judul: "Menentukan Objek Data",
    durasiTeori: 20,
  },
  {
    nomorUnit: 5,
    kodeUnit: "J.62DMI00.008.1",
    judul: "Membersihkan Data",
    durasiTeori: 15,
  },
  {
    nomorUnit: 6,
    kodeUnit: "J.62DMI00.009.1",
    judul: "Mengkonstruksi Data",
    durasiTeori: 25,
  },
  {
    nomorUnit: 7,
    kodeUnit: "J.62DMI00.010.1",
    judul: "Menentukan Label Data",
    durasiTeori: 25,
  },
  {
    nomorUnit: 8,
    kodeUnit: "J.62DMI00.013.1",
    judul: "Membangun Model",
    durasiTeori: 15,
  },
  {
    nomorUnit: 9,
    kodeUnit: "J.62DMI00.014.1",
    judul: "Mengevaluasi Hasil Pemodelan",
    durasiTeori: 30,
  },
];

const SKEMA_DS_UNITS = [
  {
    nomorUnit: 1,
    kodeUnit: "J.62DMI00.001.1",
    judul: "Menentukan Objektif Bisnis",
    durasiTeori: 20,
  },
  {
    nomorUnit: 2,
    kodeUnit: "J.62DMI00.002.1",
    judul: "Menentukan Tujuan Teknis Data Science",
    durasiTeori: 25,
  },
  {
    nomorUnit: 3,
    kodeUnit: "J.62DMI00.005.1",
    judul: "Menelaah Data",
    durasiTeori: 25,
  },
  {
    nomorUnit: 4,
    kodeUnit: "J.62DMI00.006.1",
    judul: "Memvalidasi Data",
    durasiTeori: 20,
  },
  {
    nomorUnit: 5,
    kodeUnit: "J.62DMI00.007.1",
    judul: "Menentukan Objek Data",
    durasiTeori: 15,
  },
  {
    nomorUnit: 6,
    kodeUnit: "J.62DMI00.008.1",
    judul: "Membersihkan Data",
    durasiTeori: 30,
  },
  {
    nomorUnit: 7,
    kodeUnit: "J.62DMI00.009.1",
    judul: "Mengkonstruksi Data",
    durasiTeori: 30,
  },
  {
    nomorUnit: 8,
    kodeUnit: "J.62DMI00.012.1",
    judul: "Membangun Skenario Model",
    durasiTeori: 25,
  },
  {
    nomorUnit: 9,
    kodeUnit: "J.62DMI00.013.1",
    judul: "Membangun Model",
    durasiTeori: 25,
  },
  {
    nomorUnit: 10,
    kodeUnit: "J.62DMI00.014.1",
    judul: "Mengevaluasi Hasil Pemodelan",
    durasiTeori: 20,
  },
  {
    nomorUnit: 11,
    kodeUnit: "J.62DMI00.015.1",
    judul: "Melakukan Proses Review Pemodelan",
    durasiTeori: 35,
  },
];

const allSkemaDb = new Map();
allSkemaDb.set("ADS", {
  id: "ADS",
  judul: "Associate Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D3 Statistika.",
  totalUnit: SKEMA_ADS_UNITS.length,
});
allSkemaDb.set("DS", {
  id: "DS",
  judul: "Data Scientist",
  deskripsi: "Skema sertifikasi profesi untuk D4 Statistika.",
  totalUnit: SKEMA_DS_UNITS.length,
});

const allUnitsDb = new Map();
allUnitsDb.set(
  "ADS",
  SKEMA_ADS_UNITS.map((unit, idx) => ({
    id: `ADS-${unit.nomorUnit}`,
    skemaId: "ADS",
    nomorUnit: unit.nomorUnit,
    kodeUnit: unit.kodeUnit,
    judul: unit.judul,
    deskripsi: `Deskripsi lengkap untuk ${unit.judul}`,
    materiCount: unit.nomorUnit === 1 ? 3 : 1, // <-- Unit 1 punya 3, sisanya 1
    soalCount: 2, // (1 Tryout + 1 Teori, dari permintaan sebelumnya)
    durasiTeori: unit.durasiTeori || 15,
    urutan: idx + 1,
  }))
);
allUnitsDb.set(
  "DS",
  SKEMA_DS_UNITS.map((unit, idx) => ({
    id: `DS-${unit.nomorUnit}`,
    skemaId: "DS",
    nomorUnit: unit.nomorUnit,
    kodeUnit: unit.kodeUnit,
    judul: unit.judul,
    deskripsi: `Deskripsi lengkap untuk ${unit.judul}`,
    materiCount: 1, // <-- Skema DS dipastikan 1 materi
    soalCount: 8, // (Soal DS tetap 8 per unit)
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
    /* 
    {
      id: `${unitId}-teori-2`,
      unitId,
      tipeSoal: "UJIAN_TEORI",
      tipeJawaban: "ESAI",
      teks: `[Ujian Teori ADS] Bagaimana ${unit.judul} berkontribusi pada proses bisnis?`,
      kunciJawaban: "bisnis|kontribusi",
      urutan: 2,
    },
    {
      id: `${unitId}-teori-3`,
      unitId,
      tipeSoal: "UJIAN_TEORI",
      tipeJawaban: "ESAI",
      teks: `[Ujian Teori ADS] Sebutkan 2 tantangan utama dalam implementasi ${unit.judul}?`,
      kunciJawaban: "tantangan",
      urutan: 3,
    },
    
    */
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
    /*
    {
      id: `${unitId}-teori-2`,
      unitId,
      tipeSoal: "UJIAN_TEORI",
      tipeJawaban: "ESAI",
      teks: `[Ujian Teori DS] Bagaimana ${unit.judul} berkontribusi pada proses bisnis skala besar?`,
      kunciJawaban: "bisnis|kontribusi",
      urutan: 2,
    },
    {
      id: `${unitId}-teori-3`,
      unitId,
      tipeSoal: "UJIAN_TEORI",
      tipeJawaban: "ESAI",
      teks: `[Ujian Teori DS] Sebutkan 2 tantangan utama dalam implementasi ${unit.judul}?`,
      kunciJawaban: "tantangan",
      urutan: 3,
    },
    */
  ]);
});

// Database Soal Praktikum In-Memory (Gabungan per Skema)
const allPraktikumSoalDb = new Map();
allPraktikumSoalDb.set("ADS", [
  {
    id: "ADS-PRAKTIKUM-01",
    skemaId: "ADS",
    tipeSoal: "UJIAN_PRAKTIKUM",
    tipeJawaban: "UPLOAD_FILE",
    judul: "Studi Kasus: Analisis Data Penjualan Ritel",
    teks: "Anda ditugaskan sebagai Associate Data Scientist di sebuah perusahaan ritel. Perusahaan ingin memahami pola pembelian pelanggan untuk mengoptimalkan strategi marketing.\n\nTugas Anda:\n1. Lakukan pembersihan dan pra-pemrosesan data.\n2. Lakukan analisis deskriptif untuk menemukan wawasan (misal: produk terlaris, waktu pembelian tersibuk).\n3. Buat segmentasi pelanggan sederhana (misal: berdasarkan frekuensi atau nilai pembelian).\n4. Buat visualisasi data yang relevan.\n5. Susun temuan Anda dalam file presentasi (.ppt) untuk dipresentasikan saat Unjuk Diri.",
    filePendukung: [
      {
        id: "f1",
        nama: "dataset_penjualan_2024.csv",
        url: "/api/mock-download/dataset_penjualan_2024.csv",
        size: "2.1 MB",
      },
      {
        id: "f2",
        nama: "panduan_pengerjaan.pdf",
        url: "/api/mock-download/panduan_pengerjaan.pdf",
        size: "310 KB",
      },
      {
        id: "f3",
        nama: "template_presentasi.pptx",
        url: "/api/mock-download/template_presentasi.pptx",
        size: "88 KB",
      },
    ],
    createdAt: new Date(),
  },
]);

allPraktikumSoalDb.set("DS", [
  {
    id: "DS-PRAKTIKUM-01",
    skemaId: "DS",
    tipeSoal: "UJIAN_PRAKTIKUM",
    tipeJawaban: "UPLOAD_FILE",
    judul: "Studi Kasus: Prediksi Churn Pelanggan Telekomunikasi",
    teks: "Anda adalah Data Scientist di perusahaan telekomunikasi. Disediakan data historis pelanggan (demografi, layanan, tagihan, dan status churn).\n\nTugas Anda:\n1. Lakukan Exploratory Data Analysis (EDA) dan Feature Engineering.\n2. Bangun model klasifikasi untuk memprediksi pelanggan yang akan churn.\n3. Evaluasi performa model Anda (cantumkan metrik seperti Accuracy, Precision, Recall, F1-Score, dan ROC-AUC).\n4. Berikan rekomendasi bisnis berdasarkan temuan model.\n5. Susun laporan dan analisis Anda dalam file presentasi (.ppt) untuk Unjuk Diri.",
    filePendukung: [
      {
        id: "f1",
        nama: "dataset_churn_telekomunikasi.csv",
        url: "/api/mock-download/dataset_churn_telekomunikasi.csv",
        size: "15.4 MB",
      },
      {
        id: "f2",
        nama: "kamus_data.pdf",
        url: "/api/mock-download/kamus_data.pdf",
        size: "450 KB",
      },
      {
        id: "f3",
        nama: "template_presentasi_ds.pptx",
        url: "/api/mock-download/template_presentasi_ds.pptx",
        size: "92 KB",
      },
    ],
    createdAt: new Date(),
  },
]);

// ==================== DATA GENERATORS ====================

const firstNames = [
  "Nadia",
  "Rezky",
  "Rani",
  "Galang",
  "Nailatur",
  "Meldiro",
  "Naila",
  "Budi",
  "Siti",
  "Ahmad",
  "Dewi",
  "Eko",
  "Fitri",
  "Hadi",
  "Indah",
  "Joko",
];
const lastNames = [
  "Nisrina",
  "Kilwouw",
  "Kusumawati",
  "Nugroho",
  "Rajaa",
  "Ferreira",
  "Hanifa",
  "Santoso",
  "Nurhaliza",
  "Ridho",
  "Lestari",
  "Prasetyo",
  "Handayani",
  "Wijaya",
  "Permata",
  "Susanto",
];
const getRandomName = () =>
  `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;

function generateAsesiData() {
  const asesiList = [];
  const dsKelasList = ["4SI1", "4SI2", "4SD1", "4SE1", "4SK1"];
  const adsKelasList = ["3SD1", "3SD2", "3SD3"];

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

  for (let i = 1; i <= 150; i++) {
    const nim = String(222350000 + i);
    let kelas = adsKelasList[i % adsKelasList.length];
    asesiList.push({
      id: `asesi-ads-${i}`,
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
  const dosenNames = [
    "Dr. Ernawati P",
    "Nori Wilantika",
    "Dr. Erni T",
    "Dr. Novi H",
    "Ibnu Santoso",
    "Rini Rahani",
    "Budi Yuniarto",
    "Sukim",
    "Winih Budiarti",
    "Sri Herwanto",
  ];
  for (let i = 1; i <= 10; i++) {
    const nama = `Asesor DS ${i}`;
    asesorList.push({
      id: `asesor-ds-${i}`,
      email: `asesor.ds${i}@stis.ac.id`,
      nama: dosenNames[i - 1] || nama,
      role: "ASESOR",
      nip: String(198001010000000000 + i),
      skemaKeahlian: ["DS"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  for (let i = 1; i <= 10; i++) {
    const nama = `Asesor ADS ${i}`;
    asesorList.push({
      id: `asesor-ads-${i}`,
      email: `asesor.ads${i}@stis.ac.id`,
      nama: dosenNames[i] || nama,
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
    nip: String(19700101100),
    skemaKeahlian: ["ADS", "DS"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return asesorList;
}

const adminUsers = [
  {
    id: "admin-1",
    email: "admin@stis.ac.id",
    nama: "admin",
    role: "ADMIN_LSP",
    nip: "1991011991001",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "admin-2",
    email: "admin2@stis.ac.id",
    nama: "Super Admin",
    role: "ADMIN_LSP",
    nip: "199101011991001001",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEMO_AKUN_ASESI = [
  {
    id: "asesi-dummy-1",
    email: "222313206@stis.ac.id",
    nama: "Meldiro da Cruz",
    role: "ASESI",
    nim: "222313206",
    skemaId: "ADS",
    kelas: "4SI1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "asesi-dummy-2",
    email: "222313190@stis.ac.id",
    nama: "Raya Kilwouw",
    role: "ASESI",
    nim: "222313190",
    skemaId: "DS",
    kelas: "4SI1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Demo account baru yang DIMULAI DARI AWAL (tidak dimasukkan ke DEMO_AKUN_ASESI)
const DEMO_AKUN_ASESI_STARTER = {
  id: "1-starter",
  email: "22234567@stis.ac.id",
  nama: "Meldiro Cruz",
  role: "ASESI",
  nim: "222313300",
  skemaId: "ADS",
  kelas: "3SD1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const asesiUsers = [
  DEMO_AKUN_ASESI_STARTER,
  ...DEMO_AKUN_ASESI,
  ...generateAsesiData(),
];
const asesorUsers = generateAsesorData();
const allUsers = [...adminUsers, ...asesiUsers, ...asesorUsers];

const MOCK_DB_PROGRESS_KEY = "mockProgressMap";

function getProgressMapFromStorage() {
  if (typeof window === "undefined") {
    return new Map();
  }

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

// <-- TAMBAHAN: helper untuk memuat mockMateriDb dari localStorage agar modul tidak gagal saat di-evaluate -->
function getMateriMapFromStorage() {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem("mockMateriDb");
    if (!raw) return new Map();
    const arr = JSON.parse(raw);
    // arr expected to be Array<[unitId, list]>
    return new Map(arr);
  } catch (e) {
    console.error("Gagal memuat mockMateriDb:", e);
    return new Map();
  }
}
// <-- AKHIR TAMBAHAN -->

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
  return Math.round(
    (progress.completedUnitIds.size / unitsInSkema.length) * 100
  );
}

const penugasanMap = new Map();
function generatePenugasanData() {
  let penugasanId = 0;
  // jangan buat penugasan awal untuk akun starter agar progres benar-benar dari nol
  const selectedAsesi = asesiUsers
    .filter((a) => a.id !== DEMO_AKUN_ASESI_STARTER.id)
    .slice(0, 50);

  selectedAsesi.forEach((asesi) => {
    const skema = asesi.skemaId;
    const units = allUnitsDb.get(skema) || [];
    const asesorList = asesorUsers.filter((a) =>
      a.skemaKeahlian.includes(skema)
    );

    units.forEach((unit) => {
      const asesor = asesorList[Math.floor(Math.random() * asesorList.length)];
      const id = `penugasan-${penugasanId++}`;
      penugasanMap.set(id, {
        id: id,
        asesorId: asesor.id,
        asesiId: asesi.id,
        asesiNama: asesi.nama,
        asesiKelas: asesi.kelas, // <-- PERBAIKAN 1 (DITAMBAHKAN)
        skemaId: skema,
        unitId: unit.nomorUnit,
        unitJudul: unit.judul,
        tipe: "TEORI",
        statusPenilaian: "BELUM_DINILAI",
        nilai: null,
        feedback: null,
        nilaiKompetensi: "BELUM_DINILAI",
      });
    });

    const asesorPraktikum =
      asesorList[Math.floor(Math.random() * asesorList.length)];
    const idPraktikum = `penugasan-${penugasanId++}`;
    penugasanMap.set(idPraktikum, {
      id: idPraktikum,
      asesorId: asesorPraktikum.id,
      asesiId: asesi.id,
      asesiNama: asesi.nama,
      asesiKelas: asesi.kelas, // <-- PERBAIKAN 2 (DITAMBAHKAN)
      skemaId: skema,
      unitId: null,
      unitJudul: "Studi Kasus Praktikum (Gabungan)",
      tipe: "PRAKTIKUM",
      statusPenilaian: "BELUM_DINILAI",
      nilai: null,
      feedback: null,
      nilaiKompetensi: "BELUM_DINILAI",
    });

    const asesorUnjukDiri =
      asesorList[Math.floor(Math.random() * asesorList.length)];
    const idUnjukDiri = `penugasan-${penugasanId++}`;
    penugasanMap.set(idUnjukDiri, {
      id: idUnjukDiri,
      asesorId: asesorUnjukDiri.id,
      asesiId: asesi.id,
      asesiNama: asesi.nama,
      asesiKelas: asesi.kelas, // <-- PERBAIKAN 3 (DITAMBAHKAN)
      skemaId: skema,
      unitId: null,
      unitJudul: "Presentasi Unjuk Diri (Gabungan)",
      tipe: "UNJUK_DIRI",
      statusPenilaian: "BELUM_DINILAI",
      nilai: null,
      feedback: null,
      nilaiKompetensi: "BELUM_DINILAI",
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
     kelas: "4SI1"
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
     kelas: "3SD1"
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
     kelas: "4SI1"
  };
  sesiUjianOfflineDb.set(sesiDS_Teori.id, sesiDS_Teori);
  plottingDb.set(sesiDS_Teori.id, ["asesi-dummy-2"]);
}
generateSesiUjianData();

// ==================== MOCK FUNCTIONS ====================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * [ADMIN] Simulasi: GET /api/admin/skema
 */
export async function mockGetAllSkema() {
  await delay(300);
  return Array.from(allSkemaDb.values());
}

/**
 * [ADMIN] Simulasi: POST /api/admin/skema
 */
export async function mockCreateSkema(skemaData) {
  await delay(500);
  if (!skemaData.id || !skemaData.judul) {
    throw new Error("ID Skema dan Judul Skema wajib diisi.");
  }
  const cleanId = skemaData.id.toUpperCase().replace(/\s+/g, "_");

  if (allSkemaDb.has(cleanId)) {
    throw new Error(`ID Skema '${cleanId}' sudah ada. Harap gunakan ID lain.`);
  }

  const newSkema = {
    id: cleanId,
    judul: skemaData.judul,
    deskripsi: skemaData.deskripsi || "",
    totalUnit: 0,
  };

  allSkemaDb.set(newSkema.id, newSkema);
  allUnitsDb.set(newSkema.id, []);
  return newSkema;
}

/**
 * [ADMIN] Simulasi: DELETE /api/admin/skema/:id
 */
export async function mockDeleteSkema(skemaId) {
  await delay(500);
  if (!allSkemaDb.has(skemaId)) {
    throw new Error(`Skema dengan ID '${skemaId}' tidak ditemukan.`);
  }

  // Hapus dari database
  allSkemaDb.delete(skemaId);
  allUnitsDb.delete(skemaId);
  allPraktikumSoalDb.delete(skemaId);

  return { success: true, message: `Skema ${skemaId} berhasil dihapus.` };
}

/**
 * [AUTH] Simulasi: POST /api/auth/login
 */
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

/**
 * [ADMIN] Simulasi: GET /api/admin/users
 */
export async function mockGetAllUsers() {
  await delay(600);
  return allUsers;
}
/**
 * [ADMIN] Simulasi: GET /api/admin/users?role=ASESI
 */
export async function mockGetAsesiUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ASESI");
}
/**
 * [ADMIN] Simulasi: GET /api/admin/users?role=ASESOR
 */
export async function mockGetAsesorUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ASESOR");
}
/**
 * [ADMIN] Simulasi: GET /api/admin/users?role=ADMIN_LSP
 */
export async function mockGetAdminUsers() {
  await delay(600);
  return allUsers.filter((u) => u.role === "ADMIN_LSP");
}

/**
 * [ADMIN] Simulasi: POST /api/admin/users/:id/role
 */
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

/**
 * [ASESI/ADMIN] Simulasi: GET /api/units?skemaId=...
 */
export async function mockGetUnitsForSkema(skemaId) {
  await delay(400);
  const units = allUnitsDb.get(skemaId) || [];
  return units;
}

/**
 * [ASESI/ADMIN] Simulasi: GET /api/materi?unitId=...
 */
export async function mockGetMateriForUnit(unitId) {
  await delay(300);

  // gunakan globalThis.allMateriDb jika tersedia (persistent/localStorage handled elsewhere)
  const db =
    typeof globalThis !== "undefined" && globalThis.allMateriDb
      ? globalThis.allMateriDb
      : new Map();

  // jika sudah ada di DB persisted, kembalikan langsung
  if (db.has(unitId)) {
    return db.get(unitId) || [];
  }

  // fallback statis jika belum ada materi untuk unit tersebut

  let fallback = [];

  // Logika khusus HANYA UNTUK "ADS-1"
  if (unitId === "ADS-1" || unitId === "DS-1") {
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
    // Logika default untuk SEMUA UNIT LAIN (ADS-2, DS-1, dll)
    fallback = [
      {
        id: `${unitId}-m1`,
        unitId,
        judul: "Materi PDF: Pengenalan Unit",
        jenis: "PDF",
        urlKonten:
          "https://drive.google.com/file/d/1faM_ZHi2xzEI6ZaEYh203x9qhyZliJSO/view?usp=drive_link",
        urutan: 1,
      },
    ];
  }

  try {
    if (typeof globalThis !== "undefined") {
      if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
      globalThis.allMateriDb.set(unitId, fallback.slice()); // simpan fallback ke DB mock
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(
            "mockMateriDb",
            JSON.stringify(Array.from(globalThis.allMateriDb.entries()))
          );
        } catch (e) {}
      }
    }
  } catch (e) {
    // ignore persistence errors, tetap kembalikan fallback
  }

  return fallback;
}

/**
 * [ASESI/ADMIN] Simulasi: GET /api/soal?unitId=...&tipeSoal=...
 */
export async function mockGetSoalForUnit(unitId, tipeSoal) {
  await delay(300);
  const db =
    typeof globalThis !== "undefined" && globalThis.allSoalDb
      ? globalThis.allSoalDb
      : allSoalDb;
  const allSoal = db.get(unitId) || [];
  if (tipeSoal === "SEMUA" || !tipeSoal) {
    // Urutkan berdasarkan 'urutan'
    allSoal.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    return allSoal;
  }

  const filtered = allSoal.filter((s) => s.tipeSoal === tipeSoal);
  // Urutkan berdasarkan 'urutan'
  filtered.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  return filtered;
}

/**
 * [ASESI] Simulasi: GET /api/asesi/soal/tryout
 */
export async function mockGetSoalTryoutGabungan(skemaId) {
  await delay(600);
  const unitsInSkema = allUnitsDb.get(skemaId) || [];
  let allTryoutSoal = [];

  unitsInSkema.forEach((unit) => {
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

/**
 * [ASESI] Simulasi: GET /api/asesi/soal/praktikum
 */
export async function mockGetSoalPraktikumGabungan(skemaId) {
  await delay(400);
  const db =
    typeof globalThis !== "undefined" && globalThis.allPraktikumSoalDb
      ? globalThis.allPraktikumSoalDb
      : allPraktikumSoalDb;
  const list = db.get(skemaId) || [];

  if (!Array.isArray(list) || list.length === 0) {
    return [
      {
        id: `${skemaId}-PRAKTIKUM-FALLBACK`,
        skemaId: skemaId,
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

/**
 * [ASESI] Simulasi: GET /api/asesi/progress
 */
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
  const isDemoAccount = DEMO_AKUN_ASESI.some(
    (d) => d.id === user.id || d.email === user.email
  );

  if (isDemoAccount) {
    const completedIds = new Set(unitsInSkema.map((u) => u.id));
    progress = {
      asesiId,
      skemaId,
      fase: "TRYOUT",
      completedUnitIds: completedIds,
      viewedMateriIds: new Set(),
      progressPembelajaran: 100,
      statusPraAsesmen: "SELESAI",
      tryoutSelesai: true,
      ujianTeoriSelesai: false,
      ujianPraktikumSelesai: false,
      unjukDiriSelesai: false,
    };

    progressMap.set(asesiId, progress);
    saveProgressMapToStorage(progressMap);
  } else if (!progress) {
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

  return {
    ...progress,
    completedUnitIds: Array.from(progress.completedUnitIds),
    viewedMateriIds: Array.from(progress.viewedMateriIds || new Set()),
    ujianPraktikumSelesai: progress.ujianPraktikumSelesai || false,
    unjukDiriSelesai: progress.unjukDiriSelesai || false,
  };
}

/**
 * [ASESI] Simulasi: POST /api/asesi/materi/view
 */
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

/**
 * [ASESI] Simulasi: POST /api/asesi/units/complete
 */
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

/**
 * [ASESI] Simulasi: POST /api/asesi/tryout/submit
 */
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

/**
 * [ASESI] Simulasi: POST /api/asesi/exams/teori/submit
 */
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

/**
 * [ASESI] Simulasi: POST /api/asesi/exams/praktikum/submit
 */
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

/**
 * [ASESI] Simulasi: POST /api/asesi/exams/unjuk-diri/complete
 */
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

/**
 * [ASESI] Simulasi: POST /api/asesi/pra-asesmen
 */
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

/**
 * [ASESOR] Simulasi: GET /api/asesor/penugasan
 */
export async function mockGetPenugasanAsesor(asesorId) {
  await delay(500);
  return Array.from(penugasanMap.values()).filter(
    (p) => p.asesorId === asesorId
  );
}

/**
 * [ASESOR] Simulasi: GET /api/asesor/penugasan?asesiId=...
 */
export async function mockGetPenugasanAsesi(asesiId) {
  await delay(500);
  return Array.from(penugasanMap.values()).filter((p) => p.asesiId === asesiId);
}

/**
 * [ASESOR] Simulasi: GET /api/asesor/penugasan/:id
 */
export async function mockGetPenugasanDetail(penugasanId) {
  await delay(300);
  const penugasan = penugasanMap.get(penugasanId);
  if (!penugasan) {
    throw new Error("Penugasan tidak ditemukan");
  }
  return penugasan;
}

/**
 * [ASESI] Simulasi: GET /api/asesi/schedule/offline
 */
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

/**
 * [ADMIN] Simulasi: GET /api/admin/stats/penugasan-count
 */
export async function mockGetPenugasanAsesiCount() {
  await delay(300);
  return penugasanMap.size;
}

/**
 * [ADMIN] Simulasi: GET /api/admin/stats/pending-grading
 */
export async function mockGetPendingGradingCount() {
  await delay(300);
  return Array.from(penugasanMap.values()).filter(
    (p) => p.statusPenilaian === "BELUM_DINILAI"
  ).length;
}

/**
 * [ASESOR] Simulasi: POST /api/asesor/penugasan/:id/submit
 */
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

/**
 * [ALL] Simulasi: GET /api/linimasa?skemaId=...
 */
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

/**
 * [ADMIN] Simulasi: GET /api/admin/offline-exam-sesi?skemaId=...
 */
export async function mockGetSesiUjianOffline(skemaId) {
  await delay(400);
  const allSesi = Array.from(sesiUjianOfflineDb.values());

  if (skemaId === "ALL") {
    return allSesi;
  }

  return allSesi.filter((s) => s.skemaId === skemaId);
}

/**
 * [ADMIN] Simulasi: GET /api/admin/offline-exam-sesi/:id
 */
export async function mockGetSesiUjianDetail(sesiId) {
  await delay(300);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi tidak ditemukan");
  const asesiTerplot = plottingDb.get(sesiId) || [];
  const asesiDetails = allUsers.filter((u) => asesiTerplot.includes(u.id));
  return { ...sesi, asesiTerplot: asesiDetails };
}

/**
 * [ADMIN] Simulasi: POST /api/admin/offline-exam-sesi
 */
export async function mockCreateSesiUjianOffline(sesi) {
  await delay(600);
  const id = `sesi-${Date.now()}`;
  const newSesi = { ...sesi, id };
  sesiUjianOfflineDb.set(id, newSesi);
  plottingDb.set(id, []);
  return newSesi;
}

/**
 * [ADMIN] Simulasi: POST /api/admin/linimasa
 */
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

/**
 * [ADMIN] Simulasi: GET /api/admin/asesi-available?skemaId=...&sesiId=...
 */
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

/**
 * [ADMIN] Simulasi: POST /api/admin/offline-exam-sesi/:id/plotting
 */
export async function mockUpdatePlottingSesi(sesiId, asesiIds) {
  await delay(500);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi tidak ditemukan");
  if (asesiIds.length > sesi.kapasitas) {
    throw new Error("Kapasitas ruangan terlampaui!");
  }
  plottingDb.set(sesiId, asesiIds);
  return { success: true, count: asesiIds.length };
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

/**
 * [ADMIN] Simulasi: PUT /api/admin/linimasa/:id
 */
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

/**
 * [ADMIN] Simulasi: DELETE /api/admin/linimasa/:id
 */
export async function mockDeleteLinimasa(eventId) {
  await delay(600);
  const event = linimasaDb.get(eventId);
  if (!event) throw new Error("Kegiatan tidak ditemukan");

  linimasaDb.delete(eventId);
  return { success: true, message: "Kegiatan berhasil dihapus" };
}

/**
 * [ADMIN] Simulasi: PUT /api/admin/offline-exam-sesi/:id
 */
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

/**
 * [ADMIN] Simulasi: DELETE /api/admin/offline-exam-sesi/:id
 */
export async function mockDeleteSesiUjianOffline(sesiId) {
  await delay(600);
  const sesi = sesiUjianOfflineDb.get(sesiId);
  if (!sesi) throw new Error("Sesi ujian tidak ditemukan");

  // Also remove from plotting
  if (plottingDb.has(sesiId)) {
    plottingDb.delete(sesiId);
  }

  sesiUjianOfflineDb.delete(sesiId);
  return { success: true, message: "Sesi ujian berhasil dihapus" };
}

/**
 * [ADMIN] Simulasi: GET /api/admin/stats
 */
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

/**
 * [ADMIN] Simulasi: POST /api/admin/assignments
 */
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

/**
 * [ASESI] Simulasi: GET /api/asesi/exam-status
 */
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
    unjukDiriDate.setDate(unjukDiriDate.getDate() - 1); // H-1
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

/**
 * [ASESI] Simulasi: GET /api/asesi/results
 */
export async function mockGetHasilAkhir(asesiId) {
  await delay(700);
  const asesiUser = allUsers.find((u) => u.id === asesiId);
  const skemaId = asesiUser?.skemaId || "ADS";
  const units = allUnitsDb.get(skemaId) || [];
  const totalUnitSkema = units.length;

  if (totalUnitSkema === 0) {
    return {
      asesiId,
      skemaId,
      statusAkhir: "BELUM KOMPETEN",
      hasilPraktikum: "BELUM KOMPETEN",
      hasilUnjukDiri: "BELUM KOMPETEN",
      hasilTeori: {
        statusAkumulasi: "BELUM KOMPETEN",
        totalUnitLulus: 0,
        totalUnitSkema: 0,
        rincianUnit: [],
      },
    };
  }

  const isDemoAccount = DEMO_AKUN_ASESI.some((d) => d.id === asesiId);

  if (isDemoAccount) {
    const rincianUnitLolos = units.map((unit) => ({
      unitId: unit.id,
      judul: unit.judul,
      status: "KOMPETEN",
      soalSesuai: 4,
      soalTotal: 4,
    }));

    return {
      asesiId,
      skemaId,
      statusAkhir: "KOMPETEN",
      hasilPraktikum: "KOMPETEN",
      hasilUnjukDiri: "KOMPETEN",
      hasilTeori: {
        statusAkumulasi: "KOMPETEN",
        totalUnitLulus: totalUnitSkema,
        totalUnitSkema: totalUnitSkema,
        rincianUnit: rincianUnitLolos,
      },
    };
  }

  let totalUnitLulus = 0;
  const rincianUnit = units.map((unit) => {
    const soalTotal = 4;
    const soalSesuai = Math.floor(Math.random() * 3) + 2;
    const status =
      soalSesuai / soalTotal >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";
    if (status === "KOMPETEN") totalUnitLulus++;
    return {
      unitId: unit.id,
      judul: unit.judul,
      status: status,
      soalSesuai: soalSesuai,
      soalTotal: soalTotal,
    };
  });

  const statusAkumulasiTeori =
    totalUnitLulus / totalUnitSkema >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";
  const hasilPraktikum = "KOMPETEN";
  const hasilUnjukDiri = "KOMPETEN";
  const statusAkhir =
    statusAkumulasiTeori === "KOMPETEN" &&
    hasilPraktikum === "KOMPETEN" &&
    hasilUnjukDiri === "KOMPETEN"
      ? "KOMPETEN"
      : "BELUM KOMPETEN";

  if (skemaId === "DS") {
    if (rincianUnit[8]) {
      rincianUnit[8].status = "BELUM KOMPETEN";
      rincianUnit[8].soalSesuai = 2;
    }
    if (rincianUnit[9]) {
      rincianUnit[9].status = "BELUM KOMPETEN";
      rincianUnit[9].soalSesuai = 1;
    }

    totalUnitLulus = rincianUnit.filter((r) => r.status === "KOMPETEN").length;
    const statusTeoriBaru =
      totalUnitLulus / totalUnitSkema >= 0.75 ? "KOMPETEN" : "BELUM KOMPETEN";
    const statusAkhirBaru =
      statusTeoriBaru === "KOMPETEN" &&
      hasilPraktikum === "KOMPETEN" &&
      hasilUnjukDiri === "KOMPETEN"
        ? "KOMPETEN"
        : "BELUM KOMPETEN";

    return {
      asesiId,
      skemaId,
      statusAkhir: statusAkhirBaru,
      hasilPraktikum,
      hasilUnjukDiri,
      hasilTeori: {
        statusAkumulasi: statusTeoriBaru,
        totalUnitLulus,
        totalUnitSkema,
        rincianUnit,
      },
    };
  }

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

/**
 * [ADMIN] Simulasi: GET /api/admin/results/rekap
 */
export async function mockGetRekapHasilAkhir() {
  await delay(1200);

  const asesiUsers = allUsers.filter((u) => u.role === "ASESI");

  const allPenugasan = Array.from(penugasanMap.values());
  const findAsesorName = (asesorId) =>
    allUsers.find((u) => u.id === asesorId)?.nama || "N/A";

  const rekapPromises = asesiUsers.map(async (asesi) => {
    const hasilAkhir = await mockGetHasilAkhir(asesi.id);

    const penugasanAsesi = allPenugasan.filter((p) => p.asesiId === asesi.id);
    const units = allUnitsDb.get(asesi.skemaId) || [];

    const pTeoriAssignments = penugasanAsesi.filter((p) => p.tipe === "TEORI");
    const pPraktikum = penugasanAsesi.find((p) => p.tipe === "PRAKTIKUM");
    const pUnjukDiri = penugasanAsesi.find((p) => p.tipe === "UNJUK_DIRI");

    const asesorTeoriDetail = pTeoriAssignments.map((p) => {
      const unit = units.find((u) => u.nomorUnit === p.unitId);
      return {
        unitId: p.unitId,
        unitJudul: unit?.judul || p.unitJudul || "Unit Tidak Ditemukan",
        asesorId: p.asesorId,
        asesorNama: findAsesorName(p.asesorId),
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

/**
 * [ADMIN] Simulasi: POST /api/admin/units?skemaId=...
 */
export async function mockCreateUnit(skemaId, unitData) {
  await delay(400);
  if (!skemaId) throw new Error("skemaId wajib");
  const units = allUnitsDb.get(skemaId) || [];
  const nomor = Number(unitData.nomorUnit) || units.length + 1;
  const id = `${skemaId}-${nomor}`;
  if (units.find((u) => u.id === id)) {
    throw new Error(`Unit dengan id ${id} sudah ada`);
  }
  const newUnit = {
    id,
    skemaId,
    nomorUnit: nomor,
    kodeUnit: unitData.kodeUnit || `${skemaId}.UNIT.${nomor}`,
    judul: unitData.judul || `Unit ${nomor}`,
    deskripsi: unitData.deskripsi || "",
    materiCount: 0,
    soalCount: 0,
    durasiTeori: Number(unitData.durasiTeori) || 15,
    urutan: units.length + 1,
  };
  units.push(newUnit);
  allUnitsDb.set(skemaId, units);
  allSoalDb.set(id, []); // inisialisasi tempat soal untuk unit baru
  const skema = allSkemaDb.get(skemaId);
  if (skema) skema.totalUnit = (allUnitsDb.get(skemaId) || []).length;
  return newUnit;
}

/**
 * [ADMIN] Simulasi: PUT /api/admin/units/:id
 */
export async function mockUpdateUnit(skemaId, unitId, updates) {
  await delay(300);
  const units = allUnitsDb.get(skemaId) || [];
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx === -1) throw new Error("Unit tidak ditemukan");
  const updated = {
    ...units[idx],
    ...updates,
    durasiTeori: Number(updates.durasiTeori ?? units[idx].durasiTeori),
  };
  units[idx] = updated;
  allUnitsDb.set(skemaId, units);
  return updated;
}

/**
 * [ADMIN] Simulasi: DELETE /api/admin/units/:id
 */
export async function mockDeleteUnit(skemaId, unitId) {
  await delay(300);
  const units = allUnitsDb.get(skemaId) || [];
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx === -1) throw new Error("Unit tidak ditemukan");
  units.splice(idx, 1);
  // update urutan
  units.forEach((u, i) => (u.urutan = i + 1));
  allUnitsDb.set(skemaId, units);
  allSoalDb.delete(unitId);
  const skema = allSkemaDb.get(skemaId);
  if (skema) skema.totalUnit = units.length;
  return { success: true };
}

/**
 * [ADMIN] Simulasi: DELETE /api/admin/soal/:id
 * Mencari soal di allSoalDb (per unit) atau allPraktikumSoalDb (gabungan per skema) dan menghapusnya.
 */
export async function mockDeleteSoal(skemaId, soalId) {
  await delay(300);

  // 1) Cek di soal praktikum gabungan (sekarang array)
  const praktikDb =
    typeof globalThis !== "undefined" && globalThis.allPraktikumSoalDb
      ? globalThis.allPraktikumSoalDb
      : allPraktikumSoalDb;
  let praktikumList = praktikDb.get(skemaId);
  if (Array.isArray(praktikumList)) {
    const idx = praktikumList.findIndex((p) => p.id === soalId);
    if (idx !== -1) {
      praktikumList.splice(idx, 1);
      praktikDb.set(skemaId, praktikumList);
      return { success: true, removedFrom: "praktikum" };
    }
  }

  // 2) Cek di allSoalDb (unit-level)
  const soalDb =
    typeof globalThis !== "undefined" && globalThis.allSoalDb
      ? globalThis.allSoalDb
      : allSoalDb;
  for (const [unitId, soalList] of soalDb.entries()) {
    const idx = soalList.findIndex((s) => s.id === soalId);
    if (idx !== -1) {
      soalList.splice(idx, 1);
      soalDb.set(unitId, soalList);
      return { success: true, removedFrom: "unit", unitId };
    }
  }

  // jika tidak ditemukan
  throw new Error("Soal tidak ditemukan di database mock.");
}

/**
 * [ADMIN] Simulasi: POST /api/admin/soal (create soal unit)
 */
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

  // Gunakan push() untuk menambah ke akhir array (urutan terakhir)
  list.push(newSoal);

  db.set(unitId, list);
  // pastikan globalThis reference di-set jika belum
  if (typeof globalThis !== "undefined" && !globalThis.allSoalDb)
    globalThis.allSoalDb = db;
  return newSoal;
}

/**
 * [ADMIN] Simulasi: PUT /api/admin/soal/:id (update soal unit)
 * Jika unitId diberikan, update di unit tersebut.
 * Jika unitId falsy (null/undefined), cari soalId di seluruh allSoalDb dan update di tempat ditemukan.
 */
export async function mockUpdateSoal(unitId, soalId, updates) {
  await delay(250);

  if (!soalId || !updates) throw new Error("soalId dan updates wajib");

  // pastikan allSoalDb ada
  if (typeof globalThis === "undefined")
    throw new Error("globalThis tidak tersedia");
  if (!globalThis.allSoalDb) globalThis.allSoalDb = new Map();

  // update langsung jika unitId diberikan
  if (unitId) {
    const list = globalThis.allSoalDb.get(unitId) || [];
    const idx = list.findIndex((s) => s.id === soalId);
    if (idx === -1)
      throw new Error("Soal tidak ditemukan di unit yang diberikan");
    const merged = { ...list[idx], ...updates, updatedAt: new Date() };
    list[idx] = merged;
    globalThis.allSoalDb.set(unitId, list);
    return merged;
  }

  // cari di seluruh unit
  for (const [uId, list] of globalThis.allSoalDb.entries()) {
    const idx = list.findIndex((s) => s.id === soalId);
    if (idx !== -1) {
      const merged = { ...list[idx], ...updates, updatedAt: new Date() };
      list[idx] = merged;
      globalThis.allSoalDb.set(uId, list);
      return merged;
    }
  }

  throw new Error("Soal tidak ditemukan di database mock.");
}

/**
 * [ADMIN] Simulasi: POST /api/admin/soal/tryout (create tryout pada skema)
 * Implementasi: simpan tryout pada unit pertama skema (fallback) sehingga
 * mockGetSoalTryoutGabungan tetap mengumpulkan TRYOUT dari allSoalDb.
 */
export async function mockCreateTryout(skemaId, soalData) {
  await delay(300);
  const units = allUnitsDb.get(skemaId) || [];
  if (units.length === 0) throw new Error("Skema tidak memiliki unit");

  const targetUnitId = units[0].id;
  const db =
    typeof globalThis !== "undefined" && globalThis.allSoalDb
      ? globalThis.allSoalDb
      : allSoalDb;
  const list = db.get(targetUnitId) || [];

  // hitung urutan untuk soal tryout saja (bukan total semua)
  const tryoutSoalCount = list.filter((s) => s.tipeSoal === "TRYOUT").length;

  const payload = {
    ...soalData,
    tipeSoal: "TRYOUT",
    urutan: soalData.urutan ?? tryoutSoalCount + 1, // urutan per tipe soal
  };

  return await mockCreateSoal(targetUnitId, payload);
}

/**
 * [ADMIN] Simulasi: POST/PUT /api/admin/soal/praktikum (create atau update praktikum per skema)
 */
export async function mockUpsertPraktikum(skemaId, praktikumData) {
  await delay?.(300);

  if (!skemaId) throw new Error("skemaId wajib untuk praktikum");
  if (typeof globalThis === "undefined")
    throw new Error("globalThis tidak tersedia");

  if (!globalThis.allPraktikumSoalDb) globalThis.allPraktikumSoalDb = new Map();
  const db = globalThis.allPraktikumSoalDb;

  let list = db.get(skemaId);
  if (!Array.isArray(list)) list = [];

  // update jika id ada
  if (praktikumData?.id) {
    const idx = list.findIndex((p) => p.id === praktikumData.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...praktikumData, updatedAt: new Date() };
      db.set(skemaId, list);
      return list[idx];
    }
  }

  // buat baru (append)
  const id = praktikumData?.id || `${skemaId}-PRAKTIKUM-${Date.now()}`;
  const newPraktikum = {
    id,
    skemaId,
    tipeSoal: "UJIAN_PRAKTIKUM",
    tipeJawaban: praktikumData?.tipeJawaban || "UPLOAD_FILE",
    judul:
      praktikumData?.judul ||
      (praktikumData?.teks || "").slice(0, 80) ||
      "Praktikum",
    teks: praktikumData?.teks || "",
    filePendukung: praktikumData?.filePendukung || praktikumData?.file || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  list.push(newPraktikum);
  db.set(skemaId, list);
  return newPraktikum;
}

// --- tambahkan setelah deklarasi allPraktikumSoalDb (di bagian atas file) ---
if (typeof globalThis !== "undefined") {
  // pastikan referensi global mengacu ke map yang sama agar semua fungsi mock memakai DB yang sama
  globalThis.allSoalDb = allSoalDb;
  globalThis.allPraktikumSoalDb = allPraktikumSoalDb;
  if (!globalThis.allMateriDb) globalThis.allMateriDb = new Map();
}

// ensure global maps exist so UI or other mock helpers won't throw
if (typeof globalThis !== "undefined") {
  if (!globalThis.allMateriDb)
    globalThis.allMateriDb = getMateriMapFromStorage();
  if (!globalThis.allSoalDb) globalThis.allSoalDb = new Map(); // unitId -> soal[]
  if (!globalThis.allPraktikumSoalDb) globalThis.allPraktikumSoalDb = new Map(); // skemaId -> array
}

// Compatibility exports (alias) if typo-ed function exists
// if mockUpsertPrraktikum exists elsewhere, delegate to it
if (typeof globalThis !== "undefined") {
  // define alias function only if not already exported
  try {
    // if mockUpsertPraktikum not defined in module scope, define export wrapper
    // (we still place function definition so module exports include it)
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
