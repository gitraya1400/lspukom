/**
 * Halaman Plotting Peserta Ujian Offline (Admin)
 * * Halaman ini digunakan untuk mengatur (plot) peserta ke dalam sesi ujian spesifik.
 * Fitur utama:
 * 1. Menampilkan detail sesi (Ruangan, Waktu, Kapasitas).
 * 2. Menampilkan daftar asesi yang BELUM di-plot (dikelompokkan per kelas).
 * 3. Menampilkan daftar asesi yang SUDAH di-plot di sesi ini.
 * 4. Memindahkan asesi antar dua daftar tersebut (Plot/Unplot) dengan validasi kapasitas ruangan.
 * 5. Fitur "Pilih Cepat" untuk mengisi sisa kursi kosong secara otomatis.
 */

"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible" 
import { mockGetSesiUjianDetail, mockGetAsesiBelumDiplot, mockUpdatePlottingSesi } from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Users, UserPlus, ArrowLeft, Save, AlertCircle, Trash2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PlottingPage() {
  const params = useParams()
  const router = useRouter()
  const sesiId = params.sesiId

  // --- State Data ---
  const [sesi, setSesi] = useState(null)
  const [availableGrup, setAvailableGrup] = useState([]) // Daftar asesi tersedia (belum di-plot), dikelompokkan per kelas
  const [plottedAsesi, setPlottedAsesi] = useState([])   // Daftar asesi yang sudah masuk sesi ini
  
  // --- State Seleksi (Checkbox) ---
  const [selectedAvailable, setSelectedAvailable] = useState(new Set())
  const [selectedPlotted, setSelectedPlotted] = useState(new Set())
  
  // --- State UI ---
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [infoDialog, setInfoDialog] = useState({ open: false, title: "", message: "" });

  // Muat data saat sesiId tersedia
  useEffect(() => {
    if (sesiId) {
      loadData()
    }
  }, [sesiId])

  const loadData = async () => {
    try {
      setLoading(true)
      // Ambil detail sesi (termasuk peserta yang sudah ada)
      const sesiData = await mockGetSesiUjianDetail(sesiId)
      setSesi(sesiData)
      setPlottedAsesi(sesiData.asesiTerplot || [])
      
      // Ambil daftar asesi yang available (belum punya sesi)
      const availableDataGrup = await mockGetAsesiBelumDiplot(sesiData.skemaId, sesiId)
      setAvailableGrup(availableDataGrup)
      
    } catch (error) {
      console.error("Gagal memuat data plotting:", error)
      setInfoDialog({ open: true, title: "Error", message: "Gagal memuat data sesi." })
    } finally {
      setLoading(false)
    }
  }
  
  // Hitung kapasitas tersisa
  const sisaKapasitas = sesi ? sesi.kapasitas - plottedAsesi.length : 0
  const kapasitasPenuh = sisaKapasitas <= 0

  // Hitung sisa slot REAL (dikurangi yang sedang dicentang di kolom kiri)
  // Digunakan untuk validasi tombol "Pilih Cepat" agar tidak over-quota
  const sisaSlotReal = sisaKapasitas - selectedAvailable.size;

  /**
   * Memindahkan SATU GRUP KELAS penuh ke daftar Plotted.
   * Validasi kapasitas dilakukan sebelum memindahkan.
   */
  const plotGrup = (asesiGrup) => {
    if (asesiGrup.length > sisaKapasitas) {
      setInfoDialog({ open: true, title: "Kapasitas Penuh", message: `Kapasitas tidak cukup! Kelas ini berisi ${asesiGrup.length} asesi, tapi sisa kapasitas hanya ${sisaKapasitas}.` })
      return
    }
    setAvailableGrup(prev => prev.filter(g => g.namaKelas !== asesiGrup[0].kelas))
    setPlottedAsesi(prev => [...prev, ...asesiGrup])
  }

  /**
   * Memindahkan asesi yang DICENTANG (Selected) dari Available ke Plotted.
   */
  const plotSelected = () => {
    const toPlot = availableGrup.flatMap(g => g.asesi).filter(a => selectedAvailable.has(a.id))
    
    if (toPlot.length > sisaKapasitas) {
      setInfoDialog({ open: true, title: "Kapasitas Penuh", message: `Kapasitas tidak cukup! Anda mencoba memasukkan ${toPlot.length} asesi, tapi sisa kapasitas hanya ${sisaKapasitas}.` })
      return
    }
    
    // Hapus dari Available
    setAvailableGrup(prev => 
      prev.map(grup => ({
        ...grup,
        asesi: grup.asesi.filter(a => !selectedAvailable.has(a.id))
      })).filter(grup => grup.asesi.length > 0) // Hapus grup jika jadi kosong
    )
    
    // Tambah ke Plotted
    setPlottedAsesi(prev => [...prev, ...toPlot])
    setSelectedAvailable(new Set()) // Reset seleksi
  }
  
  /**
   * Mengeluarkan asesi yang DICENTANG dari Plotted kembali ke Available.
   */
  const unplotSelected = () => {
    const toUnplot = plottedAsesi.filter(a => selectedPlotted.has(a.id))
    
    // Hapus dari Plotted
    setPlottedAsesi(prev => prev.filter(a => !selectedPlotted.has(a.id)))
    
    // Kembalikan ke Available (dimasukkan kembali ke grup kelas masing-masing)
    setAvailableGrup(prev => {
      const newGrup = [...prev]
      toUnplot.forEach(asesi => {
        const namaKelas = asesi.kelas || "Lainnya"
        let grup = newGrup.find(g => g.namaKelas === namaKelas)
        if (!grup) {
          grup = { namaKelas: namaKelas, asesi: [] }
          newGrup.push(grup)
        }
        grup.asesi.push(asesi)
      })
      return newGrup
    })
    setSelectedPlotted(new Set()) // Reset seleksi
  }

  // --- Handlers Checkbox ---

  const handleSelectAvailable = (id, checked) => {
    setSelectedAvailable(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }
  
  const handleSelectPlotted = (id, checked) => {
    setSelectedPlotted(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }
  
  /**
   * Fitur "Pilih Cepat":
   * Otomatis memilih asesi dalam satu grup sebanyak sisa slot yang tersedia.
   * Berguna jika satu kelas tidak muat semua, tapi ingin memaksimalkan kapasitas ruangan.
   */
  const handleSelectSisaKapasitas = (grup) => {
    // 1. Cek sisa slot real
    if (sisaSlotReal <= 0) {
      setInfoDialog({ open: true, title: "Kapasitas Penuh", message: "Kapasitas sudah penuh atau terisi oleh asesi terpilih dari grup lain." });
      return; 
    }

    // 2. Ambil ID asesi di grup ini yang BELUM terpilih
    const asesiBelumTerpilihDiGrupIni = grup.asesi
      .filter(a => !selectedAvailable.has(a.id))
      .map(a => a.id);
    
    // 3. Ambil hanya sebanyak sisa slot
    const idUntukDipilih = asesiBelumTerpilihDiGrupIni.slice(0, sisaSlotReal);

    if (idUntukDipilih.length === 0) {
      setInfoDialog({ open: true, title: "Informasi", message: "Semua asesi di grup ini sudah terpilih atau sisa kapasitas sudah dipenuhi oleh grup lain." });
      return;
    }

    // 4. Update state seleksi
    setSelectedAvailable(prev => {
      const next = new Set(prev);
      idUntukDipilih.forEach(id => next.add(id));
      return next;
    });
  }

  // Helper untuk memilih semua asesi dalam satu grup
  const handleSelectAllInGroup = (grup, checked) => {
    setSelectedAvailable(prev => {
      const next = new Set(prev);
      if (checked) {
        grup.asesi.forEach(a => next.add(a.id));
      } else {
        grup.asesi.forEach(a => next.delete(a.id));
      }
      return next;
    });
  }

  const handleSavePlotting = async () => {
    setIsSaving(true)
    try {
      const asesiIds = plottedAsesi.map(a => a.id)
      await mockUpdatePlottingSesi(sesiId, asesiIds)
      
      setInfoDialog({ 
        open: true, 
        title: "Sukses", 
        message: "Plotting berhasil disimpan!",
        onConfirm: () => router.push("/admin/timeline") 
      });
    } catch (error) {
      console.error("Gagal menyimpan plotting:", error)
      setInfoDialog({ open: true, title: "Gagal Menyimpan", message: `Gagal menyimpan: ${error.message}` })
    } finally {
      setIsSaving(false)
    }
  }

  // Filter grup berdasarkan pencarian nama/NIM
  const filteredAvailableGrup = useMemo(() => {
    if (!searchTerm) return availableGrup
    
    return availableGrup
      .map(grup => ({
        ...grup,
        asesi: grup.asesi.filter(a => 
          a.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nim.includes(searchTerm)
        )
      }))
      .filter(grup => grup.asesi.length > 0) 
      
  }, [availableGrup, searchTerm])
  
  const totalAsesiAvailable = filteredAvailableGrup.reduce((sum, grup) => sum + grup.asesi.length, 0)

  if (loading || !sesi) {
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
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Navigasi */}
        <div>
           <Button variant="outline" size="sm" asChild className="mb-2">
             <Link href="/admin/timeline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Manajemen Jadwal
             </Link>
           </Button>
          <h1 className="text-3xl font-bold text-gray-900">Atur Peserta Sesi Ujian Offline</h1>
          <p className="text-gray-600 mt-1">
            Plotting peserta untuk sesi: <strong>{sesi.tipeUjian}</strong> ({sesi.ruangan}) pada <strong>{new Date(sesi.tanggal).toLocaleDateString("id-ID")}</strong>
          </p>
        </div>

        {/* Indikator Kapasitas Ruangan */}
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="text-lg font-bold">Kapasitas Ruangan</span>
                    </div>
                    <div className={`text-2xl font-bold ${kapasitasPenuh ? 'text-red-600' : 'text-gray-900'}`}>
                        {plottedAsesi.length} / {sesi.kapasitas}
                    </div>
                </div>
                {kapasitasPenuh && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Kapasitas ruangan sudah penuh. Anda tidak dapat menambahkan peserta lagi.</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Kolom Kiri: Asesi Tersedia */}
          <Card>
            <CardHeader>
              <CardTitle>Asesi Tersedia (Skema {sesi.skemaId})</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Cari nama atau NIM..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 h-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pr-2">
              <div className="flex items-center justify-between gap-2 p-3 border-b">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">Total Tersedia: {totalAsesiAvailable}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={plotSelected}
                  disabled={selectedAvailable.size === 0 || (selectedAvailable.size > sisaKapasitas)}
                  title={selectedAvailable.size > sisaKapasitas ? `Kapasitas tidak cukup! (Sisa: ${sisaKapasitas})` : "Plot asesi yang terpilih"}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Plot Terpilih ({selectedAvailable.size})
                </Button>
              </div>
              
              <div className="max-h-80 overflow-y-auto space-y-2 pt-2">
                {filteredAvailableGrup.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Tidak ada asesi tersedia.</p>}
                
                {filteredAvailableGrup.map(grup => {
                  // Logika Checkbox "Pilih Semua" di level Grup
                  const allInGroupSelected = grup.asesi.length > 0 && grup.asesi.every(a => selectedAvailable.has(a.id));
                  const someInGroupSelected = grup.asesi.some(a => selectedAvailable.has(a.id));
                  const checkboxState = allInGroupSelected ? "checked" : (someInGroupSelected ? "indeterminate" : "unchecked");
                  
                  return (
                    <Collapsible key={grup.namaKelas} className="border rounded-lg">
                        <div className="flex items-center justify-between p-2 bg-gray-50">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex-1 justify-start">
                                    <ChevronRight className="w-4 h-4 mr-2 data-[state=open]:rotate-90 transition-transform" />
                                    <span className="font-bold">{grup.namaKelas}</span>
                                    <span className="text-sm text-gray-500 ml-2">({grup.asesi.length} asesi)</span>
                                </Button>
                            </CollapsibleTrigger>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={() => plotGrup(grup.asesi)}
                              disabled={grup.asesi.length > sisaKapasitas}
                              title={grup.asesi.length > sisaKapasitas ? `Kapasitas tidak cukup (Butuh: ${grup.asesi.length}, Sisa: ${sisaKapasitas})` : "Plot 1 Kelas"}
                            >
                              Plot 1 Kelas
                            </Button>
                        </div>
                        <CollapsibleContent className="p-2 space-y-2">
                            
                            {/* Kontrol Grup: Pilih Semua & Pilih Cepat */}
                            <div className="flex items-center justify-between gap-4 p-2 border-b">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`select-all-${grup.namaKelas}`}
                                  checked={checkboxState === "checked"}
                                  data-state={checkboxState} 
                                  onCheckedChange={(checked) => handleSelectAllInGroup(grup, checked)}
                                />
                                <Label htmlFor={`select-all-${grup.namaKelas}`} className="text-sm font-medium">
                                  Pilih Semua ({grup.asesi.length})
                                </Label>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-blue-600 border-blue-300 hover:bg-blue-50"
                                disabled={sisaSlotReal <= 0}
                                onClick={() => handleSelectSisaKapasitas(grup)}
                              >
                                Pilih Cepat (Sisa {sisaSlotReal})
                              </Button>
                            </div>

                            {/* Daftar Asesi per Grup */}
                            {grup.asesi.map(asesi => (
                              <div key={asesi.id} className="flex items-center gap-3 p-2 border rounded-md">
                                <Checkbox 
                                  id={`avail-${asesi.id}`}
                                  checked={selectedAvailable.has(asesi.id)}
                                  onCheckedChange={(checked) => handleSelectAvailable(asesi.id, checked)}
                                />
                                <Label htmlFor={`avail-${asesi.id}`} className="flex-1 cursor-pointer">
                                  <p className="font-medium text-sm">{asesi.nama}</p>
                                  <p className="text-xs text-muted-foreground">{asesi.nim}</p>
                                </Label>
                              </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Kolom Kanan: Peserta Sesi Ini (Sudah Di-plot) */}
          <Card>
            <CardHeader>
              <CardTitle>Peserta Sesi Ini ({plottedAsesi.length})</CardTitle>
              <CardDescription>Daftar asesi yang akan mengikuti sesi di ruangan ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pr-2">
               <div className="flex items-center justify-between gap-2 p-3 border-b">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="select-all-plotted"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPlotted(new Set(plottedAsesi.map(a => a.id)))
                      } else {
                        setSelectedPlotted(new Set())
                      }
                    }}
                    checked={selectedPlotted.size === plottedAsesi.length && plottedAsesi.length > 0}
                  />
                  <Label htmlFor="select-all-plotted" className="font-normal text-sm">Pilih Semua ({selectedPlotted.size})</Label>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={unplotSelected}
                  disabled={selectedPlotted.size === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Terpilih
                </Button>
              </div>
              
              <div className="max-h-80 overflow-y-auto space-y-2 pt-2">
                {plottedAsesi.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Belum ada peserta.</p>}
                {plottedAsesi.map(asesi => (
                  <div key={asesi.id} className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <Checkbox 
                      id={`plot-${asesi.id}`}
                      checked={selectedPlotted.has(asesi.id)}
                      onCheckedChange={(checked) => handleSelectPlotted(asesi.id, checked)}
                    />
                    <Label htmlFor={`plot-${asesi.id}`} className="flex-1 cursor-pointer">
                      <p className="font-medium text-sm text-blue-900">{asesi.nama}</p>
                      <p className="text-xs text-blue-700">{asesi.nim}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
            <Button size="lg" onClick={handleSavePlotting} disabled={isSaving}>
                {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Plotting Peserta
            </Button>
        </div>

      </div>

      {/* Dialog Notifikasi & Konfirmasi */}
      <AlertDialog open={infoDialog.open} onOpenChange={() => setInfoDialog({ open: false, title: "", message: "" })}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{infoDialog.title || "Informasi"}</AlertDialogTitle>
            <AlertDialogDescription>
              {infoDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              if (typeof infoDialog.onConfirm === 'function') {
                infoDialog.onConfirm();
              }
              setInfoDialog({ open: false, title: "", message: "" });
            }}>
              Oke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </MainLayout>
  )
}