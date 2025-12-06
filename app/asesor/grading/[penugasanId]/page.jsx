/**
 * Halaman Detail Penilaian (Asesor)
 * * Fitur utama:
 * 1. Menampilkan detail tugas penilaian per asesi.
 * 2. Menampilkan jawaban/hasil tugas (preview file jika ada).
 * 3. Form penilaian untuk menyimpan status kompetensi.
 * 4. Dialog konfirmasi dan dialog sukses setelah submit.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"; // <-- 1. IMPORT ALERT DIALOG
import { mockSubmitNilai, mockGetPenugasanDetail } from "@/lib/api-mock"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils"; 

// ===============================================================
// --- HALAMAN DETAIL PENILAIAN (FORM GRADING) ---
// ===============================================================

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const penugasanId = params.penugasanId;

  const [penugasan, setPenugasan] = useState(null);
  const [status, setStatus] = useState("BELUM KOMPETEN"); 
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Dialog
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // <-- 2. STATE BARU

  // Load Data Detail
  useEffect(() => {
    if (penugasanId) {
      setLoading(true);
      mockGetPenugasanDetail(penugasanId)
        .then((data) => {
          setPenugasan(data);
          // Jika sudah dinilai sebelumnya, set status awal sesuai nilai database
          if (data.statusPenilaian === "SELESAI") {
            setStatus(data.nilaiKompetensi); 
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert(`Gagal memuat data penugasan: ${err.message}`); 
          setLoading(false);
        });
    }
  }, [penugasanId]);

  // Mock Link Jawaban (Simulasi file yang diupload asesi)
  const jawabanAsesi = {
    TEORI: "Ini adalah jawaban esai Asesi untuk unit ini. Jawabannya terlihat cukup komprehensif dan mencakup poin-poin utama yang diminta dalam soal.",
    PRAKTIKUM: "https://drive.google.com/file/d/1_jiqBu6xPRe9PVCSLYzYuHothBIW_6vU/preview", // Link preview Google
    UNJUK_DIRI: "Penilaian dilakukan offline. Asesi hadir dan mempresentasikan hasil dengan cukup baik.",
  };

  // Fungsi Submit Penilaian
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await mockSubmitNilai(penugasanId, null, status, ""); // feedback dikirim sbg string kosong
      
      setShowConfirm(false); // Tutup dialog konfirmasi
      setShowSuccessDialog(true); // Tampilkan dialog sukses
      
    } catch (error) {
      console.error("Error submitting grading:", error);
      alert("Gagal menyimpan penilaian");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !penugasan) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full bg-gray-200" />
          <Skeleton className="h-96 w-full bg-gray-200" />
        </div>
      </MainLayout>
    );
  }
  
  const isSelesai = penugasan.statusPenilaian === "SELESAI";

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Penilaian {penugasan.tipe}</h1>
          <p className="text-muted-foreground mt-1">{penugasan.unitJudul}</p>
        </div>

        {/* Info Card: Asesi & Skema */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Penugasan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Asesi</p>
              <p className="text-lg font-semibold mt-1">{penugasan.asesiNama}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Skema</p>
              <p className="text-lg font-semibold mt-1">{penugasan.skemaId}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Unit</p>
              <p className="text-lg font-semibold mt-1">{penugasan.unitId ? `Unit ${penugasan.unitId}` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Jawaban Asesi (Dengan Iframe Preview) */}
        <Card>
          <CardHeader>
            <CardTitle>Jawaban Asesi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {penugasan.tipe === "PRAKTIKUM" ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-lg border overflow-hidden bg-gray-100">
                  <iframe
                    src={jawabanAsesi.PRAKTIKUM} 
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    frameBorder="0"
                    title="PPT Preview"
                  >
                    Browser Anda tidak mendukung iframe, silakan unduh file.
                  </iframe>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a 
                    href={jawabanAsesi.PRAKTIKUM.replace("/preview", "/view")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Download File (Jika Gagal Preview)
                  </a>
                </Button>
              </div>
            ) : (
              <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
                <p>{jawabanAsesi[penugasan.tipe]}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penilaian Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Penilaian</CardTitle>
            <CardDescription>Berikan status kompetensi untuk unit ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          
            {isSelesai && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-700" />
                <AlertTitle className="text-green-800">Penilaian Selesai</AlertTitle>
                <AlertDescription className="text-green-900">
                  Penilaian ini sudah disimpan dan tidak dapat diubah lagi.
                </AlertDescription>
              </Alert>
            )}

            {/* Status Kompetensi (Bukan Nilai Angka) */}
            <div>
              <label className={cn("text-sm font-medium block mb-3", isSelesai && "text-muted-foreground")}>
                Status Kompetensi *
              </label>
              
              <RadioGroup 
                value={status} 
                onValueChange={(value) => setStatus(value)} 
                disabled={isSelesai}
              >
                <div className={cn(
                  "flex items-center space-x-2 mb-3 p-4 border rounded-lg", 
                  isSelesai && "opacity-70 cursor-not-allowed",
                  status === "KOMPETEN" && "bg-green-50 border-green-300"
                )}>
                  <RadioGroupItem value="KOMPETEN" id="kompeten" disabled={isSelesai} />
                  <Label htmlFor="kompeten" className={cn("font-normal flex-1", isSelesai ? "cursor-not-allowed" : "cursor-pointer")}>
                    <span className="flex items-center gap-2">
                      Kompeten
                    </span>
                  </Label>
                </div>
                <div className={cn(
                  "flex items-center space-x-2 p-4 border rounded-lg", 
                  isSelesai && "opacity-70 cursor-not-allowed",
                  status === "BELUM KOMPETEN" && "bg-red-50 border-red-300"
                )}>
                  <RadioGroupItem value="BELUM KOMPETEN" id="belum-kompeten" disabled={isSelesai} />
                  <Label htmlFor="belum-kompeten" className={cn("font-normal flex-1", isSelesai ? "cursor-not-allowed" : "cursor-pointer")}>
                    <span className="flex items-center gap-2">
                      Belum Kompeten
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                {isSelesai ? "Kembali" : "Batal"}
              </Button>
              
              {!isSelesai && (
                <Button onClick={() => setShowConfirm(true)}>
                  Simpan Penilaian
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Konfirmasi */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penilaian</DialogTitle>
            <DialogDescription>
              Anda akan memberikan status <strong>{status}</strong>. Penilaian yang disimpan tidak dapat diubah lagi. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Ya, Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog Sukses*/}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Sukses</AlertDialogTitle>
            <AlertDialogDescription>
              Penilaian berhasil disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessDialog(false);
              router.back(); // Pindah ke halaman sebelumnya
            }}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </MainLayout>
  );
}