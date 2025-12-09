/**
 * Halaman Dashboard Asesor
 * * Berisi ringkasan tugas penilaian dan akses cepat:
 * 1. Statistik per jenis ujian (Teori, Praktikum, Unjuk Diri).
 * 2. Quick actions untuk melihat tugas, daftar asesi, dan jadwal.
 * 3. Menampilkan banner selamat datang untuk Asesor.
 */

"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockGetPenugasanAsesor } from "@/lib/api-mock"; 
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Users, Calendar, BookText, FlaskConical, Mic } from "lucide-react"; 
import Link from "next/link";
import { cn } from "@/lib/utils"; 

// ===============================================================
// --- KOMPONEN 'StatTypeCard' (KARTU STATISTIK) ---
// ===============================================================
/**
 * Menampilkan statistik tugas per kategori (Teori/Praktikum/Unjuk Diri)
 * dengan warna border yang berbeda-beda.
 */
  const StatTypeCard = ({ title, icon, stats, colorClass, loading }) => {
  const Icon = icon;
  
  // Tentukan warna teks untuk angka (misal: menunggu = oranye)
  const pendingColor = stats?.pending > 0 ? "text-orange-600" : "text-gray-900";
  const completedColor = stats?.completed > 0 ? "text-green-600" : "text-gray-900";
  
  return (
    // Tambahkan border atas berwarna
    <Card className={cn("hover:shadow-lg transition-shadow border-t-4", colorClass)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {loading || !stats ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Total Tugas</span>
              <span className="font-bold text-lg">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Menunggu Penilaian</span>
              <span className={cn("font-bold text-lg", pendingColor)}>{stats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sudah Dinilai</span>
              <span className={cn("font-bold text-lg", completedColor)}>{stats.completed}</span>
            </div>
            {/* Bagian Rata-rata Nilai TELAH DIHAPUS */}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ===============================================================
// --- HALAMAN UTAMA DASHBOARD ASESOR ---
// ===============================================================

export default function AsesorDashboard() {
  const { user } = useAuth();
  // State untuk menampung statistik per kategori {teori, praktikum, unjukDiri}
  const [stats, setStats] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  /**
   * Mengambil data penugasan dan menghitung statistik secara manual di sisi klien.
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      const penugasanData = await mockGetPenugasanAsesor(user.id);
      
      // 1. Pisahkan tugas berdasarkan tipe ujian
      const teoriTasks = penugasanData.filter(p => p.tipe === 'TEORI');
      const praktikumTasks = penugasanData.filter(p => p.tipe === 'PRAKTIKUM');
      const unjukDiriTasks = penugasanData.filter(p => p.tipe === 'UNJUK_DIRI');

      // 2. Helper untuk menghitung jumlah pending/completed
      const calcStats = (tasks) => ({
        total: tasks.length,
        pending: tasks.filter(p => p.statusPenilaian === 'BELUM_DINILAI').length,
        completed: tasks.filter(p => p.statusPenilaian === 'SELESAI').length,
      });

      // 3. Update state statistik
      setStats({
        teori: calcStats(teoriTasks),
        praktikum: calcStats(praktikumTasks),
        unjukDiri: calcStats(unjukDiriTasks),
      });
      
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        
        {/* 1. Banner Selamat Datang */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold">Selamat Datang, {user?.nama}!</h1>
          <p className="text-purple-200 mt-1">Selamat datang kembali! Kelola tugas penilaian dan berikan umpan balik kepada asesi.</p>
        </div>

        {/* 2. Judul Statistik */}
         <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-gray-700" />
              Statistik Tugas Penilaian Berdasarkan Jenis Ujian
            </h2>
            <p className="text-muted-foreground mt-1"></p>
          </div>

        {/* 3. Grid Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatTypeCard 
            title="Ujian Teori"
            icon={BookText}
            stats={stats?.teori}
            colorClass="border-yellow-500" 
            loading={loading}
          />
          <StatTypeCard 
            title="Ujian Praktikum"
            icon={FlaskConical}
            stats={stats?.praktikum}
            colorClass="border-green-500" 
            loading={loading}
          />
          <StatTypeCard 
            title="Unjuk Diri"
            icon={Mic} 
            stats={stats?.unjukDiri}
            colorClass="border-purple-500" 
            loading={loading}
          />
        </div>

        {/* 4. Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Akses Cepat</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="justify-start p-6 text-base">
              <Link href="/asesor/grading">
                <CheckSquare className="w-5 h-5 mr-3" /> Lihat Semua Tugas Penilaian
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start p-6 text-base">
              <Link href="/asesor/asesi-list">
                <Users className="w-5 h-5 mr-3" /> Lihat Daftar Asesi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start p-6 text-base">
              <Link href="/asesor/schedule">
                <Calendar className="w-5 h-5 mr-3" /> Lihat Jadwal
              </Link>
            </Button>
          </CardContent>
        </Card>
        
      </div>
    </MainLayout>
  );
}