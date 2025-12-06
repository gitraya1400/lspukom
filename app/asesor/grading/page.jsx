/**
 * Halaman Daftar Penilaian (Asesor)
 * * Fitur utama:
 * 1. Menampilkan daftar tugas penilaian terfilter (Teori, Praktikum, Unjuk Diri).
 * 2. Memungkinkan penyaringan menurut kelas, unit, dan status.
 * 3. Navigasi ke detail penilaian untuk menyimpan hasil penilaian.
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockGetPenugasanAsesor } from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Clock, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react"; 
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils"; 

const ITEMS_PER_PAGE = 20;

// ===============================================================
// --- HELPER COMPONENTS ---
// ===============================================================

// Footer Paginasi untuk Tabel/List
const PaginationFooter = ({ totalPages, currentPage, setCurrentPage }) => {
  if (totalPages <= 1) {
    return null; 
  }
  
  return (
    <CardFooter className="flex items-center justify-between pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          Berikutnya
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </CardFooter>
  );
};

// Kartu Ringkasan Status (Belum Dinilai / Selesai)
const StatusCard = ({ title, value, filterValue, currentFilter, onClick, loading, icon: Icon }) => {
    const isSelected = currentFilter === filterValue;
    let colorClass = "";
    if (filterValue === "BELUM_DINILAI") colorClass = "text-orange-600";
    if (filterValue === "SELESAI") colorClass = "text-green-600";
    
    return (
        <Card
            className={cn(
                "hover:shadow-md transition-all cursor-pointer h-full border-2",
                isSelected ? "border-primary ring-2 ring-primary/50" : "border-gray-200"
            )}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", colorClass)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-6 w-12" /> : value}
                </div>
            </CardContent>
        </Card>
    );
};

// ===============================================================
// --- HALAMAN UTAMA DAFTAR PENILAIAN ---
// ===============================================================
export default function GradingListPage() {
  const { user } = useAuth();
  const [penugasan, setPenugasan] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Tab
  const [activeTab, setActiveTab] = useState("teori");
  const [filterStatus, setFilterStatus] = useState("BELUM_DINILAI");

  // State Filter Spesifik
  const [filterKelasTeori, setFilterKelasTeori] = useState("SEMUA");
  const [filterUnitTeori, setFilterUnitTeori] = useState("SEMUA");
  const [filterKelasPraktikum, setFilterKelasPraktikum] = useState("SEMUA");
  const [filterKelasUnjukDiri, setFilterKelasUnjukDiri] = useState("SEMUA");

  // State Filter Spesifik
  const [currentPageTeori, setCurrentPageTeori] = useState(1);
  const [currentPagePraktikum, setCurrentPagePraktikum] = useState(1);
  const [currentPageUnjukDiri, setCurrentPageUnjukDiri] = useState(1);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Reset halaman saat filter berubah
  useEffect(() => {
    setCurrentPageTeori(1);
  }, [filterStatus, filterKelasTeori, filterUnitTeori]);
  
  useEffect(() => {
    setCurrentPagePraktikum(1);
  }, [filterStatus, filterKelasPraktikum]);
  
  useEffect(() => {
    setCurrentPageUnjukDiri(1);
  }, [filterStatus, filterKelasUnjukDiri]);
  
  // Reset filter status saat berganti tab
  useEffect(() => {
    setFilterStatus("BELUM_DINILAI");
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const penugasanData = await mockGetPenugasanAsesor(user.id);
      setPenugasan(penugasanData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // ===============================================================
  // --- LOGIKA FILTERING DATA (MEMOIZED) ---
  // ===============================================================

  // 1. Filter Unit List berdasarkan Status
  const unitListTeori = useMemo(() => {
    if (!penugasan) return [];
    let teoriTasks = penugasan.filter(p => p.tipe === 'TEORI' && p.unitId);

    // FILTER BERDASARKAN STATUS (HANYA tampilkan unit yang relevan)
    if (filterStatus === "BELUM_DINILAI") {
        teoriTasks = teoriTasks.filter(p => p.statusPenilaian === 'BELUM_DINILAI');
    } else if (filterStatus === "SELESAI") {
        teoriTasks = teoriTasks.filter(p => p.statusPenilaian === 'SELESAI');
    }
    
    const unitSet = new Map();
    teoriTasks.forEach(p => {
        if (!unitSet.has(p.unitId)) {
          unitSet.set(p.unitId, `Unit ${p.unitId}: ${p.unitJudul}`);
        }
    });
    return Array.from(unitSet.entries()).sort((a, b) => a[0] - b[0]);
  }, [penugasan, filterStatus]); // Kunci di sini adalah filterStatus

  // 2. Filter Kelas List (Teori) berdasarkan Unit dan Status
  const kelasListTeori = useMemo(() => {
    let teoriTasks = penugasan.filter(p => p.tipe === 'TEORI');
    
    // Filter 1: Berdasarkan Unit yang Dipilih
    if (filterUnitTeori !== "SEMUA") {
      teoriTasks = teoriTasks.filter(p => p.unitId == filterUnitTeori);
    }
    
    // Filter 2: Berdasarkan Status
    if (filterStatus === "BELUM_DINILAI") {
        teoriTasks = teoriTasks.filter(p => p.statusPenilaian === 'BELUM_DINILAI');
    } else if (filterStatus === "SELESAI") {
        teoriTasks = teoriTasks.filter(p => p.statusPenilaian === 'SELESAI');
    }
    
    const kelasSet = new Set(teoriTasks.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [penugasan, filterUnitTeori, filterStatus]); 
  
  // 3. Filter Kelas List (Praktikum) berdasarkan Status
  const kelasListPraktikum = useMemo(() => {
    let praktikumTasks = penugasan.filter(p => p.tipe === 'PRAKTIKUM');

    if (filterStatus === "BELUM_DINILAI") {
        praktikumTasks = praktikumTasks.filter(p => p.statusPenilaian === 'BELUM_DINILAI');
    } else if (filterStatus === "SELESAI") {
        praktikumTasks = praktikumTasks.filter(p => p.statusPenilaian === 'SELESAI');
    }
    
    const kelasSet = new Set(praktikumTasks.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [penugasan, filterStatus]);

  // 4. Filter Kelas List (Unjuk Diri) berdasarkan Status
  const kelasListUnjukDiri = useMemo(() => {
    let unjukDiriTasks = penugasan.filter(p => p.tipe === 'UNJUK_DIRI');

    if (filterStatus === "BELUM_DINILAI") {
        unjukDiriTasks = unjukDiriTasks.filter(p => p.statusPenilaian === 'BELUM_DINILAI');
    } else if (filterStatus === "SELESAI") {
        unjukDiriTasks = unjukDiriTasks.filter(p => p.statusPenilaian === 'SELESAI');
    }
    
    const kelasSet = new Set(unjukDiriTasks.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [penugasan, filterStatus]);

  // --- VALIDASI OTOMATIS: Reset filter jika pilihan tidak valid ---
  
  // Reset filter Unit jika pilihan tidak lagi tersedia (karena Filter Status berubah)
  useEffect(() => {
    const unitIds = unitListTeori.map(([id]) => String(id));
    if (filterUnitTeori !== "SEMUA" && !unitIds.includes(filterUnitTeori)) {
      setFilterUnitTeori("SEMUA");
    }
  }, [unitListTeori]); 

  // Reset filter Kelas Teori jika pilihan tidak lagi tersedia (karena Unit/Status berubah)
  useEffect(() => {
    if (filterKelasTeori !== "SEMUA" && !kelasListTeori.includes(filterKelasTeori)) {
      setFilterKelasTeori("SEMUA");
    }
  }, [kelasListTeori]);
  
  // Reset filter Kelas Praktikum
  useEffect(() => {
    if (filterKelasPraktikum !== "SEMUA" && !kelasListPraktikum.includes(filterKelasPraktikum)) {
      setFilterKelasPraktikum("SEMUA");
    }
  }, [kelasListPraktikum]);
  
  // Reset filter Kelas Unjuk Diri
  useEffect(() => {
    if (filterKelasUnjukDiri !== "SEMUA" && !kelasListUnjukDiri.includes(filterKelasUnjukDiri)) {
      setFilterKelasUnjukDiri("SEMUA");
    }
  }, [kelasListUnjukDiri]);


  // ===============================================================
  // --- DATA PROCESSING UNTUK TAMPILAN ---
  // ===============================================================  

// Hitung statistik (Total, Pending, Selesai) untuk kartu atas
  const statsByTipe = useMemo(() => {
    const calcStats = (tipe) => {
        const tasks = penugasan.filter(p => p.tipe === tipe);
        return {
            total: tasks.length,
            pending: tasks.filter(p => p.statusPenilaian === 'BELUM_DINILAI').length,
            completed: tasks.filter(p => p.statusPenilaian === 'SELESAI').length,
        };
    };
    return {
        TEORI: calcStats('TEORI'),
        PRAKTIKUM: calcStats('PRAKTIKUM'),
        UNJUK_DIRI: calcStats('UNJUK_DIRI'),
    };
  }, [penugasan]);

  // Fungsi Filter Utama
  const getFilteredPenugasan = (tipe, kelasFilter, unitFilter) => {
    let filtered = penugasan.filter(p => p.tipe === tipe);

    if (filterStatus !== "SEMUA") {
      filtered = filtered.filter(p => p.statusPenilaian === filterStatus);
    }
    
    if (kelasFilter && kelasFilter !== "SEMUA") {
      filtered = filtered.filter(p => p.asesiKelas === kelasFilter);
    }

    if (unitFilter && unitFilter !== "SEMUA") {
      filtered = filtered.filter(p => p.unitId == unitFilter);
    }
    
    return filtered;
  };

// Data Siap Tampil (Memoized)
  const fullTeoriList = useMemo(
    () => getFilteredPenugasan("TEORI", filterKelasTeori, filterUnitTeori),
    [penugasan, filterStatus, filterKelasTeori, filterUnitTeori]
  );
  const fullPraktikumList = useMemo(
    () => getFilteredPenugasan("PRAKTIKUM", filterKelasPraktikum, null),
    [penugasan, filterStatus, filterKelasPraktikum]
  );
  const fullUnjukDiriList = useMemo(
    () => getFilteredPenugasan("UNJUK_DIRI", filterKelasUnjukDiri, null),
    [penugasan, filterStatus, filterKelasUnjukDiri]
  );

// Paginasi Data
  const { paginatedTeori, totalPagesTeori } = useMemo(() => {
    const totalPages = Math.ceil(fullTeoriList.length / ITEMS_PER_PAGE);
    const paginated = fullTeoriList.slice(
      (currentPageTeori - 1) * ITEMS_PER_PAGE,
      currentPageTeori * ITEMS_PER_PAGE
    );
    return { paginatedTeori: paginated, totalPagesTeori: totalPages };
  }, [fullTeoriList, currentPageTeori]);

  const { paginatedPraktikum, totalPagesPraktikum } = useMemo(() => {
    const totalPages = Math.ceil(fullPraktikumList.length / ITEMS_PER_PAGE);
    const paginated = fullPraktikumList.slice(
      (currentPagePraktikum - 1) * ITEMS_PER_PAGE,
      currentPagePraktikum * ITEMS_PER_PAGE
    );
    return { paginatedPraktikum: paginated, totalPagesPraktikum: totalPages };
  }, [fullPraktikumList, currentPagePraktikum]);

  const { paginatedUnjukDiri, totalPagesUnjukDiri } = useMemo(() => {
    const totalPages = Math.ceil(fullUnjukDiriList.length / ITEMS_PER_PAGE);
    const paginated = fullUnjukDiriList.slice(
      (currentPageUnjukDiri - 1) * ITEMS_PER_PAGE,
      currentPageUnjukDiri * ITEMS_PER_PAGE
    );
    return { paginatedUnjukDiri: paginated, totalPagesUnjukDiri: totalPages };
  }, [fullUnjukDiriList, currentPageUnjukDiri]);

// Komponen List Item
  const PenugasanList = ({ list }) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }
    
    if (list.length === 0) {
      const message = "Tidak ada tugas yang cocok dengan filter yang diterapkan.";
      return <p className="text-center text-muted-foreground py-8">{message}</p>;
    }
    
    return (
      <div className="space-y-2">
        {list.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div>
              <p className="font-medium">{p.asesiNama}</p>
              <p className="text-sm text-muted-foreground">
                {p.unitId 
                    ? `Unit ${p.unitId}: ${p.unitJudul}` 
                    : p.unitJudul.replace(' (Gabungan)', '').trim() // Hapus (Gabungan)
                }
                {p.asesiKelas && ` - (Kelas: ${p.asesiKelas})`}
              </p>
            </div>
            <Link href={`/asesor/grading/${p.id}`}>
              <Button size="sm" variant={p.statusPenilaian === 'SELESAI' ? 'outline' : 'default'}>
                {p.statusPenilaian === 'SELESAI' ? 'Lihat' : 'Nilai'}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tugas Penilaian</h1>
          <p className="text-muted-foreground mt-1">Filter dan kelola semua tugas penilaian Anda.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        
          <Card>
            <CardContent className="pt-6 space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="teori">Ujian Teori</TabsTrigger>
                <TabsTrigger value="praktikum">Ujian Praktikum</TabsTrigger>
                <TabsTrigger value="unjuk-diri">Unjuk Diri</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* KONTEN TAB: UJIAN TEORI */}
          <TabsContent value="teori" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                    title="Semua Tugas Teori" 
                    value={statsByTipe.TEORI.total} 
                    icon={CheckSquare}
                    filterValue="SEMUA"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("SEMUA")}
                    loading={loading}
                />
                <StatusCard 
                    title="Belum Dinilai" 
                    value={statsByTipe.TEORI.pending} 
                    icon={AlertCircle}
                    filterValue="BELUM_DINILAI"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("BELUM_DINILAI")}
                    loading={loading}
                />
                <StatusCard 
                    title="Selesai" 
                    value={statsByTipe.TEORI.completed} 
                    icon={CheckCircle2}
                    filterValue="SELESAI"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("SELESAI")}
                    loading={loading}
                />
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Daftar Tugas Ujian Teori (Status: {filterStatus.replace("_", " ")})</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="flex-1 md:w-40">
                      <Label htmlFor="filter-kelas-teori" className="text-xs font-normal">Filter Kelas</Label>
                      <Select 
                        value={filterKelasTeori} 
                        onValueChange={setFilterKelasTeori}
                      >
                        <SelectTrigger id="filter-kelas-teori" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                          {kelasListTeori.map(kelas => ( 
                            <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 md:w-56">
                      <Label htmlFor="filter-unit-teori" className="text-xs font-normal">Filter Unit</Label>
                      <Select value={filterUnitTeori} onValueChange={setFilterUnitTeori}>
                        <SelectTrigger id="filter-unit-teori" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Unit" />
                        </SelectTrigger>
                         <SelectContent 
                            position="popper"
                            className="w-[220px] max-h-[200px] overflow-y-auto"
                          >
                          <SelectItem value="SEMUA">Semua Unit</SelectItem>
                          {unitListTeori.map(([unitId, unitLabel]) => (
                            <SelectItem key={unitId} value={String(unitId)}>{unitLabel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PenugasanList list={paginatedTeori} />
              </CardContent>
              <PaginationFooter 
                totalPages={totalPagesTeori}
                currentPage={currentPageTeori}
                setCurrentPage={setCurrentPageTeori}
              />
            </Card>
          </TabsContent>

          {/* KONTEN TAB: UJIAN PRAKTIKUM (Struktur Serupa) */}
          <TabsContent value="praktikum" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                    title="Semua Tugas Praktikum" 
                    value={statsByTipe.PRAKTIKUM.total} 
                    icon={CheckSquare}
                    filterValue="SEMUA"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("SEMUA")}
                    loading={loading}
                />
                <StatusCard 
                    title="Belum Dinilai" 
                    value={statsByTipe.PRAKTIKUM.pending} 
                    icon={AlertCircle}
                    filterValue="BELUM_DINILAI"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("BELUM_DINILAI")}
                    loading={loading}
                />
                <StatusCard 
                    title="Selesai" 
                    value={statsByTipe.PRAKTIKUM.completed} 
                    icon={CheckCircle2}
                    filterValue="SELESAI"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("SELESAI")}
                    loading={loading}
                />
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Daftar Tugas Ujian Praktikum (Status: {filterStatus.replace("_", " ")})</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="flex-1 md:w-40">
                      <Label htmlFor="filter-kelas-prak" className="text-xs font-normal">Filter Kelas</Label>
                      <Select value={filterKelasPraktikum} onValueChange={setFilterKelasPraktikum}>
                        <SelectTrigger id="filter-kelas-prak" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                          {kelasListPraktikum.map(kelas => ( 
                            <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PenugasanList list={paginatedPraktikum} />
              </CardContent>
              <PaginationFooter 
                totalPages={totalPagesPraktikum}
                currentPage={currentPagePraktikum}
                setCurrentPage={setCurrentPagePraktikum}
              />
            </Card>
          </TabsContent>
          
          {/* KONTEN TAB: UNJUK DIRI (Struktur Serupa) */}
          <TabsContent value="unjuk-diri" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                    title="Semua Tugas Unjuk Diri" 
                    value={statsByTipe.UNJUK_DIRI.total} 
                    icon={CheckSquare}
                    filterValue="SEMUA"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("SEMUA")}
                    loading={loading}
                />
                <StatusCard 
                    title="Belum Dinilai" 
                    value={statsByTipe.UNJUK_DIRI.pending} 
                    icon={AlertCircle}
                    filterValue="BELUM_DINILAI"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("BELUM_DINILAI")}
                    loading={loading}
                />
                <StatusCard 
                    title="Selesai" 
                    value={statsByTipe.UNJUK_DIRI.completed} 
                    icon={CheckCircle2}
                    filterValue="SELESAI"
                    currentFilter={filterStatus}
                    onClick={() => setFilterStatus("SELESAI")}
                    loading={loading}
                />
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Daftar Tugas Unjuk Diri (Status: {filterStatus.replace("_", " ")})</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="flex-1 md:w-40">
                      <Label htmlFor="filter-kelas-unjuk" className="text-xs font-normal">Filter Kelas</Label>
                      <Select value={filterKelasUnjukDiri} onValueChange={setFilterKelasUnjukDiri}>
                        <SelectTrigger id="filter-kelas-unjuk" className="h-9 mt-1 w-full">
                          <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                          {kelasListUnjukDiri.map(kelas => ( 
                            <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PenugasanList list={paginatedUnjukDiri} />
              </CardContent>
               <PaginationFooter 
                totalPages={totalPagesUnjukDiri}
                currentPage={currentPageUnjukDiri}
                setCurrentPage={setCurrentPageUnjukDiri}
              />
            </Card>
          </TabsContent>
        </Tabs>
        
      </div>
    </MainLayout>
  );
}