/**
 * Halaman Manajemen Ujian (Admin)
 * * Status: PENGEMBANGAN (Placeholder)
 * * Rencana Fitur:
 * 1. Memonitor sesi ujian yang sedang berlangsung secara Real-time.
 * 2. Mengontrol sesi ujian (Mulai, Jeda, Hentikan Paksa).
 * 3. Melihat log aktivitas peserta ujian (misal: terdeteksi keluar layar).
 * 4. Rekapitulasi kehadiran peserta ujian.
 */

"use client"

import React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function AdminExamsPage() {
  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Bagian Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Ujian</h1>
          <p className="text-gray-600 mt-1">
            Monitor sesi ujian yang sedang berlangsung dan lihat status aktif.
          </p>
        </div>

        {/* Konten Placeholder - Menandakan fitur belum tersedia */}
        <Card>
          <CardHeader>
            <CardTitle>Ujian Sedang Berlangsung</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Fitur Manajemen Ujian sedang dalam pengembangan.</p>
            <p className="text-sm text-gray-400 mt-2">
              Halaman ini nantinya akan menampilkan daftar sesi ujian yang sedang aktif beserta status pesertanya.
            </p>
          </CardContent>
        </Card>
        
        {/* Elemen Loading Skeleton sebagai pemanis tampilan */}
        <Skeleton className="h-40 w-full bg-gray-200" />
      </div>
    </MainLayout>
  )
}