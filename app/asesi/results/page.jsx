"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Clock, HelpCircle } from "lucide-react";
import { mockGetHasilAkhir } from "@/lib/api-mock";

// Helper untuk memformat teks status (Hapus Underscore & Ubah Huruf)
const formatStatusText = (text) => {
  if (!text) return "";
  const spaced = text.replace(/_/g, " ");
  return spaced.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export default function ResultsPage() {
  const { user } = useAuth();
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadResults();
    }
  }, [user]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const hasilData = await mockGetHasilAkhir(user.id);
      setHasil(hasilData);
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Komponen Helper untuk Badge Status
  const StatusBadge = ({ status }) => {
    let colorClass = "text-gray-600";
    let Icon = HelpCircle;
    let displayText = formatStatusText(status);

    if (status === "KOMPETEN") {
      colorClass = "text-green-600";
      Icon = CheckCircle2;
      displayText = "Kompeten";
    } else if (status === "BELUM KOMPETEN" || status === "BELUM_KOMPETEN") {
      colorClass = "text-red-600";
      Icon = AlertCircle;
      displayText = "Belum Kompeten";
    } else if (status === "SEDANG_DINILAI") {
      colorClass = "text-orange-600";
      Icon = Clock;
      displayText = "Sedang Dinilai";
    } else if (status === "BELUM_DINILAI" || status === "BELUM_ADA_PENILAIAN") {
      colorClass = "text-gray-500";
      Icon = null;
      displayText = "Belum Dinilai";
    }

    return (
      <div className={`flex items-center gap-2 ${colorClass}`}>
        {Icon && <Icon className="w-5 h-5" />}
        <span className="text-base font-bold uppercase">{displayText}</span>
      </div>
    );
  };

  // Helper untuk Warna Background Kartu Utama
  const getCardStyle = (status) => {
    switch (status) {
      case "KOMPETEN":
        return "border-green-200 bg-green-50";
      case "BELUM_KOMPETEN":
      case "BELUM KOMPETEN":
        return "border-red-200 bg-red-50";
      case "SEDANG_DINILAI":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hasil Penilaian</h1>
          <p className="text-muted-foreground mt-1">
            Lihat hasil ujian dan status kompetensi Anda
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card className={`border-2 ${getCardStyle(hasil?.statusAkhir)}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl text-muted-foreground mb-1">
                    Status Akhir
                  </p>
                  <div className="flex items-center gap-3">
                    {hasil?.statusAkhir === "KOMPETEN" && (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    )}
                    {(hasil?.statusAkhir === "BELUM KOMPETEN" ||
                      hasil?.statusAkhir === "BELUM_KOMPETEN") && (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    )}
                    {hasil?.statusAkhir === "SEDANG_DINILAI" && (
                      <Clock className="w-8 h-8 text-orange-600" />
                    )}

                    <p
                      className={`text-3xl font-bold uppercase 
                      ${
                        hasil?.statusAkhir === "KOMPETEN"
                          ? "text-green-700"
                          : hasil?.statusAkhir === "BELUM KOMPETEN" ||
                            hasil?.statusAkhir === "BELUM_KOMPETEN"
                          ? "text-red-700"
                          : hasil?.statusAkhir === "SEDANG_DINILAI"
                          ? "text-orange-700"
                          : "text-gray-700"
                      }`}
                    >
                      {formatStatusText(hasil?.statusAkhir)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pesan Kontekstual */}
              <div
                className={`mt-4 pt-4 border-t ${
                  hasil?.statusAkhir === "KOMPETEN"
                    ? "border-green-200 text-green-700"
                    : hasil?.statusAkhir === "BELUM KOMPETEN" ||
                      hasil?.statusAkhir === "BELUM_KOMPETEN"
                    ? "border-red-200 text-red-700"
                    : hasil?.statusAkhir === "SEDANG_DINILAI"
                    ? "border-orange-200 text-orange-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {hasil?.statusAkhir === "KOMPETEN" && (
                  <p>
                    Selamat! Anda telah dinyatakan KOMPETEN berdasarkan seluruh
                    rangkaian asesmen.
                  </p>
                )}
                {(hasil?.statusAkhir === "BELUM KOMPETEN" ||
                  hasil?.statusAkhir === "BELUM_KOMPETEN") && (
                  <p>
                    Anda dinyatakan BELUM KOMPETEN. Silakan hubungi admin untuk
                    info remedial.
                  </p>
                )}
                {hasil?.statusAkhir === "SEDANG_DINILAI" && (
                  <p>
                    Jawaban Anda telah kami terima. Asesor sedang melakukan
                    proses penilaian. Harap cek kembali secara berkala.
                  </p>
                )}
                {hasil?.statusAkhir === "BELUM_DINILAI" && (
                  <p>
                    Anda belum mengikuti atau menyelesaikan rangkaian ujian.
                    Silakan selesaikan ujian terlebih dahulu.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rincian Penilaian</CardTitle>
            <CardDescription>
              Status kompetensi Anda berdasarkan 3 komponen ujian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* === KARTU UJIAN TEORI === */}
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">
                    Ujian Teori (Akumulasi)
                  </CardTitle>
                  <CardDescription>
                    Akumulasi kelulusan dari semua unit kompetensi.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <StatusBadge status={hasil?.hasilTeori.statusAkumulasi} />
                    {/* Tampilkan total unit lulus jika sudah mulai dinilai */}
                    {(hasil?.hasilTeori.statusAkumulasi === "SEDANG_DINILAI" ||
                      hasil?.hasilTeori.statusAkumulasi === "KOMPETEN" ||
                      hasil?.hasilTeori.statusAkumulasi === "BELUM KOMPETEN") && (
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {hasil?.hasilTeori.totalUnitLulus} /{" "}
                          {hasil?.hasilTeori.totalUnitSkema}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unit Lulus
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {hasil?.hasilTeori.rincianUnit.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mt-2">
                    <p className="text-sm font-medium mb-2">
                      Rincian per Unit:
                    </p>
                    {loading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : (
                      hasil?.hasilTeori.rincianUnit.map((unit) => {
                        const isGraded =
                          unit.status === "KOMPETEN" ||
                          unit.status === "BELUM_KOMPETEN" ||
                          unit.status === "BELUM KOMPETEN";

                        return (
                          <div
                            key={unit.unitId}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {unit.judul}
                              </p>

                              {/* Tampilkan detail soal jika sudah dinilai */}
                              {isGraded ? (
                                <p className="text-xs text-muted-foreground">
                                  {unit.status === "KOMPETEN"
                                    ? `${unit.soalSesuai} dari ${unit.soalTotal} soal SESUAI`
                                    : `${unit.soalTotal - unit.soalSesuai} dari ${unit.soalTotal} soal TIDAK SESUAI`}
                                </p>
                              ) : null}
                            </div>

                            {/* Badge Kecil per Unit */}
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded 
                                ${
                                  unit.status === "KOMPETEN"
                                    ? "bg-green-100 text-green-700"
                                    : unit.status === "BELUM KOMPETEN" ||
                                      unit.status === "BELUM_KOMPETEN"
                                    ? "bg-red-100 text-red-700"
                                    : unit.status === "SEDANG_DINILAI"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {unit.status === "BELUM_DINILAI" ||
                              unit.status === "BELUM_ADA_PENILAIAN"
                                ? "BELUM DINILAI"
                                : formatStatusText(unit.status).toUpperCase()}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* === KARTU UJIAN PRAKTIKUM === */}
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Ujian Praktikum</CardTitle>
                  <CardDescription>
                    Penilaian studi kasus (upload file .ppt)
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <div>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <StatusBadge status={hasil?.hasilPraktikum?.status} />
                    </div>
                    
                    {/* Tampilkan detail soal jika sudah dinilai (KOMPETEN atau BELUM KOMPETEN) */}
                    {(hasil?.hasilPraktikum?.status === "KOMPETEN" || 
                      hasil?.hasilPraktikum?.status === "BELUM KOMPETEN" || 
                      hasil?.hasilPraktikum?.status === "BELUM_KOMPETEN") && (
                      <div className="mt-2 p-3 border rounded-lg">
                        <p className="text-sm font-medium mb-1">
                          Detail Penilaian:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasil?.hasilPraktikum?.status === "KOMPETEN"
                            ? "1 dari 1 soal SESUAI"
                            : "1 dari 1 soal TIDAK SESUAI"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* === KARTU UNJUK DIRI === */}
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Unjuk Diri</CardTitle>
                  <CardDescription>
                    Penilaian presentasi di hadapan asesor
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <div>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <StatusBadge status={hasil?.hasilUnjukDiri?.status} />
                    </div>
                    
                    {/* Tampilkan detail soal jika sudah dinilai (KOMPETEN atau BELUM KOMPETEN) */}
                    {(hasil?.hasilUnjukDiri?.status === "KOMPETEN" || 
                      hasil?.hasilUnjukDiri?.status === "BELUM KOMPETEN" || 
                      hasil?.hasilUnjukDiri?.status === "BELUM_KOMPETEN") && (
                      <div className="mt-2 p-3 border rounded-lg">
                        <p className="text-sm font-medium mb-1">
                          Detail Penilaian:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasil?.hasilUnjukDiri?.status === "KOMPETEN"
                            ? "1 dari 1 soal SESUAI"
                            : "1 dari 1 soal TIDAK SESUAI"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}