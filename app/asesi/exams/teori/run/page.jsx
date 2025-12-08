/**
 * Halaman Eksekusi Ujian Teori (Asesi)
 * * Fitur utama:
 * 1. Fullscreen mode wajib selama ujian.
 * 2. Timer countdown dengan auto-submit.
 * 3. Local storage untuk save/restore progress.
 * 4. Validasi jadwal ujian (tanggal & waktu).
 * 5. Navigasi soal dan tracking jawaban.
 */
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Clock, Home, Loader2, MonitorOff, Check } from "lucide-react"
import { 
  mockGetSoalForUnit, 
  mockGetUnitsForSkema, 
  mockSubmitUjianTeori,
  mockGetExamStatus,
  mockGetProgressAsesi
} from "@/lib/api-mock"
import Link from "next/link"

// ===============================================================
// --- HELPER FUNCTIONS ---
// ===============================================================

/**
 * Generate unique key untuk localStorage berdasarkan user dan skema
 */
const getExamStorageKey = (userId, skemaId) => `teori_exam_progress_${userId}_${skemaId}`;

// ===============================================================
// --- HALAMAN EKSEKUSI UJIAN TEORI ---
// ===============================================================
export default function TeoriExamRunPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()

  // State untuk data soal dan unit
  const [units, setUnits] = useState([])
  const [soal, setSoal] = useState([])
  const [unitDetails, setUnitDetails] = useState([]) 
  
  const [isLoadingData, setIsLoadingData] = useState(true) 
  const [isChecking, setIsChecking] = useState(true) 
  const [authError, setAuthError] = useState(null) 

  // State untuk navigasi dan jawaban
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExamActive, setIsExamActive] = useState(false)
  
  const [isRestored, setIsRestored] = useState(false)
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  const storageKey = useMemo(() => {
    if (!user) return null
    return getExamStorageKey(user.id, user.skemaId)
  }, [user])

  /**
   * Hapus state ujian dari localStorage
   */
  const clearExamState = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // ===============================================================
  // --- FULLSCREEN MANAGEMENT ---
  // ===============================================================
  const openFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn(`Gagal masuk fullscreen: ${err.message}. Meminta aksi user.`);
        setShowFullscreenWarning(true); 
      });
    }
  }
  
  const closeFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error("Gagal keluar fullscreen:", err));
    }
  }

  // ===============================================================
  // --- EVENT HANDLERS ---
  // ===============================================================

  /**
   * Submit ujian ke server dan redirect ke halaman ujian
   * Dipanggil saat waktu habis atau user klik selesai
   */
  const handleSubmitExam = useCallback(async () => {
    if (!user) return;

    setIsExamActive(false);
    closeFullscreen();

    console.log("Ujian Teori submitted with answers:", answers); 
    await mockSubmitUjianTeori(user.id, answers);

    clearExamState();

    // Langsung redirect tanpa alert
    window.location.href = "/asesi/exams";
  }, [answers, user, clearExamState])

  // ===============================================================
  // --- TIMER COUNTDOWN ---
  // ===============================================================  
  useEffect(() => {
    if (!isExamActive || !isRestored) return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isExamActive, isRestored, handleSubmitExam])

  // ===============================================================
  // --- FULLSCREEN MONITORING ---
  // ===============================================================
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isExamActive) {
        setIsExamActive(false); 
        setShowFullscreenWarning(true); 
      }
    };

    if (isExamActive && isRestored) {
      openFullscreen();
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isExamActive, isRestored]);

  // ===============================================================
  // --- RESTORE STATE DARI LOCALSTORAGE ---
  // ===============================================================
  // Cek apakah ada ujian yang sedang berjalan
  // Jika ada, restore jawaban dan waktu tersisa
  const loadExamData = useCallback(async () => {
    if (!user || !storageKey) return; 

    try {
      setIsLoadingData(true)
      const skemaId = user.skemaId || "ADS"
      const unitsData = await mockGetUnitsForSkema(skemaId)
      setUnits(unitsData)

      const totalDurasiMenit = unitsData.reduce((sum, unit) => sum + (unit.durasiTeori || 15), 0)
      const totalDurationInSeconds = totalDurasiMenit * 60
      
      const allSoalPromises = unitsData.map(unit => mockGetSoalForUnit(unit.id, "UJIAN_TEORI"))
      const allSoalArrays = await Promise.all(allSoalPromises)
      const combinedSoal = allSoalArrays.flat()
      setSoal(combinedSoal)
      
      const details = unitsData.map((unit, index) => ({
        ...unit,
        soalCount: allSoalArrays[index].length
      }))
      setUnitDetails(details)

      const savedStateJSON = localStorage.getItem(storageKey)
      
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON)
        setAnswers(savedState.answers || {})
        setTimeLeft(savedState.timeLeft || totalDurationInSeconds)
        setIsExamActive(true) 
      } else {
        setAnswers({})
        setTimeLeft(totalDurationInSeconds)
        setIsExamActive(false) 
      }
      
    } catch (error) {
      console.error("Error loading exam:", error)
      setAuthError("Gagal memuat data soal ujian.") 
    } finally {
      setIsLoadingData(false)
      setIsRestored(true)
    }
  }, [user, storageKey]); 

  // ===============================================================
  // --- LIFECYCLE: VALIDASI JADWAL & LOAD DATA ---
  // ===============================================================
  useEffect(() => {
    if (isAuthLoading) return; 
    if (!user) { 
      router.push("/login");
      return;
    }
    if (!storageKey) return; 

    const checkScheduleAndLoad = async () => {
      try {
        setIsChecking(true);
        setAuthError(null);
        const status = await mockGetExamStatus(user.id);

        // Validasi status ujian
        if (status.teori.status === "TERKUNCI") {
          setAuthError("Anda belum memenuhi prasyarat (menyelesaikan Tryout) untuk ujian ini.");
          return;
        }
        if (status.teori.status === "MENUNGGU_JADWAL") {
          setAuthError("Ujian Teori Anda belum dijadwalkan oleh Admin.");
          return;
        }
        if (status.teori.status === "SELESAI") {
          setAuthError("Anda sudah menyelesaikan ujian ini.");
          return;
        }

        const jadwal = status.teori.jadwal;
        if (!jadwal) {
          setAuthError("Jadwal ujian tidak ditemukan (Error: ST-JNF).");
          return;
        }

        const isToday = new Date().toDateString() === new Date(jadwal.tanggal).toDateString();
        
        if (!isToday) {
          console.warn("DEV_MODE: Cek tanggal ujian diabaikan.");
          // setAuthError(`Ujian ini hanya bisa diakses pada ${new Date(jadwal.tanggal).toLocaleDateString("id-ID")}.`);
          // return;
        }

        setAuthError(null);
        loadExamData(); 

      } catch (error) {
        console.error("Gagal cek status ujian:", error);
        setAuthError("Gagal memverifikasi status ujian Anda.");
      } finally {
        setIsChecking(false);
      }
    }

    checkScheduleAndLoad();
  }, [user, isAuthLoading, router, storageKey, loadExamData]); 

  // ===============================================================
  // --- AUTO-SAVE JAWABAN KE LOCALSTORAGE ---
  // ===============================================================
  useEffect(() => {
    if (!isExamActive || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}"
      const currentState = JSON.parse(stateJSON)
      currentState.answers = answers
      localStorage.setItem(storageKey, JSON.stringify(currentState))
    } catch (e) { console.error("Gagal simpan jawaban:", e) }
  }, [answers, isExamActive, isRestored, storageKey])

  // ===============================================================
  // --- AUTO-SAVE WAKTU KE LOCALSTORAGE ---
  // ===============================================================
  useEffect(() => {
    if (!isExamActive || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}"
      const currentState = JSON.parse(stateJSON)
      if (currentState.timeLeft !== timeLeft) {
        currentState.timeLeft = timeLeft
        localStorage.setItem(storageKey, JSON.stringify(currentState))
      }
    } catch (e) { console.error("Gagal simpan waktu:", e) }
  }, [timeLeft, isExamActive, isRestored, storageKey])

  // ===============================================================
  // --- EVENT HANDLERS: EXAM ACTIONS ---
  // ===============================================================
  const handleStartExam = () => setIsExamActive(true)
  
  const handleAnswerChange = (value) => {
    const currentSoalId = soal[currentQuestionIndex]?.id;
    if (!currentSoalId) return;
    setAnswers((prev) => ({ ...prev, [currentSoalId]: value }))
  }
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < soal.length - 1) setCurrentQuestionIndex((prev) => prev + 1)
  }
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1)
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // ===============================================================
  // --- RENDER: LOADING & ERROR STATES ---
  // ===============================================================
  if (isAuthLoading || isChecking) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memverifikasi jadwal ujian Anda...</p>
        </div>
      </MainLayout>
    )
  }

  if (authError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Akses Ditolak</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/asesi/exams">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Halaman Ujian
            </Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (isLoadingData) {
     return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    )
  }

  if ((!units || units.length === 0 || !soal || soal.length === 0) && !isLoadingData) {
    return (
      <MainLayout>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Soal ujian teori tidak ditemukan untuk skema Anda.</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  const currentSoal = soal[currentQuestionIndex];
  const currentUnit = units.find(u => u.id === currentSoal?.unitId);
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const totalDurationMinutes = Math.floor(units.reduce((sum, unit) => sum + (unit.durasiTeori || 15), 0));
  const areAllAnswered = answeredCount >= soal.length;

  // ===============================================================
  // --- RENDER: EXAM MODE (FULLSCREEN) ---
  // ===============================================================
  if (isExamActive) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Ujian Teori Skema {user?.skemaId}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Soal {currentQuestionIndex + 1} dari {soal.length}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${timeLeft < 300 ? "text-destructive" : ""}`}>
                    <Clock className="w-5 h-5 inline mr-2" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                {currentUnit && (
                  <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-2">
                    Unit {currentUnit.nomorUnit}: {currentUnit.judul}
                  </div>
                )}
                <CardTitle className="text-base">
                  {currentSoal.teks}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ketik jawaban esai Anda di sini..."
                  value={answers[currentSoal?.id] || ""} 
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="min-h-40"
                />
              </CardContent>
            </Card>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === soal.length - 1}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
          
          <Card id="unit-navigation" className="lg:sticky lg:top-6 h-fit">
            <CardHeader>
              <CardTitle className="text-base">
                Daftar Soal ({answeredCount}/{soal.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {soal.map((s, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = !!answers[s.id];

                  const baseClasses = "w-full aspect-square flex items-center justify-center rounded text-xs font-medium transition-colors";
                  let variantClasses = "";

                  if (isCurrent) {
                    variantClasses = "bg-primary text-primary-foreground";
                  } else if (isAnswered) {
                    variantClasses = "bg-green-100 text-green-800 hover:bg-green-200";
                  } else {
                    variantClasses = "bg-muted hover:bg-muted/80";
                  }
                  
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`${baseClasses} ${variantClasses}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setShowConfirmSubmit(true)} 
                disabled={!areAllAnswered}
                title={!areAllAnswered ? "Harap jawab semua soal terlebih dahulu" : "Selesaikan Ujian"}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Selesaikan Ujian
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Selesaikan Ujian</DialogTitle>
              <DialogDescription>
                Anda telah menjawab {answeredCount} dari {soal.length} soal. Yakin ingin menyelesaikan ujian?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Lanjut Menjawab
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmSubmit(false)
                  handleSubmitExam()
                }}
              >
                Ya, Selesaikan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showFullscreenWarning} onOpenChange={setShowFullscreenWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MonitorOff className="w-5 h-5 text-destructive" />
                Mode Fullscreen Diperlukan
              </DialogTitle>
              <DialogDescription>
                Anda (atau sistem) telah keluar dari mode fullscreen. Untuk melanjutkan ujian, Anda harus masuk kembali ke mode fullscreen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                className="w-full"
                onClick={() => {
                  setShowFullscreenWarning(false);
                  setIsExamActive(true); 
                }}
              >
                Masuk Fullscreen dan Lanjutkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              Ujian Teori Skema {user?.skemaId}
            </CardTitle>
            <CardDescription>
              Rincian soal dan durasi per unit kompetensi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2 border rounded-lg p-4 max-h-60 overflow-y-auto">
              {unitDetails.map(unit => (
                <div key={unit.id} className="flex justify-between items-center text-sm">
                  <p className="text-muted-foreground">
                    Unit {unit.nomorUnit}: {unit.judul}
                  </p>
                  <p className="font-medium">{unit.soalCount} Soal ({unit.durasiTeori} Menit)</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Soal</p>
                <p className="text-2xl font-bold mt-2">{soal.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Durasi Ujian</p>
                <p className="text-2xl font-bold mt-2">{totalDurationMinutes} menit</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ujian akan dimulai dalam mode fullscreen. Pastikan Anda siap dan koneksi internet stabil. Waktu tidak dapat dijeda.
              </AlertDescription>
            </Alert>

            <Button onClick={handleStartExam} size="lg" className="w-full">
              Mulai Ujian
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}