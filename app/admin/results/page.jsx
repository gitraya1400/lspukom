/**
 * Halaman Rekapitulasi Hasil (Admin)
 *
 * Halaman ini menampilkan daftar lengkap hasil penilaian asesi.
 * Fitur:
 * - Menangani status "SEDANG_DINILAI" (Asesor sudah ditugaskan).
 * - Menangani input status berupa Object vs String.
 * - Tampilan detail (Modal) yang sinkron dengan tabel.
 */

"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog" 
import { 
  mockGetRekapHasilAkhir, 
  mockGetAllSkema 
} from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Info, Clock, HelpCircle, User, MinusCircle } from "lucide-react" 

const ITEMS_PER_PAGE = 20 

// --- HELPER: Format Teks Status ---
const formatStatusText = (text) => {
  if (!text) return "-";
  // Ganti underscore dengan spasi
  return text.replace(/_/g, " ");
}

/**
 * Komponen Badge Status (UPDATED)
 * Mampu menangani input string maupun object, dan menampilkan status SEDANG_DINILAI.
 */
const StatusBadge = ({ status }) => {
  // 1. Normalisasi Input: Jika status berupa object, ambil properti .status, jika string pakai langsung
  const rawStatus = (typeof status === 'object' && status !== null) ? status.status : status;
  const safeStatus = rawStatus || "BELUM_DINILAI";

  // 2. Default Style (Abu-abu / Belum Dinilai)
  let colorClass = "bg-gray-100 text-gray-600 border border-gray-200";
  let Icon = MinusCircle;
  
  // 3. Logika Warna & Ikon
  if (safeStatus === "KOMPETEN") {
    colorClass = "bg-green-100 text-green-800 border border-green-200";
    Icon = CheckCircle2;
  } else if (safeStatus.includes("BELUM KOMPETEN") || safeStatus === "BELUM_KOMPETEN") {
    colorClass = "bg-red-100 text-red-800 border border-red-200";
    Icon = AlertCircle;
  } else if (safeStatus === "SEDANG_DINILAI" || safeStatus === "SEDANG DINILAI") {
    // Logika Khusus: Asesor sudah ditugaskan tapi belum final
    colorClass = "bg-orange-100 text-orange-800 border border-orange-200";
    Icon = Clock;
  } else if (safeStatus === "BELUM_ADA_PENILAIAN" || safeStatus === "BELUM_DINILAI") {
     // Tetap default abu-abu
     Icon = HelpCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {formatStatusText(safeStatus)}
    </span>
  )
}

/**
 * Modal Detail Asesi (UPDATED)
 * Menggunakan logic akses data yang aman (?.status).
 */
const AsesiDetailModal = ({ item, onClose }) => {
  if (!item) return null

  const { asesiData, hasilAkhir } = item;
  
  return (
     <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detail Hasil Asesi</DialogTitle>
            <DialogDescription>
              Rekapitulasi penilaian untuk <span className="font-semibold text-black">{asesiData.nama}</span> ({asesiData.nim})
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-2">
            
            {/* --- Informasi User --- */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Kelas</p>
                <p className="text-sm font-bold text-black">{asesiData.kelas}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Skema</p>
                <p className="text-sm font-bold text-black">{hasilAkhir.skemaId}</p>
              </div>
            </div>

            {/* --- Status Akhir --- */}
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm font-medium text-gray-700">Status Kelulusan Akhir</span>
              {/* Status Akhir biasanya String */}
              <StatusBadge status={hasilAkhir.statusAkhir} />
            </div>
            
            {/* --- Rincian Unit (Teori) --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <h4 className="text-sm font-bold text-black">Rincian Unit & Penilai</h4>
                 {/* Status Akumulasi Teori */}
                 <StatusBadge status={hasilAkhir.hasilTeori?.statusAkumulasi} />
              </div>
              
              <div className="space-y-0 divide-y border rounded-lg overflow-hidden">
                {hasilAkhir.asesorTeoriDetail.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Belum ada data unit.
                  </div>
                ) : (
                  hasilAkhir.asesorTeoriDetail.map((detail, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-white hover:bg-gray-50 transition-colors">
                      {/* Kiri: Unit */}
                      <div className="flex-1 pr-3">
                        <p className="text-xs font-bold text-black mb-1">
                           Unit {detail.unitId}
                        </p>
                        <p className="text-sm font-medium text-black leading-tight">
                          {detail.unitJudul}
                        </p>
                      </div>

                      {/* Kanan: Status & Asesor */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                         {/* Status Badge per Unit */}
                         <StatusBadge status={detail.status} />
                         
                         {/* Asesor: Hitam, Tidak Italic */}
                         <div className="flex items-center gap-1 mt-1">
                            <User className="w-3 h-3 text-black" />
                            <span className="text-xs font-medium text-black not-italic">
                                {detail.asesorNama}
                            </span>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* --- Nilai Lainnya (Praktikum & Unjuk Diri) --- */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Praktikum */}
              <div className="p-3 border rounded-lg space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Praktikum</p>
                <div className="flex flex-col items-start gap-1">
                   {/* Pass Object lengkap ke StatusBadge (sudah dihandle) atau pass .status */}
                   <StatusBadge status={hasilAkhir.hasilPraktikum} />
                   
                   <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-black" />
                      <span className="text-xs font-medium text-black not-italic">
                        {hasilAkhir.asesorPraktikum || '-'}
                      </span>
                   </div>
                </div>
              </div>

              {/* Unjuk Diri */}
              <div className="p-3 border rounded-lg space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Unjuk Diri</p>
                <div className="flex flex-col items-start gap-1">
                   <StatusBadge status={hasilAkhir.hasilUnjukDiri} />
                   
                   <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-black" />
                      <span className="text-xs font-medium text-black not-italic">
                        {hasilAkhir.asesorUnjukDiri || '-'}
                      </span>
                   </div>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

/**
 * Komponen Utama Halaman
 */
export default function AdminResultsPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [rekap, setRekap] = useState([]) 
  const [skemaList, setSkemaList] = useState([]) 
  const [loading, setLoading] = useState(true)
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSkema, setFilterSkema] = useState("SEMUA")
  const [filterStatus, setFilterStatus] = useState("SEMUA")
  const [filterKelas, setFilterKelas] = useState("SEMUA") 
  const [currentPage, setCurrentPage] = useState(1)
  
  const [detailAsesi, setDetailAsesi] = useState(null) 

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    
    const loadData = async () => {
      try {
        setLoading(true)
        const [rekapData, skemaData] = await Promise.all([
          mockGetRekapHasilAkhir(),
          mockGetAllSkema()
        ])
        setRekap(rekapData)
        setSkemaList(skemaData)
        
      } catch (error) {
        console.error("Error loading admin results:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user, isAuthLoading, router])

  // Daftar Kelas Dinamis
  const kelasList = useMemo(() => {
    const filteredBySkema = filterSkema === "SEMUA" 
      ? rekap 
      : rekap.filter(r => r.hasilAkhir.skemaId === filterSkema);
    
    const kList = [...new Set(filteredBySkema.map(r => r.asesiData.kelas))]
      .filter(k => k && k !== 'N/A') 
      .sort();
    
    return kList;
  }, [rekap, filterSkema]);
  
  // Reset Filters saat Skema berubah
  useEffect(() => {
    setFilterKelas("SEMUA");
    setCurrentPage(1);
  }, [filterSkema]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKelas, searchTerm, filterStatus]);

  // Filter Logic
  const filteredRekap = useMemo(() => {
    return rekap.filter(item => {
      const user = item.asesiData
      const hasil = item.hasilAkhir
      
      const matchSearch = searchTerm === "" ||
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nim.includes(searchTerm)
        
      const matchSkema = filterSkema === "SEMUA" || hasil.skemaId === filterSkema
      
      // Update logika filter status (Handle spasi vs underscore)
      const statusNormalized = (hasil.statusAkhir || "").replace(/_/g, " ");
      const filterNormalized = filterStatus.replace(/_/g, " ");

      const matchStatus = filterStatus === "SEMUA" || statusNormalized === filterNormalized;

      const matchKelas = filterKelas === "SEMUA" || user.kelas === filterKelas 
      
      return matchSearch && matchSkema && matchStatus && matchKelas 
    })
  }, [rekap, searchTerm, filterSkema, filterStatus, filterKelas]) 

  // Pagination
  const totalPages = Math.ceil(filteredRekap.length / ITEMS_PER_PAGE)
  const paginatedRekap = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredRekap.slice(start, end)
  }, [filteredRekap, currentPage])

  if (loading || isAuthLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekapitulasi Hasil</h1>
          <p className="text-gray-600 mt-1">Lihat hasil akhir penilaian semua asesi.</p>
        </div>

        {/* --- Bagian Filter --- */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              
              {/* Filter Skema */}
              <div className="md:w-48">
                <Label htmlFor="filter-skema">Filter Skema</Label>
                <Select value={filterSkema} onValueChange={setFilterSkema}>
                  <SelectTrigger id="filter-skema" className="mt-1.5 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMUA">Semua Skema</SelectItem>
                    {skemaList.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.judul} ({s.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Kelas */}
              <div className="md:w-40">
                <Label htmlFor="filter-kelas">Filter Kelas</Label>
                <Select value={filterKelas} onValueChange={setFilterKelas}>
                  <SelectTrigger id="filter-kelas" className="mt-1.5 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                    {kelasList.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Status */}
              <div className="md:w-56"> 
                <Label htmlFor="filter-status">Filter Status Akhir</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status" className="mt-1.5 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="SEMUA">Semua Status</SelectItem>
                    <SelectItem value="KOMPETEN">Kompeten</SelectItem>
                    <SelectItem value="BELUM_KOMPETEN">Belum Kompeten</SelectItem>
                    <SelectItem value="SEDANG_DINILAI">Sedang Dinilai</SelectItem>
                    <SelectItem value="BELUM_ADA_PENILAIAN">Belum Ada Penilaian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Asesi */}
              <div className="flex-1 w-full"> 
                <Label htmlFor="search-asesi">Cari Asesi</Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input 
                    id="search-asesi"
                    placeholder="Cari nama atau NIM..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Tabel Hasil --- */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Hasil Asesi</CardTitle>
            <CardDescription>
              Menampilkan {paginatedRekap.length} dari {filteredRekap.length} hasil.
              <br />
              Klik ikon info untuk melihat detail asesor dan nilai per unit.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[20%]">Nama Asesi</TableHead>
                    <TableHead className="w-[8%]">Kelas</TableHead>
                    <TableHead className="w-[8%]">Skema</TableHead>
                    <TableHead className="w-[12%]">Teori</TableHead>
                    <TableHead className="w-[12%]">Praktikum</TableHead>
                    <TableHead className="w-[12%]">Unjuk Diri</TableHead>
                    <TableHead className="w-[20%]">Status Akhir</TableHead>
                    <TableHead className="w-[8%] text-center">Info</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRekap.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRekap.map(item => (
                      <TableRow key={item.asesiData.id} className="hover:bg-gray-50">
                        <TableCell>
                          <p className="font-medium text-gray-900">{item.asesiData.nama}</p>
                          <p className="text-sm text-gray-500">{item.asesiData.nim}</p>
                        </TableCell>
                        <TableCell>{item.asesiData.kelas}</TableCell>
                        <TableCell>{item.hasilAkhir.skemaId}</TableCell>
                        
                        {/* Status Teori: Biasanya String */}
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.hasilTeori?.statusAkumulasi} />
                        </TableCell>
                        
                        {/* Status Praktikum: Object { status, nilai, ... } */}
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.hasilPraktikum} />
                        </TableCell>
                        
                        {/* Status Unjuk Diri: Object { status, nilai, ... } */}
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.hasilUnjukDiri} />
                        </TableCell>
                        
                        {/* Status Akhir: String */}
                        <TableCell>
                          <StatusBadge status={item.hasilAkhir.statusAkhir} />
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            title="Lihat Detail Hasil"
                            onClick={() => setDetailAsesi(item)}
                          >
                            <Info className="w-4 h-4 text-blue-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Modal Detail */}
      <AsesiDetailModal 
        item={detailAsesi} 
        onClose={() => setDetailAsesi(null)} 
      />
      
    </MainLayout>
  )
}