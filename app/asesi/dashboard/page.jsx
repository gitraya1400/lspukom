/**
 * Halaman Dashboard Asesi
 * * Fitur utama:
 * 1. Menampilkan progress keseluruhan sertifikasi (%).
 * 2. Menampilkan 3 fase utama: Pembelajaran, Tryout, Ujian Kompetensi.
 * 3. Logika pembukaan fase berurutan (sequential unlock).
 * 4. Auto-redirect ke pra-asesmen jika belum selesai.
 */
"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { mockGetProgressAsesi } from "@/lib/api-mock"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Play, Lock } from "lucide-react"
import Link from "next/link"

// ===============================================================
// --- KOMPONEN: FASE CARD ---
// ===============================================================
const FaseCard = ({ fase, judul, deskripsi, status, link, progressValue }) => {
  let statusButton

  if (status === "SELESAI") {
    statusButton = (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-md">
        <Check className="w-5 h-5 text-green-700" />
        <span className="font-medium text-green-700">Selesai</span>
      </div>
    )
  } else if (status === "TERKUNCI") {
     statusButton = (
      <Button size="lg" disabled={true} variant="outline">
        <Lock className="w-4 h-4 mr-2" />
        Terkunci
      </Button>
    )
  } else {
    statusButton = (
      <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href={link}>
          <Play className="w-4 h-4 mr-2" />
          Mulai
        </Link>
      </Button>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-600">{fase}</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{judul}</h3>
            <p className="text-gray-500 mt-2">{deskripsi}</p>
          </div>
          <div className="ml-6 flex-shrink-0">
            {statusButton}
          </div>
        </div>
        
        {progressValue !== undefined && status !== "SELESAI" && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Progress Pembelajaran</span>
                <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ===============================================================
// --- HALAMAN UTAMA DASHBOARD ASESI ---
// ===============================================================
export default function AsesiDashboard() {
  const { user, loading: isAuthLoading } = useAuth() 
  const router = useRouter()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  // ===============================================================
  // --- LIFECYCLE: LOAD DATA & REDIRECT ---
  // ===============================================================
  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }
    if (!user) {
      router.push("/login"); 
      return;
    }
    loadData()
  }, [user, isAuthLoading, router])
  
  /**
   * Load progress asesi dan redirect ke pra-asesmen jika belum selesai
   */
  const loadData = async () => {
    try {
      setLoading(true)
      if (!user) return

      const progressData = await mockGetProgressAsesi(user.id)

      // Redirect ke pra-asesmen jika belum mengisi
      if (progressData.statusPraAsesmen === "BELUM") {
        router.push("/asesi/pra-asesmen")
        return 
      }

      setProgress(progressData)

    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // ===============================================================
  // --- KALKULASI PROGRESS KESELURUHAN ---
  // =============================================================== 
  const overallProgress = useMemo(() => {
    if (!progress) return 0;
    
    let total = 0;
    
    total += (progress.progressPembelajaran || 0) * 0.4;
    
    if (progress.tryoutSelesai) total += 15; 
    
    if (progress.ujianTeoriSelesai) total += 15; 
    
    if (progress.ujianPraktikumSelesai) total += 15; 

    if (progress.ujianUnjukDiriSelesai) total += 15;
    
    return Math.round(total);
  }, [progress]);
  
  if (loading || isAuthLoading || !progress) {
     return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-40 w-full bg-gray-200" />
          <Skeleton className="h-24 w-full bg-gray-200" />
          <Skeleton className="h-24 w-full bg-gray-200" />
        </div>
      </MainLayout>
    )
  }

  // ===============================================================
  // --- LOGIKA STATUS FASE (Sequential Unlock) ---
  // ===============================================================
  // Fase 1 (Pembelajaran): AKTIF jika progressPembelajaran < 100%, SELESAI jika 100%
  const progressPercentage = progress?.progressPembelajaran || 0
  const statusFase1 = progressPercentage === 100 ? "SELESAI" : "AKTIF"
  
  // Fase 2 (Tryout): AKTIF jika Fase 1 SELESAI dan tryout belum selesai
  let statusFase2 = "TERKUNCI"
  if (statusFase1 === "SELESAI") {
    statusFase2 = progress.tryoutSelesai ? "SELESAI" : "AKTIF"
  }
  
  // Fase 3 (Ujian): AKTIF jika Fase 2 SELESAI  
  let statusFase3 = "TERKUNCI"
  if (statusFase2 === "SELESAI") {
    statusFase3 = "AKTIF" 
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        {/* Banner Selamat Datang */}
        <div className="w-full bg-blue-700 text-white rounded-lg p-8 space-y-4">
            <h1 className="text-3xl font-bold">Selamat Datang, {user?.nama}!</h1>
            <p className="text-blue-200 mt-1">Ikuti 3 fase untuk menyelesaikan sertifikasi.</p>
            
            <div className="pt-2">
              <div className="flex justify-between text-sm font-medium text-blue-100 mb-1">
                <span>Progress Keseluruhan</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 bg-white/20" indicatorClassName="bg-white" />
            </div>
        </div>

        {/* Daftar Fase */}
        <div className="space-y-4">
          <FaseCard 
            fase="Fase 1: Pembelajaran"
            judul="Pembelajaran"
            deskripsi="Pelajari semua materi untuk membuka tryout"
            status={statusFase1}
            link="/asesi/learning"
            progressValue={progressPercentage}
          />
          <FaseCard 
            fase="Fase 2: Tryout"
            judul="Tryout"
            deskripsi="Kerjakan tryout sebelum memulai ujian"
            status={statusFase2}
            link="/asesi/tryout"
          />
          <FaseCard 
            fase="Fase 3: Ujian Kompetensi"
            judul="Ujian Teori, Praktikum & Unjuk Diri"
            deskripsi="Masuk ke hub ujian untuk melihat jadwal dan mengerjakan ujian."
            status={statusFase3}
            link="/asesi/exams"
          />
        </div>
      </div>
    </MainLayout>
  )
}