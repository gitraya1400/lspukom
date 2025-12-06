/**
 * Halaman Dashboard Admin
 * * Halaman ini berfungsi sebagai pusat informasi bagi Admin LSP.
 * Fitur utama:
 * 1. Menampilkan statistik ringkasan (Total Asesi, Asesor, Penilaian Tertunda).
 * 2. Menyediakan akses cepat (Quick Actions) ke menu manajemen pengguna dan skema.
 * 3. Menampilkan placeholder untuk aktivitas sistem terbaru (Log Aktivitas).
 */

"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  BookMarked,
  UserCheck,
  Calendar,
  Settings,
} from "lucide-react";
import { mockGetStatistics } from "@/lib/api-mock";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  // State untuk menyimpan data statistik dari API
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mengambil data statistik saat komponen dimuat pertama kali
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await mockGetStatistics();
      setStats(statsData);
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Komponen pembantu untuk menampilkan kartu statistik individu
  const StatCard = ({ title, value, icon, href, colorClass }) => {
    const Icon = icon;
    return (
      <Link href={href} passHref>
        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-700">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-3xl font-bold">{value}</div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Bagian Header Halaman */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Admin LSP
            </h1>
            <p className="text-gray-600 mt-1">
              Ringkasan sistem sertifikasi dan pengguna LMS
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/timeline">Atur Jadwal</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/assignments">+ Tugaskan Asesor</Link>
            </Button>
          </div>
        </div>

        {/* Grid Statistik Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Asesi"
            value={stats?.totalAsesi || 0}
            icon={Users}
            href="/admin/users"
            colorClass="text-blue-600"
          />
          <StatCard
            title="Total Asesor"
            value={stats?.totalAsesor || 0}
            icon={UserCheck}
            href="/admin/users"
            colorClass="text-purple-600"
          />
          <StatCard
            title="Penilaian Tertunda"
            value={stats?.pendingGrading || 0}
            icon={AlertCircle}
            href="/admin/assignments"
            colorClass="text-orange-600"
          />
          <StatCard
            title="Asesi Siap Ujian"
            value={stats?.readyForExam || 0}
            icon={TrendingUp}
            href="#"
            colorClass="text-green-600"
          />
        </div>

        {/* Area Aksi Cepat & Laporan Sistem */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Akses Cepat */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" /> Kelola Pengguna
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href="/admin/schema">
                  <BookMarked className="w-4 h-4 mr-2" /> Kelola Skema
                  & Soal
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href="/admin/timeline">
                  <Calendar className="w-4 h-4 mr-2" /> Manajemen
                  Linimasa
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start"
              >
                <Link href="/admin/timeline">
                  <Settings className="w-4 h-4 mr-2" /> Atur Sesi
                  Ujian Offline
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Panel Laporan Sistem (Data Mockup Sementara) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Laporan Sistem</CardTitle>
              <CardDescription>
                Aktivitas terbaru di dalam sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckSquare className="w-5 h-5 text-green-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Asesor 'Dr. Rini Rahani' menyelesaikan 5
                        penilaian.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 jam lalu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        12 Asesi baru mendaftar untuk skema 'ADS'.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        4 jam lalu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Sesi Ujian Teori (Ruang 301) hampir penuh.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        1 hari lalu
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}