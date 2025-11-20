// frontend-lms-v3-master/app/asesor/asesi-list/page.jsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockGetPenugasanAsesor } from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, FileText, Mic, Brain, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

// ===============================================================
// KOMPONEN: TaskModalButton 
// ===============================================================
const TaskModalButton = ({ label, tasks, variant, icon: Icon, buttonClassName = "", asesiNama }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Jika hanya 1 tugas, langsung buat link. Tidak perlu modal.
  if (tasks.length === 1) {
    return (
      <Button asChild variant={variant} size="sm" className={cn("h-auto py-1 px-2 text-xs", buttonClassName)}>
        <Link href={`/asesor/grading/${tasks[0].id}`} title={`Klik untuk ${label}`}>
          <span className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {tasks.length} {label}
          </span>
        </Link>
      </Button>
    );
  }

  // Jika lebih dari 1 tugas, gunakan modal
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={cn("h-auto py-1 px-2 text-xs", buttonClassName)}>
          <span className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {tasks.length} {label}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {label === "Selesai" ? "Pilih Tugas Untuk Melihat Penilaian" : "Pilih Tugas Untuk Dinilai"}
          </DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{asesiNama}</span> memiliki {tasks.length} tugas yang {label.toLowerCase()} dinilai.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2 max-h-60 overflow-y-auto">
          {tasks.map(task => {
            const displayTipe = task.tipe.replace('_', ' '); 
            const displayJudul = task.unitJudul.replace(' (Gabungan)', '');
            return (
              <Link 
                key={task.id} 
                href={`/asesor/grading/${task.id}`} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                onClick={() => setIsOpen(false)}
              >
                <div>
                  <p className="font-medium text-sm">{displayJudul}</p>
                  <p className="text-xs text-muted-foreground">
                    Tipe: {displayTipe}
                    {task.tipe === 'TEORI' && ` - Unit ${task.unitId || task.unitNomor || ''}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};


// ===============================================================
// KOMPONEN UTAMA
// ===============================================================
export default function AsesiListPage() {
  const { user } = useAuth();
  const [allPenugasan, setAllPenugasan] = useState([]);
  const [asesiList, setAsesiList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkema, setFilterSkema] = useState("SEMUA");
  const [filterKelas, setFilterKelas] = useState("SEMUA");
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const penugasanData = await mockGetPenugasanAsesor(user.id);
      setAllPenugasan(penugasanData);
      
      const asesiMap = new Map();
      penugasanData.forEach(p => {
        if (!asesiMap.has(p.asesiId)) {
          asesiMap.set(p.asesiId, {
            id: p.asesiId,
            nama: p.asesiNama,
            skemaId: p.skemaId,
            kelas: p.asesiKelas || "N/A",
            pendingTasks: [],
            completedTasks: [],
          });
        }
        
        const asesi = asesiMap.get(p.asesiId);
        
        if (p.statusPenilaian === "BELUM_DINILAI") {
          asesi.pendingTasks.push(p);
        } else if (p.statusPenilaian === "SELESAI") {
          asesi.completedTasks.push(p);
        }
      });
      
      setAsesiList(Array.from(asesiMap.values()));

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const skemaList = useMemo(() => {
    const skemaSet = new Set(allPenugasan.map(p => p.skemaId).filter(Boolean));
    return Array.from(skemaSet).sort();
  }, [allPenugasan]);

  const kelasList = useMemo(() => {
    const tasksFilteredBySkema = (filterSkema === "SEMUA")
      ? allPenugasan
      : allPenugasan.filter(p => p.skemaId === filterSkema);
      
    const kelasSet = new Set(tasksFilteredBySkema.map(p => p.asesiKelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [allPenugasan, filterSkema]);

  useEffect(() => {
    setFilterKelas("SEMUA");
    setCurrentPage(1);
  }, [filterSkema]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKelas, searchTerm, filterStatus]);


  const filteredAsesi = useMemo(() => {
    return asesiList.filter((a) => {
        const matchSearch =
          a.nama.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchSkema = 
          filterSkema === "SEMUA" || a.skemaId === filterSkema;

        const matchKelas = 
          filterKelas === "SEMUA" || a.kelas === filterKelas;
          
        let matchStatus = true;
        if (filterStatus === "BELUM_SELESAI") {
            matchStatus = a.pendingTasks.length > 0;
        } else if (filterStatus === "SUDAH_SELESAI") {
            matchStatus = a.pendingTasks.length === 0 && a.completedTasks.length > 0;
        }
          
        return matchSearch && matchSkema && matchKelas && matchStatus;
      }
    )
  }, [asesiList, searchTerm, filterSkema, filterKelas, filterStatus]);

  const totalPages = Math.ceil(filteredAsesi.length / ITEMS_PER_PAGE);

  const paginatedAsesi = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredAsesi.slice(start, end);
  }, [filteredAsesi, currentPage]);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Daftar Asesi</h1>
          <p className="text-muted-foreground mt-1">Daftar semua peserta (asesi) yang ditugaskan kepada Anda.</p>
        </div>

        <Card>
          <CardHeader>
            {/* PERBAIKAN 1: Menghapus CardTitle "Filter & Cari Asesi" */}
            
            <div className="mt-4 flex flex-col md:flex-row gap-4 items-end">
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-48">
                  <Label htmlFor="filter-skema">Filter Skema</Label>
                  <Select value={filterSkema} onValueChange={setFilterSkema}>
                    <SelectTrigger id="filter-skema" className="mt-1.5 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMUA">Semua Skema</SelectItem>
                      {skemaList.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:w-48">
                  <Label htmlFor="filter-kelas">Filter Kelas</Label>
                  <Select value={filterKelas} onValueChange={setFilterKelas}>
                    <SelectTrigger id="filter-kelas" className="mt-1.5 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMUA">Semua Kelas</SelectItem>
                      {kelasList.map(k => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:w-56">
                  <Label htmlFor="filter-status">Filter Status Penilaian</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="filter-status" className="mt-1.5 h-10">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMUA">Semua Status</SelectItem>
                      <SelectItem value="BELUM_SELESAI">Belum Selesai (Pending)</SelectItem>
                      <SelectItem value="SUDAH_SELESAI">Sudah Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 w-full">
                <Label htmlFor="search-asesi">Cari Nama Asesi</Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input 
                    id="search-asesi"
                    placeholder="Cari nama asesi..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            </div>

            {/* PERBAIKAN 2: Pindahkan CardDescription (Ringkasan) ke Bawah Box Filter */}
            <CardDescription className="pt-4">
                Menampilkan {paginatedAsesi.length} dari {filteredAsesi.length} total asesi.
            </CardDescription>
            {/* BATAS PERBAIKAN 2 */}

          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : paginatedAsesi.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p>Tidak ada asesi yang cocok dengan filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {/* PENAMBAHAN: Kolom No. */}
                    <TableHead className="w-[5%] text-center">No.</TableHead>
                    <TableHead className="w-[30%]">Nama Asesi</TableHead>
                    <TableHead className="w-[15%]">Kelas</TableHead>
                    <TableHead className="w-[15%]">Skema</TableHead>
                    <TableHead className="w-[35%]">Status Penilaian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAsesi.map((asesi, index) => (
                    <TableRow key={asesi.id} className="hover:bg-gray-50">
                      {/* PENAMBAHAN: Menampilkan Nomor Urut */}
                      <TableCell className="text-center">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}.
                      </TableCell>
                      {/* BATAS PENAMBAHAN */}
                      <TableCell>
                        <p className="font-medium text-gray-900">{asesi.nama}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{asesi.kelas}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          asesi.skemaId === 'DS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {asesi.skemaId}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-2 items-start">
                          {asesi.pendingTasks.length > 0 && (
                            <TaskModalButton
                              label="Belum Dinilai"
                              tasks={asesi.pendingTasks}
                              variant="default"
                              icon={AlertCircle}
                              buttonClassName="bg-primary hover:bg-primary/90 text-primary-foreground"
                              asesiNama={asesi.nama} 
                            />
                          )}
                          {asesi.completedTasks.length > 0 && (
                            <TaskModalButton
                              label="Selesai"
                              tasks={asesi.completedTasks}
                              variant="outline"
                              icon={CheckCircle2}
                              buttonClassName="bg-green-600 hover:bg-green-700 text-white border-green-600"
                              asesiNama={asesi.nama} 
                            />
                          )}
                          {asesi.pendingTasks.length === 0 && asesi.completedTasks.length === 0 && (
                            <span className="text-xs text-muted-foreground">Tidak ada tugas</span>
                          )}
                        </div>
                      </TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          
          {totalPages > 1 && (
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
          )}
        </Card>

      </div>
    </MainLayout>
  )
}