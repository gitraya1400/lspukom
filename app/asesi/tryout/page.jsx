"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
// 1. Import komponen Textarea
import { Textarea } from "@/components/ui/textarea";
import { 
  mockGetUnitsForSkema, 
  mockGetSoalTryoutGabungan, 
  mockSubmitTryout, 
  mockGetProgressAsesi 
} from "@/lib/api-mock";
import { 
  Lock, Play, Loader2, Check, Book, Clock, CheckCircle2, MonitorOff, AlertCircle, PlayCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTime } from "@/lib/utils"; 

const TRYOUT_DURATION_SECONDS = 90 * 60; 

const getTryoutStorageKey = (userId, skemaId) => {
  if (!userId || !skemaId) return null;
  return `tryout_progress_${userId}_${skemaId}`;
};

export default function TryoutPage() {
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [units, setUnits] = useState([]);
  const [soalList, setSoalList] = useState([]);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isRestored, setIsRestored] = useState(false); 

  const [isStarted, setIsStarted] = useState(false);
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(TRYOUT_DURATION_SECONDS);
  
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  const storageKey = useMemo(() => {
    return getTryoutStorageKey(user?.id, user?.skemaId);
  }, [user]);

  const canStartTryout = progress?.progressPembelajaran === 100;

  const clearTryoutState = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

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

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    
    setIsStarted(false); 
    setIsSubmitting(true);
    closeFullscreen();
    
    try {
      await mockSubmitTryout(user.id, answers);
      clearTryoutState(); 

      setProgress((prev) => ({ ...prev, tryoutSelesai: true }));
      setIsStarted(false); 
      setShowConfirmSubmit(false);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting tryout:", error);
      alert("Gagal menyimpan tryout. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, answers, clearTryoutState]);
  
  useEffect(() => {
    if (isAuthLoading) return; 
    if (!user) {
      router.push("/login");
      return;
    }
    if (!storageKey) return; 

    const loadPrerequisitesAndRestore = async () => {
      try {
        setLoading(true);
        const [progressData, unitsData, soalData] = await Promise.all([
          mockGetProgressAsesi(user.id),
          mockGetUnitsForSkema(user.skemaId),
          mockGetSoalTryoutGabungan(user.skemaId) 
        ]);
        
        setProgress(progressData);
        setUnits(unitsData);
        setSoalList(soalData);

        const savedStateJSON = localStorage.getItem(storageKey);
        if (savedStateJSON) {
          const savedState = JSON.parse(savedStateJSON);
          setAnswers(savedState.answers || {});
          setTimeLeft(savedState.timeLeft || TRYOUT_DURATION_SECONDS);
          setIsStarted(true); 
        } else {
          setAnswers({});
          setTimeLeft(TRYOUT_DURATION_SECONDS);
          setIsStarted(false); 
        }

      } catch (error) {
        console.error("Error loading prerequisites:", error);
      } finally {
        setLoading(false);
        setIsRestored(true); 
      }
    };

    loadPrerequisitesAndRestore();
  }, [user, isAuthLoading, router, storageKey]);

  useEffect(() => {
    if (!isStarted || !isRestored) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isRestored, handleSubmit]); 
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isStarted) {
        setIsStarted(false); 
        setShowFullscreenWarning(true); 
      }
    };

    if (isStarted && isRestored) {
      openFullscreen();
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isStarted, isRestored]);

  useEffect(() => {
    if (!isStarted || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}";
      const currentState = JSON.parse(stateJSON);
      currentState.answers = answers;
      localStorage.setItem(storageKey, JSON.stringify(currentState));
    } catch (e) { console.error("Gagal simpan jawaban tryout:", e) }
  }, [answers, isStarted, isRestored, storageKey]);

  useEffect(() => {
    if (!isStarted || !isRestored || !storageKey) return;
    try {
      const stateJSON = localStorage.getItem(storageKey) || "{}";
      const currentState = JSON.parse(stateJSON);
      if (currentState.timeLeft !== timeLeft) {
        currentState.timeLeft = timeLeft;
        localStorage.setItem(storageKey, JSON.stringify(currentState));
      }
    } catch (e) { console.error("Gagal simpan waktu tryout:", e) }
  }, [timeLeft, isStarted, isRestored, storageKey]);


  const handleStartTryout = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (soalId, value) => {
    setAnswers((prev) => ({ ...prev, [soalId]: value }));
  };
  
  const handleNextQuestion = () => {
    if (currentSoalIndex < soalList.length - 1) {
      setCurrentSoalIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentSoalIndex > 0) {
      setCurrentSoalIndex((prev) => prev - 1);
    }
  };

  const currentSoal = soalList[currentSoalIndex];
  
  if (loading || isAuthLoading || !progress) {
    return (
      <MainLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (isStarted) {
    if (!currentSoal) {
       return (
         <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
           <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>Soal tryout tidak dapat dimuat.</AlertDescription>
           </Alert>
         </div>
       )
    }
    
    const answeredCount = Object.values(answers).filter(Boolean).length;
    const areAllAnswered = answeredCount === soalList.length;

    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Tryout Skema {user?.skemaId}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Soal {currentSoalIndex + 1} dari {soalList.length}
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
                <CardTitle className="text-xl">
                  Soal {currentSoalIndex + 1}
                </CardTitle>
                <CardDescription className="pt-2 text-base text-gray-800">{currentSoal.teks}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 2. Ubah textarea standar menjadi komponen Textarea dengan tinggi min-h-40 (sama dengan ujian teori) */}
                <Textarea 
                  className="min-h-40" 
                  placeholder="Tulis jawaban esai Anda di sini..." 
                  value={answers[currentSoal.id] || ""} 
                  onChange={(e) => handleAnswerChange(currentSoal.id, e.target.value)} 
                />
              </CardContent>
            </Card>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion} 
                disabled={currentSoalIndex === 0}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={handleNextQuestion}
                disabled={currentSoalIndex === soalList.length - 1}
                className="flex-1"
              >
                Selanjutnya
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>Daftar Soal ({answeredCount}/{soalList.length})</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-7 gap-2">
                {soalList.map((soal, index) => {
                  const isCurrent = currentSoalIndex === index;
                  const isAnswered = !!answers[soal.id];

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
                      key={soal.id}
                      className={`${baseClasses} ${variantClasses}`}
                      onClick={() => setCurrentSoalIndex(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={isSubmitting || !areAllAnswered}
                  title={!areAllAnswered ? "Harap jawab semua soal terlebih dahulu" : "Selesaikan Tryout"}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Selesaikan Tryout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Selesaikan Tryout</DialogTitle>
              <DialogDescription>
                Anda telah menjawab {answeredCount} dari {soalList.length} soal. Yakin ingin menyelesaikan tryout?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Lanjut Menjawab
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmSubmit(false)
                  handleSubmit()
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Ya, Selesaikan"}
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
                Anda (atau sistem) telah keluar dari mode fullscreen. Untuk melanjutkan tryout, Anda harus masuk kembali ke mode fullscreen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                className="w-full"
                onClick={() => {
                  setShowFullscreenWarning(false);
                  setIsStarted(true); 
                }}
              >
                Masuk Fullscreen dan Lanjutkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Tryout Berhasil Diselesaikan!
              </DialogTitle>
              <DialogDescription>
                Selamat! Anda telah menyelesaikan tryout. Anda sekarang bisa melanjutkan ke Ujian Teori.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                className="w-full"
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push("/asesi/dashboard");
                }}
              >
                Oke
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Tryout</h1>
        <p className="text-muted-foreground">Selesaikan Tryout untuk membuka Ujian Teori</p>

        <div className="flex justify-center items-center pt-10">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tryout - Asesmen Mandiri</CardTitle>
              <CardDescription>Skema: {user?.skemaId}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!canStartTryout ? (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <Lock className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800 font-semibold">Tryout Terkunci</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Anda harus menyelesaikan 100% materi pembelajaran sebelum dapat memulai tryout. Progress Anda saat ini: <span className="font-bold">{progress?.progressPembelajaran || 0}%</span>
                  </AlertDescription>
                  <Button asChild variant="link" className="p-1 h-auto text-red-800 mt-3 mb-2 ml-26">
                    <Link href="/asesi/learning">Kembali ke Pembelajaran</Link>
                  </Button>
                </Alert>
              ) : progress.tryoutSelesai ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800 font-semibold">Tryout Selesai</AlertTitle>
                  
                  <AlertDescription className="text-green-700">
                    Anda telah menyelesaikan tryout. Anda sekarang dapat melanjutkan ke Ujian Teori.
                  </AlertDescription>
                 <div className="col-span-2 flex justify-start mt-4">
                    <Button 
                      asChild 
                      variant="default" 
                      size="sm" 
                    >
                      <Link href="/asesi/exams">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Lanjut ke Ujian
                      </Link>
                    </Button>
                  </div>
                  
                  
                </Alert>
              ) : (
                <>
                  <div className="text-center text-muted-foreground">Harap baca instruksi berikut sebelum memulai tryout:</div>

                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">
                        Total <span className="font-semibold">{soalList.length} soal</span> dari {units.length} unit kompetensi.
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Book className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">
                        Soal berupa <span className="font-semibold">esai</span>.
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800">
                        Total waktu pengerjaan <span className="font-semibold">{TRYOUT_DURATION_SECONDS / 60} menit</span> (timer akan berjalan).
                      </span>
                    </li>
                  </ul>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tryout akan dimulai dalam mode fullscreen. Pastikan Anda siap.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleStartTryout} disabled={loading} size="lg" className="w-full text-base h-11">
                    <Play className="w-5 h-5 mr-2" />
                    Mulai Tryout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}