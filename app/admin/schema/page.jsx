/**
 * Halaman Manajemen Skema & Konten (Admin)
 *
 * Halaman ini berfungsi sebagai pusat kontrol untuk:
 * 1. Manajemen Skema Sertifikasi (CRUD Skema & Tahun Ajaran).
 * 2. Manajemen Unit Kompetensi per Skema.
 * 3. Manajemen Materi Pembelajaran (Video, PDF, Link) per Unit.
 * 4. Manajemen Bank Soal (Teori, Tryout, Praktikum).
 *
 * Struktur:
 * - SchemaPage (Parent): Mengelola tab Skema dan Tahun Ajaran aktif.
 * - SkemaContentManager (Child): Mengelola konten (Unit/Soal/Materi) berdasarkan skema & tahun yang dipilih.
 * - SoalList (Component): Menampilkan daftar soal dengan aksi edit/hapus.
 */

"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  mockGetUnitsForSkema,
  mockGetMateriForUnit,
  mockGetSoalForUnit,
  mockGetAllSkema,
  mockCreateSkema,
  mockGetSoalTryoutGabungan,
  mockGetSoalPraktikumGabungan,
  mockCreateUnit,
  mockUpdateUnit,
  mockDeleteUnit,
  mockCreateMateri,
  mockUpdateMateri,
  mockDeleteMateri,
  mockCreateSoal,
  mockUpdateSoal,
  mockDeleteSoal,
  mockCreateTryout,
  mockUpsertPraktikum,
  mockDeleteSkema,
  mockGetYearsForSkema,
  mockAddYearToSkema,
  mockDeleteYearFromSkema,
} from "@/lib/api-mock";

import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, BookOpen, FileText, File, UploadCloud, X } from "lucide-react"; 
import { Spinner } from "@/components/ui/spinner";

/**
 * Komponen Daftar Soal
 * Menampilkan list soal dengan opsi edit dan hapus.
 */
const SoalList = ({ soal, loading, onEdit, onDelete }) => {
  if (loading) return <Skeleton className="h-20 w-full" />;
  if (soal.length === 0) return <AlertDescription>Belum ada soal.</AlertDescription>;

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {soal.map((s) => (
        <div key={s.id} className="p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.tipeSoal === "TRYOUT" ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"}`}>{s.tipeSoal}</span>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => onEdit(s)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={() => onDelete(s)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="font-medium text-sm my-2">{s.teks}</p>
          <span className="text-xs text-gray-500">Tipe Jawaban: {s.tipeJawaban}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Komponen Manajer Konten Skema
 * Mengelola Unit, Materi, dan Soal untuk Skema dan Tahun Ajaran tertentu.
 */
const SkemaContentManager = ({ 
  skemaId, 
  activeContentTab, 
  setInfoDialog,
  activeTahunAjaran
}) => {
  // State Data
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [soalTeori, setSoalTeori] = useState([]);
  const [soalTryout, setSoalTryout] = useState([]);
  const [soalPraktikum, setSoalPraktikum] = useState([]);
  const [materi, setMateri] = useState([]);
  
  // State Loading & Proses
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);

  // State Dialog Form
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isMateriDialogOpen, setIsMateriDialogOpen] = useState(false);
  const [isSoalDialogOpen, setIsSoalDialogOpen] = useState(false);

  // State Dialog Hapus (Target Object untuk menampilkan nama di popup)
  const [deleteUnitTarget, setDeleteUnitTarget] = useState(null);
  const [deleteMateriTarget, setDeleteMateriTarget] = useState(null);
  const [deleteSoalTarget, setDeleteSoalTarget] = useState(null);

  // State Form Input
  const [unitForm, setUnitForm] = useState({ id: null, nomorUnit: "", kodeUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
  const [materiForm, setMateriForm] = useState({ id: null, judul: "", jenis: "VIDEO", urlKonten: "", file: null });
  const [soalForm, setSoalForm] = useState({
    id: null, teks: "", tipeSoal: "UJIAN_TEORI", tipeJawaban: "ESAI",
    pilihan: ["", "", "", ""], kunciJawaban: "",
    filePendukung: [], 
  });

  // Load data awal saat Skema atau Tahun berubah
  useEffect(() => {
    loadUnitsAndGlobalSoal();
  }, [skemaId, activeTahunAjaran]); 

  const loadUnitsAndGlobalSoal = async () => {
    try {
      setLoadingUnits(true);
      setLoadingContent(true); 
      setSelectedUnit(null);
      setSoalTeori([]);

      // Ambil Unit Kompetensi
      const unitsData = await mockGetUnitsForSkema(skemaId, activeTahunAjaran);
      setUnits(unitsData || []); 

      // Ambil Bank Soal Global (Tryout & Praktikum)
      const [tryoutData, praktikumData] = await Promise.all([
        mockGetSoalTryoutGabungan(skemaId, activeTahunAjaran), 
        mockGetSoalPraktikumGabungan(skemaId, activeTahunAjaran), 
      ]);
      setSoalTryout(tryoutData || []); 
      setSoalPraktikum(Array.isArray(praktikumData) ? praktikumData : (praktikumData ? [praktikumData] : []));
      
      // Auto-select unit pertama jika ada
      if (unitsData && unitsData.length > 0) {
        await selectUnit(unitsData[0]);
      } else {
        setLoadingContent(false); 
      }
    } catch (error) {
      console.error("Error loading units:", error);
    } finally {
      setLoadingUnits(false);
    }
  };

  const selectUnit = async (unit) => {
    if (selectedUnit?.id === unit.id) return;

    setSelectedUnit(unit);
    setLoadingContent(true);
    try {
      const [materiData, soalTeoriData] = await Promise.all([
        mockGetMateriForUnit(unit.id),
        mockGetSoalForUnit(unit.id, "UJIAN_TEORI"), 
      ]);
      setMateri(materiData || []);
      setSoalTeori(soalTeoriData || []);
    } catch (error) {
      console.error("Error loading unit content:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  // --- Handlers Form Soal ---

  const handleOpenSoalModal = (tipeSoalDefault, soalData = null) => {
    if (soalData) {
      setSoalForm({
        ...soalData,
        pilihan: soalData.pilihan || ["", "", "", ""],
        kunciJawaban: soalData.kunciJawaban || "",
        filePendukung: soalData.filePendukung || [], 
      });
    } else {
      setSoalForm({
        id: null, teks: "", tipeSoal: tipeSoalDefault,
        tipeJawaban: tipeSoalDefault === "UJIAN_PRAKTIKUM" ? "UPLOAD_FILE" : "ESAI",
        pilihan: ["", "", "", ""], kunciJawaban: "", 
        filePendukung: [], 
      });
    }
    setIsSoalDialogOpen(true);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map(file => ({
        id: `temp-${file.name}`, 
        nama: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: `/api/mock-download/${file.name}` 
      }));
      
      setSoalForm(prev => ({
        ...prev,
        filePendukung: [...prev.filePendukung, ...newFiles]
      }));
    }
  };

  const removeFile = (fileName) => {
      setSoalForm(prev => ({
        ...prev,
        filePendukung: prev.filePendukung.filter(f => f.nama !== fileName)
      }));
  };

  // --- Handlers CRUD Unit ---

  const handleSaveUnit = async (e) => {
    e.preventDefault(); 
    if (isSavingUnit) return;

    // Validasi duplikasi nomor/kode unit dalam tahun yang sama
    const unitsInSameYear = units.filter(u => u.tahunAjaran === activeTahunAjaran);
    const nomorToCheck = Number(unitForm.nomorUnit) || undefined;
    if (!unitForm.id && nomorToCheck && unitsInSameYear.some(u => Number(u.nomorUnit) === nomorToCheck)) {
      setInfoDialog({ open: true, title: "Validasi Gagal", message: `Unit nomor ${nomorToCheck} sudah ada pada tahun ${activeTahunAjaran}.` });
      return;
    }
    if (!unitForm.id && unitForm.kodeUnit && unitsInSameYear.some(u => (u.kodeUnit || "").toLowerCase() === unitForm.kodeUnit.toLowerCase())) {
      setInfoDialog({ open: true, title: "Validasi Gagal", message: `Kode Unit '${unitForm.kodeUnit}' sudah terdaftar pada tahun ${activeTahunAjaran}.` });
      return;
    }

    try {
      setIsSavingUnit(true);
      
      const payload = {
        nomorUnit: Number(unitForm.nomorUnit) || undefined,
        kodeUnit: unitForm.kodeUnit,
        judul: unitForm.judul,
        deskripsi: unitForm.deskripsi,
        durasiTeori: Number(unitForm.durasiTeori) || 15,
        tahunAjaran: activeTahunAjaran,
      };

      if (unitForm.id) {
        const updated = await mockUpdateUnit(skemaId, unitForm.id, payload);
        const fresh = await mockGetUnitsForSkema(skemaId, activeTahunAjaran);
        setUnits(fresh || []);
        if (selectedUnit?.id === updated.id) setSelectedUnit(updated);
      } else {
        await mockCreateUnit(skemaId, payload);
        const fresh = await mockGetUnitsForSkema(skemaId, activeTahunAjaran);
        setUnits(fresh || []);
        const last = (fresh || []).slice(-1)[0];
        if (last) await selectUnit(last);
      }

      setIsUnitDialogOpen(false);
      setUnitForm({ id: null, nomorUnit: "", kodeUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
    } catch (err) {
      console.error("Gagal menyimpan unit:", err);
      setInfoDialog({ open: true, title: "Gagal Menyimpan", message: `Gagal menyimpan unit: ${err.message}` });
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleDeleteUnit = (unit) => {
    setDeleteUnitTarget(unit);
  };

  const confirmDeleteUnit = async () => {
    if (!deleteUnitTarget) return;
    try {
      await mockDeleteUnit(skemaId, deleteUnitTarget.id);
      const freshUnits = await mockGetUnitsForSkema(skemaId, activeTahunAjaran);
      setUnits(freshUnits || []);
      
      if (selectedUnit?.id === deleteUnitTarget.id) {
        setSelectedUnit(null);
        if (freshUnits && freshUnits.length > 0) {
          await selectUnit(freshUnits[0]);
        }
      }
    } catch (err) {
      console.error("Gagal menghapus unit:", err);
      setInfoDialog({ open: true, title: "Gagal Menghapus", message: `Gagal menghapus unit: ${err.message}` });
    } finally {
      setDeleteUnitTarget(null);
    }
  };

  // --- Handlers CRUD Materi ---

  const handleSaveMateri = async (e) => {
    e.preventDefault(); 
    
    if (materiForm.jenis === "PDF" && !materiForm.file && !materiForm.urlKonten) {
      setInfoDialog({ open: true, title: "Validasi Gagal", message: "Silakan pilih file PDF untuk materi." });
      return;
    }
    
    if ((materiForm.jenis === "VIDEO" || materiForm.jenis === "LINK") && !materiForm.urlKonten) {
      setInfoDialog({ open: true, title: "Validasi Gagal", message: "URL wajib diisi untuk tipe Video/Link." });
      return;
    }

    try {
      const payload = {
        judul: materiForm.judul,
        jenis: materiForm.jenis,
        urlKonten: materiForm.urlKonten,
        file: materiForm.file
      };

      if (materiForm.id) {
        await mockUpdateMateri(selectedUnit.id, materiForm.id, payload);
      } else {
        await mockCreateMateri(selectedUnit.id, payload);
      }

      const fresh = await mockGetMateriForUnit(selectedUnit.id);
      setMateri(fresh || []);
      
      setIsMateriDialogOpen(false);
      setMateriForm({ id: null, judul: "", jenis: "VIDEO", urlKonten: "", file: null });
    } catch (err) {
      console.error("Gagal menyimpan materi:", err);
      setInfoDialog({ open: true, title: "Gagal Menyimpan", message: `Gagal menyimpan materi: ${err.message}` });
    }
  };

  const handleDeleteMateri = (m) => {
    setDeleteMateriTarget(m);
  };

  const confirmDeleteMateri = async () => {
    if (!deleteMateriTarget) return;
    try {
      await mockDeleteMateri(selectedUnit.id, deleteMateriTarget.id);
      const fresh = await mockGetMateriForUnit(selectedUnit.id);
      setMateri(fresh || []);
    } catch (err) {
      console.error("Gagal menghapus materi:", err);
      setInfoDialog({ open: true, title: "Gagal Menghapus", message: `Gagal menghapus materi: ${err.message}` });
    } finally {
      setDeleteMateriTarget(null);
    }
  };

  // --- Handlers CRUD Soal ---

  const handleSaveSoal = async (e) => {
     e.preventDefault(); 
     
     try {
       // Validasi khusus Praktikum
       if (soalForm.tipeSoal === "UJIAN_PRAKTIKUM") {
         if (!soalForm.filePendukung || soalForm.filePendukung.length === 0) {
           setInfoDialog({ open: true, title: "Validasi Gagal", message: "Silakan unggah minimal satu file pendukung untuk soal praktikum." });
           return;
         }
       }

       const payload = { ...soalForm, tahunAjaran: activeTahunAjaran };

       if (soalForm.tipeSoal === "UJIAN_TEORI") {
         if (!selectedUnit) {
           setInfoDialog({ open: true, title: "Validasi Gagal", message: "Pilih unit dulu sebelum menambah soal teori." });
           return;
         }
         if (soalForm.id) {
           await mockUpdateSoal(selectedUnit.id, soalForm.id, payload);
         } else {
           await mockCreateSoal(selectedUnit.id, { ...payload, tipeSoal: "UJIAN_TEORI" });
         }
         const teori = await mockGetSoalForUnit(selectedUnit.id, "UJIAN_TEORI");
         setSoalTeori(teori || []);
       } else if (soalForm.tipeSoal === "TRYOUT") {
         if (soalForm.id) {
           await mockUpdateSoal(null, soalForm.id, payload);
         } else {
           await mockCreateTryout(skemaId, payload, activeTahunAjaran);
         }
         const tryoutData = await mockGetSoalTryoutGabungan(skemaId, activeTahunAjaran);
         setSoalTryout(tryoutData || []);
       } else if (soalForm.tipeSoal === "UJIAN_PRAKTIKUM") {
         await mockUpsertPraktikum(skemaId, payload);
         const praktikumData = await mockGetSoalPraktikumGabungan(skemaId, activeTahunAjaran);
         setSoalPraktikum(Array.isArray(praktikumData) ? praktikumData : (praktikumData ? [praktikumData] : []));
       }

       setIsSoalDialogOpen(false);
     } catch (err) {
       console.error("Gagal menyimpan soal:", err);
       setInfoDialog({ open: true, title: "Gagal Menyimpan", message: `Gagal menyimpan soal: ${err.message}` });
     }
  };

  const handleDeleteSoal = (soal) => {
    setDeleteSoalTarget(soal);
  };

  const confirmDeleteSoal = async () => {
    if (!deleteSoalTarget) return;
    try {
      await mockDeleteSoal(skemaId, deleteSoalTarget.id);
      setSoalTeori(prev => prev.filter(s => s.id !== deleteSoalTarget.id));
      setSoalTryout(prev => prev.filter(s => s.id !== deleteSoalTarget.id));
      setSoalPraktikum(prev => prev.filter(s => s.id !== deleteSoalTarget.id));
      
      if (deleteSoalTarget.unitId && selectedUnit?.id === deleteSoalTarget.unitId) {
        const teori = await mockGetSoalForUnit(selectedUnit.id, "UJIAN_TEORI");
        setSoalTeori(teori || []);
      }
    } catch (err) {
      console.error("Gagal menghapus soal:", err);
      setInfoDialog({ open: true, title: "Gagal Menghapus", message: `Gagal menghapus soal: ${err.message}` });
    } finally {
      setDeleteSoalTarget(null);
    }
  };
  
  const handleMateriFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setInfoDialog({ open: true, title: "File Tidak Sesuai", message: "Hanya file PDF yang diperbolehkan." });
      return;
    }

    const fileMeta = {
      nama: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: `/api/mock-download/${file.name}`,
      id: `temp-${file.name}-${Date.now()}`
    };

    setMateriForm(prev => ({ 
      ...prev, 
      file: fileMeta,
      urlKonten: fileMeta.url 
    }));
  };

  const loadPraktikumSoal = async () => {
    try {
      const data = await mockGetSoalPraktikumGabungan(skemaId);
      setSoalPraktikum(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      console.error("Gagal load praktikum:", err);
      setSoalPraktikum([]);
    }
  };

  useEffect(() => {
    if (skemaId) {
      loadPraktikumSoal();
    }
  }, [skemaId]);

  return (
    <React.Fragment> 
      <Tabs value={activeContentTab} className="w-full">
        {/* Tab Unit & Materi */}
        <TabsContent value="unit" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg">Unit Kompetensi</CardTitle>
                  <Button size="sm" onClick={() => {
                    setUnitForm({ id: null, nomorUnit: "", kodeUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
                    setIsUnitDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Unit
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingUnits ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : units.length === 0 ? (
                    <AlertDescription className="text-center py-4">Skema ini belum memiliki unit.</AlertDescription>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                      {units.map((unit) => (
                        <div
                          key={unit.id}
                          onClick={() => selectUnit(unit)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedUnit?.id === unit.id ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200 hover:border-gray-400"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-gray-800">
                              {unit.nomorUnit}. {unit.judul}
                            </span>
                            <div className="flex items-center -mr-2">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); setUnitForm(unit); setIsUnitDialogOpen(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {loadingUnits ? ( 
                <Skeleton className="h-96 w-full" />
              ) : !selectedUnit && units.length > 0 ? (
                <Card className="h-full flex items-center justify-center min-h-[300px]">
                  <CardContent className="text-center text-gray-500">
                    <p>Pilih unit di sebelah kiri untuk melihat materi dan soal.</p>
                  </CardContent>
                </Card>
              ) : selectedUnit ? (
                <Tabs defaultValue="materi" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="materi">Materi Pembelajaran</TabsTrigger>
                    <TabsTrigger value="soal_teori">Soal Ujian Teori</TabsTrigger>
                  </TabsList>
                  <TabsContent value="materi" className="mt-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Daftar Materi</CardTitle>
                        <Button size="sm" onClick={() => {
                          setMateriForm({ id: null, judul: "", jenis: "VIDEO", urlKonten: "", file: null });
                          setIsMateriDialogOpen(true);
                        }}>
                          <Plus className="w-4 h-4 mr-2" /> Tambah Materi
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {loadingContent ? <Skeleton className="h-20 w-full" /> : materi.length === 0 ? <AlertDescription>Belum ada materi.</AlertDescription> : (
                          materi.map((m) => (
                            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {m.jenis === "VIDEO" ? <BookOpen className="w-5 h-5 text-red-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                                <div>
                                  <p className="font-medium text-sm">{m.judul}</p>
                                  <p className="text-xs text-muted-foreground">{m.urlKonten}</p>
                                </div>
                              </div>
                              <div className="flex items-center -mr-2">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => { setMateriForm(m); setIsMateriDialogOpen(true); }}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={() => handleDeleteMateri(m)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="soal_teori" className="mt-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Bank Soal Ujian Teori</CardTitle>
                        <Button size="sm" onClick={() => handleOpenSoalModal("UJIAN_TEORI")}>
                          <Plus className="w-4 h-4 mr-2" /> Tambah Soal
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <SoalList 
                          soal={soalTeori} 
                          loading={loadingContent} 
                          onEdit={(s) => handleOpenSoalModal("UJIAN_TEORI", s)} 
                          onDelete={handleDeleteSoal}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : ( 
                  <Card className="h-full flex items-center justify-center min-h-[300px]">
                      <CardContent className="text-center text-gray-500">
                        <p>Skema ini belum memiliki unit.</p>
                        <Button size="sm" className="mt-4" onClick={() => {
                          setUnitForm({ id: null, nomorUnit: "", kodeUnit: "", judul: "", deskripsi: "", durasiTeori: 15 });
                          setIsUnitDialogOpen(true);
                        }}>
                          <Plus className="w-4 h-4 mr-2" /> Tambah Unit Pertama
                        </Button>
                      </CardContent>
                    </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Tryout */}
        <TabsContent value="tryout" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bank Soal Tryout (Skema {skemaId})</CardTitle>
              <Button size="sm" onClick={() => handleOpenSoalModal("TRYOUT")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Soal
              </Button>
            </CardHeader>
            <CardContent>
              <SoalList 
                soal={soalTryout} 
                loading={loadingUnits} 
                onEdit={(s) => handleOpenSoalModal("TRYOUT", s)} 
                onDelete={handleDeleteSoal}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Praktikum */}
        <TabsContent value="praktikum" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bank Soal Ujian Praktikum (Skema {skemaId})</CardTitle>
              <Button size="sm" onClick={() => handleOpenSoalModal("UJIAN_PRAKTIKUM")}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Soal
              </Button>
            </CardHeader>
            <CardContent>
              <SoalList 
                soal={soalPraktikum} 
                loading={loadingUnits} 
                onEdit={(s) => handleOpenSoalModal("UJIAN_PRAKTIKUM", s )} 
                onDelete={handleDeleteSoal}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* --- Modal Unit --- */}
      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent>
          <form id="unit-form" onSubmit={handleSaveUnit}>
            <DialogHeader>
              <DialogTitle>{unitForm.id ? "Edit Unit" : "Tambah Unit Baru"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="unit-nomor">Unit ke *</Label>
              <Input id="unit-nomor" placeholder="Nomor Unit" value={unitForm.nomorUnit} onChange={(e) => setUnitForm({ ...unitForm, nomorUnit: e.target.value })} required />
              
              <Label htmlFor="unit-kode">Kode Unit</Label>
              <Input id="unit-kode" placeholder="Kode Unit (Misal: J.62DMI...)" value={unitForm.kodeUnit} onChange={(e) => setUnitForm({ ...unitForm, kodeUnit: e.target.value })} />

              <Label htmlFor="unit-judul">Judul Unit *</Label>
              <Input id="unit-judul" placeholder="Judul Unit" value={unitForm.judul} onChange={(e) => setUnitForm({ ...unitForm, judul: e.target.value })} required />
              
              <Label htmlFor="unit-deskripsi">Deskripsi</Label>
              <Textarea id="unit-deskripsi" placeholder="Deskripsi Unit" value={unitForm.deskripsi} onChange={(e) => setUnitForm({ ...unitForm, deskripsi: e.target.value })} />
              
              <Label htmlFor="unit-durasi">Durasi Ujian Teori (Menit) *</Label>
              <Input id="unit-durasi" type="number" placeholder="Durasi Ujian Teori (menit)" value={unitForm.durasiTeori} onChange={(e) => setUnitForm({ ...unitForm, durasiTeori: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUnitDialogOpen(false)}>Batal</Button>
              <Button type="submit" form="unit-form" disabled={isSavingUnit}>
                {isSavingUnit ? <Spinner className="w-4 h-4 mr-2" /> : "Simpan Unit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Modal Materi --- */}
      <Dialog open={isMateriDialogOpen} onOpenChange={setIsMateriDialogOpen}>
        <DialogContent>
          <form id="materi-form" onSubmit={handleSaveMateri}>
            <DialogHeader>
              <DialogTitle>{materiForm.id ? "Edit Materi" : "Tambah Materi Baru"}</DialogTitle>
              <DialogDescription>Materi ini akan muncul di unit: {selectedUnit?.judul}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="materi-judul">Judul Materi *</Label>
              <Input 
                id="materi-judul"
                placeholder="Judul Materi" 
                value={materiForm.judul} 
                onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })} 
                required
              />
              
              <Label htmlFor="materi-jenis">Jenis Materi *</Label>
              <Select value={materiForm.jenis} onValueChange={(value) => setMateriForm({ ...materiForm, jenis: value })}>
                <SelectTrigger id="materi-jenis"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video (URL)</SelectItem>
                  <SelectItem value="PDF">Dokumen PDF (Upload)</SelectItem>
                  <SelectItem value="LINK">Link Eksternal</SelectItem>
                </SelectContent>
              </Select>

              {materiForm.jenis === "VIDEO" && (
                <div>
                  <Label htmlFor="materi-url-video">URL Video *</Label>
                  <Input 
                    id="materi-url-video"
                    placeholder="https://youtube.com/..." 
                    value={materiForm.urlKonten} 
                    onChange={(e) => setMateriForm({ ...materiForm, urlKonten: e.target.value })}
                    required 
                  />
                </div>
              )}

              {materiForm.jenis === "LINK" && (
                <div>
                  <Label htmlFor="materi-url-link">URL Link Eksternal *</Label>
                  <Input 
                    id="materi-url-link"
                    placeholder="https://..." 
                    value={materiForm.urlKonten} 
                    onChange={(e) => setMateriForm({ ...materiForm, urlKonten: e.target.value })} 
                    required
                  />
                </div>
              )}

              {materiForm.jenis === "PDF" && (
                <div>
                  <Label className="text-sm">Upload File PDF *</Label>
                  <Input 
                    id="file-upload-materi" 
                    type="file" 
                    accept=".pdf" 
                    className="mt-2" 
                    onChange={handleMateriFileChange}
                    required={!materiForm.id && !materiForm.file} 
                  />
                  {materiForm.file && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate">{materiForm.file.nama}</p>
                        <p className="text-xs text-muted-foreground">{materiForm.file.size}</p>
                      </div>
                      <Button 
                        type="button"
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setMateriForm(prev => ({ ...prev, file: null, urlKonten: "" }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMateriDialogOpen(false)}>Batal</Button>
              <Button type="submit" form="materi-form">Simpan Materi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Modal Soal --- */}
      <Dialog open={isSoalDialogOpen} onOpenChange={setIsSoalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form id="soal-form" onSubmit={handleSaveSoal}>
            <DialogHeader>
              <DialogTitle>{soalForm.id ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
              <DialogDescription>{soalForm.tipeSoal === "UJIAN_TEORI" ? `Soal ini akan muncul di unit: ${selectedUnit?.judul}` : `Soal ini untuk Bank Soal ${soalForm.tipeSoal}`}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <Label>Tipe Soal</Label>
              <Input value={soalForm.tipeSoal} disabled className="bg-gray-100" />
              
              <Label htmlFor="soal-teks">Teks Pertanyaan / Instruksi *</Label>
              <Textarea id="soal-teks" placeholder="Tulis teks pertanyaan atau instruksi studi kasus di sini..." value={soalForm.teks} onChange={(e) => setSoalForm({ ...soalForm, teks: e.target.value })} rows={4} required />
              
              <Label>Tipe Jawaban</Label>
              <Select value={soalForm.tipeJawaban} onValueChange={(value) => setSoalForm({ ...soalForm, tipeJawaban: value })}>
                <SelectTrigger><SelectValue placeholder="Pilih Tipe Jawaban..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PILIHAN_GANDA">Pilihan Ganda (Nilai Otomatis)</SelectItem>
                  <SelectItem value="ESAI">Esai (Nilai Manual)</SelectItem>
                  <SelectItem value="UPLOAD_FILE">Upload File (Hanya Praktikum)</SelectItem>
                </SelectContent>
              </Select>
              
              {soalForm.tipeJawaban === "PILIHAN_GANDA" && (
                <div className="space-y-2 border p-4 rounded-md">
                  <Label>Opsi Pilihan Ganda *</Label>
                  {soalForm.pilihan.map((opsi, index) => (
                    <Input key={index} placeholder={`Opsi ${String.fromCharCode(65 + index)}`} value={opsi} onChange={(e) => { const newPilihan = [...soalForm.pilihan]; newPilihan[index] = e.target.value; setSoalForm({ ...soalForm, pilihan: newPilihan }); }} required />
                  ))}
                  <Label className="pt-2">Kunci Jawaban *</Label>
                  <Input placeholder="Kunci Jawaban (contoh: A)" value={soalForm.kunciJawaban} onChange={(e) => setSoalForm({ ...soalForm, kunciJawaban: e.target.value })} required />
                </div>
              )}
              
              {soalForm.tipeJawaban === "ESAI" && (
                <div>
                  <Label>Kata Kunci (Opsional)</Label>
                  <Input placeholder="Kata kunci jawaban (untuk panduan asesor)" value={soalForm.kunciJawaban} onChange={(e) => setSoalForm({ ...soalForm, kunciJawaban: e.target.value })} />
                </div>
              )}
              
              {soalForm.tipeJawaban === "UPLOAD_FILE" && (
                <div className="space-y-4 border p-4 rounded-md">
                  <Label>File Pendukung (Dataset, Panduan, Template, dll)</Label>
                  
                  <div className="space-y-2">
                    {soalForm.filePendukung.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">Belum ada file pendukung.</p>
                    )}
                    {soalForm.filePendukung.map((file) => (
                      <div key={file.id || file.nama} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <File className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{file.nama}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 flex-shrink-0" onClick={() => removeFile(file.nama)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <Label 
                      htmlFor="file-upload-praktikum" 
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border-dashed border-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Tambah File Pendukung
                    </Label>
                    <Input 
                      id="file-upload-praktikum" 
                      type="file" 
                      multiple 
                      className="sr-only" 
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Anda dapat mengunggah beberapa file (misal: .csv, .pdf, .pptx). File-file ini akan disimpan di server LMS.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSoalDialogOpen(false)}>Batal</Button>
              <Button type="submit" form="soal-form">Simpan Soal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* --- Dialog Hapus Unit --- */}
      <AlertDialog open={!!deleteUnitTarget} onOpenChange={() => setDeleteUnitTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Unit Kompetensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus unit &quot;{deleteUnitTarget?.judul}&quot;? Tindakan ini akan menghapus semua materi dan soal di dalamnya. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUnit} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Dialog Hapus Materi --- */}
      <AlertDialog open={!!deleteMateriTarget} onOpenChange={() => setDeleteMateriTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Materi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus materi &quot;{deleteMateriTarget?.judul}&quot;? Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMateri} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Dialog Hapus Soal --- */}
      <AlertDialog open={!!deleteSoalTarget} onOpenChange={() => setDeleteSoalTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Soal?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus soal &quot;{deleteSoalTarget?.teks?.substring(0, 50)}{deleteSoalTarget?.teks?.length > 50 ? "..." : ""}&quot;? Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSoal} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </React.Fragment>
  );
};


/**
 * Halaman Utama Manajemen Skema
 */
export default function SchemaPage() {
  const [skemaList, setSkemaList] = useState([]); 
  const [activeSkemaTab, setActiveSkemaTab] = useState(""); 
  const [activeContentTab, setActiveContentTab] = useState("unit");
  const [loadingSkema, setLoadingSkema] = useState(true);
  const [isSavingSkema, setIsSavingSkema] = useState(false); 
  const [isSkemaDialogOpen, setIsSkemaDialogOpen] = useState(false);
  const [skemaForm, setSkemaForm] = useState({ id: "", judul: "", deskripsi: "" });

  const [infoDialog, setInfoDialog] = useState({ open: false, title: "", message: "" });
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeletingSkema, setIsDeletingSkema] = useState(false);

  const [activeTahunAjaran, setActiveTahunAjaran] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [isDeleteYearAlertOpen, setIsDeleteYearAlertOpen] = useState(false); // State baru
  const [newYearForm, setNewYearForm] = useState({ tahun: "", duplicateFrom: "" });

  useEffect(() => {
    loadSkemaList();
  }, []);

  const loadSkemaList = async () => {
    try {
      setLoadingSkema(true);
      const data = await mockGetAllSkema();
      setSkemaList(data);
      if (data.length > 0 && !activeSkemaTab) {
        setActiveSkemaTab(data[0].id); 
      }
    } catch (error) {
      console.error("Error loading skema list:", error);
    } finally {
      setLoadingSkema(false);
    }
  };

  const handleSaveSkema = async (e) => {
    e.preventDefault();
    try {
      setIsSavingSkema(true);
      const newSkema = await mockCreateSkema(skemaForm);
      await loadSkemaList(); 
      setActiveSkemaTab(newSkema.id);
      
      // Set tahun default otomatis
      if (newSkema.tahunAjaranList && newSkema.tahunAjaranList.length > 0) {
         setActiveTahunAjaran(newSkema.tahunAjaranList[0]);
      }

      setIsSkemaDialogOpen(false); 
      setSkemaForm({ id: "", judul: "", deskripsi: "" }); 
    } catch (error) {
      console.error("Error creating skema:", error);
      setInfoDialog({ open: true, title: "Gagal Menyimpan", message: `Gagal menyimpan skema: ${error.message}` });
    } finally {
      setIsSavingSkema(false);
    }
  };

  const handleDeleteSkema = async () => {
    if (!activeSkemaTab) return;
    try {
      setIsDeletingSkema(true);
      await mockDeleteSkema(activeSkemaTab);
      await loadSkemaList();
      
      // Reset tab
      const data = await mockGetAllSkema(); 
      setSkemaList(data);
      if (data.length > 0) {
        setActiveSkemaTab(data[0].id);
      } else {
        setActiveSkemaTab("");
      }
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Error deleting skema:", error);
      setInfoDialog({ open: true, title: "Gagal Menghapus", message: `Gagal menghapus skema: ${error.message}` });
    } finally {
      setIsDeletingSkema(false);
    }
  };

  // Load tahun ajaran saat skema aktif berubah
  useEffect(() => {
    if (activeSkemaTab) {
      mockGetYearsForSkema(activeSkemaTab).then((list) => {
        setTahunAjaranList(list);
        setActiveTahunAjaran(list[0] || "");
      });
    }
  }, [activeSkemaTab]);

  const handleAddTahun = async (e) => {
    e.preventDefault();
    try {
      const duplicateFrom = newYearForm.duplicateFrom === "NONE" ? null : newYearForm.duplicateFrom || null;
      await mockAddYearToSkema(
        activeSkemaTab,
        newYearForm.tahun,
        duplicateFrom
      );
      const list = await mockGetYearsForSkema(activeSkemaTab);
      setTahunAjaranList(list);
      setActiveTahunAjaran(newYearForm.tahun);
      setIsYearDialogOpen(false);
      setNewYearForm({ tahun: "", duplicateFrom: "" });
    } catch (err) {
      setInfoDialog({ open: true, title: "Gagal", message: err.message });
    }
  };

  const handleDeleteTahun = () => {
    if (!activeTahunAjaran) return;
    setIsDeleteYearAlertOpen(true); 
  };

  const confirmDeleteTahun = async () => {
    try {
      await mockDeleteYearFromSkema(activeSkemaTab, activeTahunAjaran);
      const list = await mockGetYearsForSkema(activeSkemaTab);
      
      setTahunAjaranList(list);
      setActiveTahunAjaran(list.length > 0 ? list[0] : ""); 
      setIsDeleteYearAlertOpen(false);
      
      setInfoDialog({ open: true, title: "Berhasil", message: "Tahun ajaran berhasil dihapus." });
    } catch (err) {
      console.error(err);
      setInfoDialog({ open: true, title: "Gagal", message: "Gagal menghapus tahun ajaran." });
    }
  };

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Skema & Konten</h1>
          <p className="text-gray-600 mt-1">Kelola skema, unit kompetensi, materi pembelajaran, dan soal ujian</p>
        </div>

        {loadingSkema ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Tabs value={activeSkemaTab} onValueChange={setActiveSkemaTab} className="w-full">
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4">
                {/* Header Skema & Aksi */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <TabsList>
                    {skemaList.map((skema) => (
                      <TabsTrigger key={skema.id} value={skema.id}>
                        {skema.judul} ({skema.id})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteAlertOpen(true)}
                      disabled={!activeSkemaTab || isDeletingSkema}
                      title={!activeSkemaTab ? "Pilih skema terlebih dahulu" : "Hapus skema aktif"}
                    >
                      {isDeletingSkema ? <Spinner className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Hapus Skema
                    </Button>
                    <Button onClick={() => {
                      setSkemaForm({ id: "", judul: "", deskripsi: "" });
                      setIsSkemaDialogOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Skema Baru
                    </Button>
                  </div>
                </div>

                {/* Filter Tahun Ajaran */}
                {activeSkemaTab && (
                  <div className="flex flex-col md:flex-row gap-4 items-end mt-2">
                    <div className="w-full md:w-64 space-y-2">
                      <Label>Tahun Ajaran Aktif</Label>
                      <Select value={activeTahunAjaran} onValueChange={setActiveTahunAjaran}>
                        <SelectTrigger className="bg-blue-50 border-blue-200 text-blue-900 font-medium">
                          <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          {tahunAjaranList.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsYearDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Tambah Tahun
                      </Button>
                      <Button variant="ghost" className="text-red-600" onClick={handleDeleteTahun} disabled={!activeTahunAjaran}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tab Konten (Unit/Tryout/Praktikum) */}
                <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="unit">Unit Kompetensi & Soal Teori</TabsTrigger>
                    <TabsTrigger value="tryout">Bank Soal Tryout</TabsTrigger>
                    <TabsTrigger value="praktikum">Bank Soal Praktikum</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Konten Skema Dinamis */}
            {skemaList.map((skema) => (
              <TabsContent
                key={skema.id}
                value={skema.id}
                className="mt-0"
                forceMount={activeSkemaTab === skema.id}
              >
                {activeTahunAjaran ? (
                  <SkemaContentManager
                    skemaId={skema.id}
                    activeContentTab={activeContentTab}
                    setInfoDialog={setInfoDialog}
                    activeTahunAjaran={activeTahunAjaran}
                  />
                ) : (
                  <Card className="h-64 flex items-center justify-center border-dashed text-muted-foreground">
                    Pilih Tahun Ajaran untuk mulai mengelola konten.
                  </Card>
                )}
              </TabsContent>
            ))}

            {/* Dialog Hapus Skema */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Skema?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus skema {activeSkemaTab} beserta seluruh kontennya?
                    Aksi ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingSkema}>Batal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteSkema}
                    disabled={isDeletingSkema}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingSkema ? <Spinner className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Hapus Permanen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Tabs>
        )}
      </div>

      {/* Modal Tambah Skema */}
      <Dialog open={isSkemaDialogOpen} onOpenChange={setIsSkemaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveSkema}>
            <DialogHeader>
              <DialogTitle>Tambah Skema Sertifikasi Baru</DialogTitle>
              <DialogDescription>
                Buat skema baru. Tahun ajaran default (2024/2025) akan otomatis ditambahkan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="skema-id">ID Skema (Singkatan) *</Label>
                <Input 
                  id="skema-id" 
                  placeholder="Contoh: KSK" 
                  value={skemaForm.id}
                  onChange={(e) => setSkemaForm({ ...skemaForm, id: e.target.value.toUpperCase().replace(/\s+/g, '_') })} 
                  required 
                />
                <p className="text-xs text-muted-foreground">Harus unik, huruf kapital (contoh: ADS, DS).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skema-judul">Nama Lengkap Skema *</Label>
                <Input 
                  id="skema-judul" 
                  placeholder="Contoh: Komputasi Statistik" 
                  value={skemaForm.judul}
                  onChange={(e) => setSkemaForm({ ...skemaForm, judul: e.target.value })} 
                  required 
                />
              </div>
                <div className="space-y-2">
                <Label htmlFor="skema-deskripsi">Deskripsi (Opsional)</Label>
                <Textarea 
                  id="skema-deskripsi" 
                  placeholder="Jelaskan skema ini secara singkat..." 
                  value={skemaForm.deskripsi}
                  onChange={(e) => setSkemaForm({ ...skemaForm, deskripsi: e.target.value })} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSkemaDialogOpen(false)} disabled={isSavingSkema}>
                Batal
              </Button>
              <Button type="submit" disabled={isSavingSkema}>
                {isSavingSkema ? <Spinner className="w-4 h-4 mr-2" /> : "Simpan Skema"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Tahun Ajaran */}
      <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tahun Ajaran Baru</DialogTitle>
            <DialogDescription>
              Masukkan tahun ajaran baru (misal: 2025/2026). Anda dapat menduplikasi data dari tahun sebelumnya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTahun}>
            <div className="py-4 space-y-2">
              <Input
                placeholder="Contoh: 2025/2026"
                value={newYearForm.tahun}
                onChange={e => setNewYearForm({ ...newYearForm, tahun: e.target.value })}
                required
              />
              <Label className="text-sm">Duplikasi dari tahun ajaran (opsional):</Label>
              <Select value={newYearForm.duplicateFrom} onValueChange={val => setNewYearForm({ ...newYearForm, duplicateFrom: val })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pilih tahun ajaran..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Kosong (Tanpa Duplikasi)</SelectItem>
                  {tahunAjaranList.map(tahun => (
                    <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsYearDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={!newYearForm.tahun}>
                Simpan Tahun Ajaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Dialog Hapus Tahun Ajaran (BARU) --- */}
      <AlertDialog open={isDeleteYearAlertOpen} onOpenChange={setIsDeleteYearAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>Tahun Ajaran {activeTahunAjaran}</strong>? 
              <br/><br/>
              Semua Unit, Materi, dan Soal yang terkait dengan tahun ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTahun} 
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Info/Error */}
      <AlertDialog open={infoDialog.open} onOpenChange={() => setInfoDialog({ open: false, title: "", message: "" })}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{infoDialog.title || "Informasi"}</AlertDialogTitle>
            <AlertDialogDescription>
              {infoDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInfoDialog({ open: false, title: "", message: "" })}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </MainLayout>
  );
}