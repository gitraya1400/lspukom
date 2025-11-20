// frontend-lms-v3-master/app/admin/timeline/page.jsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarIcon,
  PlusCircle,
  AlertCircle,
  Clock,
  Users,
  Video,
  Info,
  UserCheck,
  Edit2,
  UserIcon,
  Trash2,
} from "lucide-react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockGetSesiUjianOffline,
  mockCreateSesiUjianOffline,
  mockGetAllSkema,
  mockGetLinimasa,
  mockCreateLinimasa,
  mockGetAsesorUsers,
  mockUpdateLinimasa,
  mockDeleteLinimasa,
  mockUpdateSesiUjianOffline,
  mockDeleteSesiUjianOffline,
  mockGetAsesiUsers,
} from "@/lib/api-mock";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// helper validasi waktu (HH:MM)
function isValidTimeFormat(timeString) {
  if (timeString === null || timeString === undefined) return false;
  const s = String(timeString).trim();
  if (s === "" || s === "Sepanjang hari" || s === "Waktu Menyusul") return true;
  // 24-hour HH:MM
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);
}

// Helper function untuk validasi waktu
const validateDateTime = (selectedDate, selectedTime, isToday) => {
  const now = new Date();
  
  if (isToday && selectedTime && selectedTime !== "Sepanjang hari" && selectedTime !== "Waktu Menyusul") {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const selectedDateTime = new Date();
    selectedDateTime.setHours(hours, minutes, 0, 0);

    if (selectedDateTime <= now) {
      return "Waktu harus lebih dari waktu saat ini untuk tanggal hari ini.";
    }
  }
  
  return null;
};

// --- HELPER BARU: Mengubah Date/ISO String menjadi string YYYY-MM-DD untuk input date ---
const dateToInputString = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
};

const EventTag = ({ event }) => {
  let Icon = Info;
  let colors = "bg-blue-500 text-white";
  let label = event.type || "Info";

  switch (event.type) {
    case "announcement":
      Icon = AlertCircle;
      colors = "bg-yellow-500 text-white";
      label = "Info";
      break;
    case "exam":
      Icon = UserCheck;
      colors = "bg-purple-600 text-white";
      label = "Ujian";
      break;
    case "event":
      Icon = Video;
      colors = "bg-blue-500 text-white";
      label = "Sesi";
      break;
    default:
      Icon = Info;
      break;
  }

  const titleWord =
    event.title
      .split(" ")
      .find((word) => word.length > 2 && !word.startsWith("[")) || label;

  return (
    <div className={cn("event-tag", colors)}>
      <Icon className="w-3 h-3" />
      <span className="truncate">
        {titleWord.length > 10 ? label : titleWord}
      </span>
    </div>
  );
};

const CustomDayButton = ({ linimasa = [], ...props }) => {
  const day = props.day;
  const eventsForDay = useMemo(() => {
    if (!Array.isArray(linimasa)) {
      return [];
    }
    return linimasa.filter((event) => event.date === day.date.toDateString());
  }, [linimasa, day.date]);

  return (
    <CalendarDayButton {...props}>
      {props.children}
      {eventsForDay.length > 0 && (
        <div className="event-tag-container">
          {eventsForDay.slice(0, 2).map((event) => (
            <EventTag key={event.id} event={event} />
          ))}
          {eventsForDay.length > 2 && (
            <div className="event-tag-more">
              +{eventsForDay.length - 2} lagi
            </div>
          )}
        </div>
      )}
    </CalendarDayButton>
  );
};

function CreateLinimasaModal({ skemaOptions, asesorList, onEventCreated }) {
  const [open, setOpen] = useState(false);
  const [skemaId, setSkemaId] = useState("UMUM");
  const [tipe, setTipe] = useState("PEMBELAJARAN");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState(""); // <-- UBAH KE STRING
  const [waktu, setWaktu] = useState("");
  const [urlZoom, setUrlZoom] = useState("");
  const [pemateriAsesorId, setPemateriAsesorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk field validation
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validasi khusus untuk dropdown (Pemateri jika tipe PEMBELAJARAN)
    if (tipe === "PEMBELAJARAN" && !pemateriAsesorId) {
      setFieldErrors({
        pemateri: "Bidang Pemateri wajib dipilih."
      });
      return;
    }

    // Validasi Tanggal (Cek string kosong)
    if (!tanggal) {
      setFieldErrors({
        tanggal: "Tanggal harus diisi."
      });
      return;
    }

    const selectedDate = new Date(tanggal); // <-- Konversi dari string

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Cek Tanggal tidak boleh di masa lalu
    if (selectedDate < today) {
      setFieldErrors({
        tanggal: "Tanggal harus 17.07 atau setelahnya."
      });
      return;
    }

    // 2. Validasi Waktu (khusus untuk tipe PEMBELAJARAN)
    if (tipe === "PEMBELAJARAN") {
      if (!waktu) {
        setFieldErrors({
          waktu: "Waktu harus diisi."
        });
        return;
      }

      // Cek Format Waktu
      if (!isValidTimeFormat(waktu)) {
        setFieldErrors({
          waktu: "Format waktu tidak valid. Gunakan format HH:MM (contoh: 09:00 atau 14:30)"
        });
        return;
      }

      // Validasi waktu menggunakan fungsi baru
      const isToday = selectedDate.toDateString() === today.toDateString();
      const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
      if (timeValidationError) {
        setFieldErrors({
          waktu: timeValidationError
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const finalPemateriId =
        tipe === "PEMBELAJARAN" &&
        pemateriAsesorId !== "NONE" &&
        pemateriAsesorId !== ""
          ? pemateriAsesorId
          : "";

      const eventData = {
        skemaId,
        tipe,
        judul,
        deskripsi,
        tanggal: selectedDate, // <-- Kirim Date Object
        waktu: waktu || "Sepanjang hari",
        urlZoom: tipe === "PEMBELAJARAN" ? urlZoom : "",
        pemateriAsesorId: finalPemateriId,
      };
      const newEvent = await mockCreateLinimasa(eventData);
      onEventCreated(newEvent);

      // Reset form dan tutup modal
      setOpen(false);
      setSkemaId("UMUM");
      setTipe("PEMBELAJARAN");
      setJudul("");
      setDeskripsi("");
      setTanggal(""); // <-- Reset ke string kosong
      setWaktu("");
      setUrlZoom("");
      setPemateriAsesorId("");
      setFieldErrors({});
    } catch (err) {
      setError(err.message || "Gagal membuat kegiatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk mendapatkan tanggal minimum (hari ini)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Reset errors ketika modal dibuka/ditutup
  useEffect(() => {
    if (!open) {
      setFieldErrors({});
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Buat Kegiatan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buat Kegiatan Linimasa</DialogTitle>
          <DialogDescription>
            Buat jadwal non-ujian (Sesi Zoom, Pengumuman, dll) untuk Asesi.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          id="linimasa-form"
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
        >
          <div className="space-y-2">
            <Label htmlFor="judul-kegiatan">Judul Kegiatan *</Label>
            <Input
              id="judul-kegiatan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Sosialisasi Skema ADS"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi-kegiatan">Deskripsi *</Label>
            <Textarea
              id="deskripsi-kegiatan"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi singkat kegiatan..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipe-kegiatan">Tipe Kegiatan *</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger id="tipe-kegiatan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEMBELAJARAN">
                    Sesi Pembelajaran (Zoom)
                  </SelectItem>
                  <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skema-kegiatan">Untuk Skema</Label>
              <Select value={skemaId} onValueChange={setSkemaId}>
                <SelectTrigger id="skema-kegiatan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UMUM">Semua Skema (Umum)</SelectItem>
                  {skemaOptions.map((skema) => (
                    <SelectItem key={skema.id} value={skema.id}>
                      {skema.judul}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal-kegiatan">Tanggal *</Label>
              <Input
                id="tanggal-kegiatan"
                type="date"
                value={tanggal} // <-- BIND KE STRING STATE
                onChange={(e) => {
                  setTanggal(e.target.value); // <-- SIMPAN STRING MENTAH
                  setFieldErrors(prev => ({...prev, tanggal: undefined}));
                }}
                min={getMinDate()}
                required
              />
              {fieldErrors.tanggal && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.tanggal}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="waktu-kegiatan">
                Waktu (WIB) {tipe === "PEMBELAJARAN" && "*"}
              </Label>
              <Input
                id="waktu-kegiatan"
                type="time"
                value={waktu}
                onChange={(e) => {
                  setWaktu(e.target.value);
                  setFieldErrors(prev => ({...prev, waktu: undefined}));
                }}
                placeholder="Contoh: 09:00"
                required={tipe === "PEMBELAJARAN"}
              />
              {fieldErrors.waktu && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.waktu}
                </p>
              )}
            </div>
          </div>
          {tipe === "PEMBELAJARAN" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url-zoom">URL Zoom *</Label>
                <Input
                  id="url-zoom"
                  value={urlZoom}
                  onChange={(e) => setUrlZoom(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemateri-asesor">Pemateri *</Label>
                <Select
                  value={pemateriAsesorId}
                  onValueChange={(value) => {
                    setPemateriAsesorId(value);
                    setFieldErrors(prev => ({...prev, pemateri: undefined}));
                  }}
                >
                  <SelectTrigger 
                    id="pemateri-asesor" 
                    className={fieldErrors.pemateri ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="--- Pilih Pemateri ---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">--- Tidak Ditugaskan ---</SelectItem>
                    {asesorList.map((asesor) => (
                      <SelectItem key={asesor.id} value={asesor.id}>
                        {asesor.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.pemateri && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.pemateri}
                  </p>
                )}
              </div>
            </>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button type="submit" form="linimasa-form" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateSesiModal({ skemaOptions, onSesiCreated, allAsesi = [] }) {
  const [open, setOpen] = useState(false);
  const [skemaId, setSkemaId] = useState("");
  const [tipeUjian, setTipeUjian] = useState("");
  const [kelas, setKelas] = useState("");
  const [tanggal, setTanggal] = useState(""); // <-- UBAH KE STRING
  const [waktu, setWaktu] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [kapasitas, setKapasitas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk field validation
  const [fieldErrors, setFieldErrors] = useState({});

  // Daftar kelas dinamis berdasarkan skema yang dipilih
  const kelasList = useMemo(() => {
    if (!skemaId) return [];
    const asesiInSkema = allAsesi.filter((a) => a.skemaId === skemaId);
    const kelasSet = new Set(asesiInSkema.map((a) => a.kelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [allAsesi, skemaId]);

  // Reset pilihan kelas jika skema berubah
  useEffect(() => {
    setKelas("");
  }, [skemaId]);

  // Reset errors ketika modal dibuka/ditutup
  useEffect(() => {
    if (!open) {
      setFieldErrors({});
      setError(null);
    }
  }, [open]);

  // Fungsi untuk mendapatkan tanggal minimum (hari ini)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validasi field dropdown
    const missingDropdowns = [];
    if (!skemaId) missingDropdowns.push("Skema");
    if (!tipeUjian) missingDropdowns.push("Tipe Sesi Ujian");
    if (!kelas) missingDropdowns.push("Kelas");

    if (missingDropdowns.length > 0) {
      if (missingDropdowns.includes("Skema")) {
        setFieldErrors({ skema: "Bidang Skema wajib dipilih." });
      }
      if (missingDropdowns.includes("Tipe Sesi Ujian")) {
        setFieldErrors({ tipeUjian: "Bidang Tipe Sesi Ujian wajib dipilih." });
      }
      if (missingDropdowns.includes("Kelas")) {
        setFieldErrors({ kelas: "Bidang Kelas wajib dipilih." });
      }
      return;
    }

    // Validasi Tanggal (Cek string kosong)
    if (!tanggal) {
      setFieldErrors({ tanggal: "Tanggal harus diisi." });
      return;
    }

    const selectedDate = new Date(tanggal); // <-- Konversi dari string

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Cek Tanggal tidak boleh di masa lalu
    if (selectedDate < today) {
      setFieldErrors({ 
        tanggal: "Tanggal harus 17.07 atau setelahnya." 
      });
      return;
    }

    // 2. Validasi Waktu
    if (!waktu) {
      setFieldErrors({ waktu: "Waktu harus diisi." });
      return;
    }

    // Cek Format Waktu
    if (!isValidTimeFormat(waktu)) {
      setFieldErrors({ 
        waktu: "Format waktu tidak valid. Gunakan format HH:MM (contoh: 09:00 atau 14:30)" 
      });
      return;
    }

    // 3. Validasi Waktu menggunakan fungsi baru
    const isToday = selectedDate.toDateString() === today.toDateString();
    const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
    if (timeValidationError) {
      setFieldErrors({ waktu: timeValidationError });
      return;
    }

    setIsSubmitting(true);
    try {
      const sesiData = {
        skemaId,
        tipeUjian,
        kelas,
        tanggal: selectedDate, // <-- Kirim Date Object
        waktu,
        ruangan,
        kapasitas: Number.parseInt(kapasitas),
      };
      const newSesi = await mockCreateSesiUjianOffline(sesiData);
      onSesiCreated(newSesi);

      setOpen(false);
      setSkemaId("");
      setTipeUjian("");
      setKelas("");
      setTanggal(""); // <-- Reset ke string kosong
      setWaktu("");
      setRuangan("");
      setKapasitas("");
      setFieldErrors({});
    } catch (err) {
      setError(err.message || "Gagal membuat sesi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserCheck className="w-4 h-4 mr-2" />
          Buat Sesi Ujian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buat Sesi Ujian Offline</DialogTitle>
          <DialogDescription>
            Buat jadwal untuk ujian tatap muka (Ujian Teori / Unjuk Diri).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skema-sesi">Skema *</Label>
            <Select 
              value={skemaId} 
              onValueChange={(value) => {
                setSkemaId(value);
                setFieldErrors(prev => ({...prev, skema: undefined}));
              }} 
              required
            >
              <SelectTrigger 
                id="skema-sesi"
                className={fieldErrors.skema ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih skema" />
              </SelectTrigger>
              <SelectContent>
                {skemaOptions.map((skema) => (
                  <SelectItem key={skema.id} value={skema.id}>
                    {skema.judul}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.skema && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.skema}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipe-sesi">Tipe Sesi Ujian *</Label>
              <Select 
                value={tipeUjian} 
                onValueChange={(value) => {
                  setTipeUjian(value);
                  setFieldErrors(prev => ({...prev, tipeUjian: undefined}));
                }} 
                required
              >
                <SelectTrigger 
                  id="tipe-sesi"
                  className={fieldErrors.tipeUjian ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih tipe sesi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEORI">Ujian Teori (Offline)</SelectItem>
                  <SelectItem value="UNJUK_DIRI">Ujian Unjuk Diri</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.tipeUjian && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.tipeUjian}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelas-sesi">Kelas *</Label>
              <Select
                value={kelas}
                onValueChange={(value) => {
                  setKelas(value);
                  setFieldErrors(prev => ({...prev, kelas: undefined}));
                }}
                required
                disabled={!skemaId || kelasList.length === 0}
              >
                <SelectTrigger 
                  id="edit-kelas-sesi"
                  className={fieldErrors.kelas ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !skemaId
                        ? "Pilih skema dulu"
                        : kelasList.length === 0
                        ? "Tidak ada kelas tersedia"
                        : "Pilih kelas"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.kelas && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.kelas}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal-sesi">Tanggal *</Label>
            <Input
              id="tanggal-sesi"
              type="date"
              value={tanggal} // <-- BIND KE STRING STATE
              onChange={(e) => {
                setTanggal(e.target.value); // <-- SIMPAN STRING MENTAH
                setFieldErrors(prev => ({...prev, tanggal: undefined}));
              }}
              min={getMinDate()}
              required
            />
            {fieldErrors.tanggal && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.tanggal}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waktu-sesi">Waktu (WIB) *</Label>
              <Input
                id="waktu-sesi"
                type="time"
                value={waktu}
                onChange={(e) => {
                  setWaktu(e.target.value);
                  setFieldErrors(prev => ({...prev, waktu: undefined}));
                }}
                placeholder="Contoh: 09:00"
                required
              />
              {fieldErrors.waktu && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.waktu}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitas-sesi">Kapasitas *</Label>
              <Input
                id="kapasitas-sesi"
                type="number"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                placeholder="Contoh: 35"
                min="1"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruangan-sesi">Ruangan *</Label>
            <Input
              id="ruangan-sesi"
              value={ruangan}
              onChange={(e) => setRuangan(e.target.value)}
              placeholder="Contoh: Laboratorium Komputer 1"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Sesi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const AdminEventCard = ({ event, onEdit, onDelete }) => {
  const router = useRouter();

  let Icon = Info;
  let colors = "bg-blue-50 border-blue-200 text-blue-800";
  const skemaLabel = event.skemaId === "UMUM" ? "Semua Skema" : event.skemaId;

  if (event.type === "announcement") {
    Icon = Info;
    colors = "bg-yellow-50 border-yellow-200 text-yellow-800";
  } else if (event.type === "event") {
    Icon = Video;
    colors = "bg-blue-50 border-blue-200 text-blue-800";
  } else if (event.type === "exam") {
    Icon = UserCheck;
    colors = "bg-purple-50 border-purple-200 text-purple-800";
  }

  return (
    <div
      className={`p-4 rounded-lg border ${colors} flex flex-col gap-4 w-full`}
    >
      <div className="flex items-start gap-4 w-full">
        <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors} border border-current whitespace-nowrap`}
          >
            {skemaLabel}
          </span>
          {event.type === "exam" && event.kelas && (
            <span
              className={`ml-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors} border border-current whitespace-nowrap`}
            >
              {event.kelas}
            </span>
          )}
          <h4 className="font-semibold mt-1 break-words line-clamp-2">
            {event.title}
          </h4>
          <p className="text-sm break-words line-clamp-3">
            {event.description}
          </p>

          {event.pemateriNama && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-700">
              <UserIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              Pemateri:{" "}
              <span className="font-medium">{event.pemateriNama}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {event.time}
            </span>
            {event.url && (
              <Button
                size="sm"
                variant="link"
                asChild
                className="p-0 h-auto flex-shrink-0"
              >
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  Link Zoom
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 w-full">
        {event.type === "exam" && (
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={() => router.push(`/admin/offline-exam/${event.id}`)}
          >
            <Users className="w-4 h-4 mr-2" />
            Atur Peserta
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-600"
          onClick={onEdit}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus
        </Button>
      </div>
    </div>
  );
};

function EditLinimasaModal({
  event,
  skemaOptions,
  asesorList,
  open,
  onOpenChange,
  onEventUpdated,
}) {
  const [tipe, setTipe] = useState(event?.tipe || "PEMBELAJARAN");
  const [judul, setJudul] = useState(event?.judul || "");
  const [deskripsi, setDeskripsi] = useState(event?.deskripsi || "");
  const [tanggal, setTanggal] = useState(""); // <-- UBAH KE STRING
  const [waktu, setWaktu] = useState(event?.waktu || "");
  const [urlZoom, setUrlZoom] = useState(event?.urlZoom || "");
  const [skemaId, setSkemaId] = useState(event?.skemaId || "UMUM");
  const [pemateriAsesorId, setPemateriAsesorId] = useState(
    event?.pemateriAsesorId || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk field validation
  const [fieldErrors, setFieldErrors] = useState({});

  // UPDATE STATE TANGGAL SAAT EVENT BERUBAH ATAU MODAL DIBUKA
  useEffect(() => {
    if (event) {
      setTipe(event.tipe || "PEMBELAJARAN");
      setJudul(event.judul || "");
      setDeskripsi(event.deskripsi || "");
      setTanggal(dateToInputString(event.tanggal)); // <-- KONVERSI DATE KE STRING
      setWaktu(event.waktu || "");
      setUrlZoom(event.urlZoom || "");
      setSkemaId(event.skemaId || "UMUM");
      setPemateriAsesorId(event.pemateriAsesorId || "");
    }
  }, [event]);

  // Reset errors ketika modal dibuka/ditutup
  useEffect(() => {
    if (!open) {
      setFieldErrors({});
      setError(null);
    }
  }, [open]);

  // Fungsi untuk mendapatkan tanggal minimum (hari ini)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validasi Pemateri untuk tipe PEMBELAJARAN
    if (tipe === "PEMBELAJARAN" && !pemateriAsesorId) {
      setFieldErrors({
        pemateri: "Bidang Pemateri wajib dipilih."
      });
      return;
    }

    // Validasi field wajib dasar
    const missingFields = [];
    if (!judul) missingFields.push("Judul");
    if (!deskripsi) missingFields.push("Deskripsi");
    if (!tanggal) missingFields.push("Tanggal"); // <-- Cek string kosong

    // Validasi tambahan untuk Sesi Pembelajaran
    if (tipe === "PEMBELAJARAN") {
      if (!waktu) missingFields.push("Waktu");
      if (!urlZoom) missingFields.push("URL Zoom");
    }

    if (missingFields.length > 0) {
      setFieldErrors({ 
        general: `Field berikut wajib diisi: ${missingFields.join(", ")}` 
      });
      return;
    }
    
    const selectedDate = new Date(tanggal); // <-- Konversi dari string

    if (waktu && waktu !== "Sepanjang hari" && !isValidTimeFormat(waktu)) {
      setFieldErrors({
        waktu: "Format waktu tidak valid. Gunakan format HH:MM (contoh: 09:00 atau 14:30)"
      });
      return;
    }

    // Validasi tanggal dan waktu
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Cek Tanggal tidak boleh di masa lalu
    if (selectedDate < today) {
      setFieldErrors({
        tanggal: "Tanggal harus 17.07 atau setelahnya."
      });
      return;
    }

    // Validasi Waktu untuk Sesi Pembelajaran
    if (tipe === "PEMBELAJARAN" && waktu && waktu !== "Sepanjang hari") {
      const isToday = selectedDate.toDateString() === today.toDateString();
      const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
      if (timeValidationError) {
        setFieldErrors({
          waktu: timeValidationError
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const finalPemateriId =
        tipe === "PEMBELAJARAN" &&
        pemateriAsesorId !== "NONE" &&
        pemateriAsesorId !== ""
          ? pemateriAsesorId
          : "";

      const eventData = {
        tipe,
        judul,
        deskripsi,
        tanggal: new Date(tanggal), // <-- Kirim Date Object
        waktu: waktu || "Sepanjang hari",
        urlZoom: tipe === "PEMBELAJARAN" ? urlZoom : "",
        skemaId,
        pemateriAsesorId: finalPemateriId,
      };

      console.log(
        "[EditLinimasaModal] submitting update:",
        event?.id,
        eventData
      );
      const updated = await mockUpdateLinimasa(event.id, eventData);
      console.log("[EditLinimasaModal] update response:", updated);

      // Panggil callback untuk update parent terlebih dahulu
      if (typeof onEventUpdated === "function") {
        await onEventUpdated(updated);
      }

      // Tutup modal setelah berhasil
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating linimasa:", err);
      setError(err.message || "Gagal memperbarui kegiatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form ketika modal ditutup
  useEffect(() => {
    if (!open) {
      setError(null);
      setIsSubmitting(false);
      setFieldErrors({});
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Kegiatan Linimasa</DialogTitle>
          <DialogDescription>
            Perbarui jadwal kegiatan untuk Asesi.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-judul-kegiatan">Judul Kegiatan *</Label>
            <Input
              id="edit-judul-kegiatan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Sosialisasi Skema ADS"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-deskripsi-kegiatan">Deskripsi *</Label>
            <Textarea
              id="edit-deskripsi-kegiatan"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi singkat kegiatan..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tipe-kegiatan">Tipe Kegiatan *</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger id="edit-tipe-kegiatan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEMBELAJARAN">
                    Sesi Pembelajaran (Zoom)
                  </SelectItem>
                  <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-skema-kegiatan">Untuk Skema</Label>
              <Select value={skemaId} onValueChange={setSkemaId}>
                <SelectTrigger id="edit-skema-kegiatan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UMUM">Semua Skema (Umum)</SelectItem>
                  {skemaOptions.map((skema) => (
                    <SelectItem key={skema.id} value={skema.id}>
                      {skema.judul}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tanggal-kegiatan">Tanggal *</Label>
              <Input
                id="edit-tanggal-kegiatan"
                type="date"
                value={tanggal} // <-- BIND KE STRING STATE
                onChange={(e) => {
                  setTanggal(e.target.value); // <-- SIMPAN STRING MENTAH
                  setFieldErrors(prev => ({...prev, tanggal: undefined}));
                }}
                min={getMinDate()}
                required
              />
              {fieldErrors.tanggal && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.tanggal}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-waktu-kegiatan">
                Waktu (WIB) {tipe === "PEMBELAJARAN" && "*"}
              </Label>
              <Input
                id="edit-waktu-kegiatan"
                type="time"
                value={waktu}
                onChange={(e) => {
                  setWaktu(e.target.value);
                  setFieldErrors(prev => ({...prev, waktu: undefined}));
                }}
                placeholder="Contoh: 09:00"
                required={tipe === "PEMBELAJARAN"}
              />
              {fieldErrors.waktu && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.waktu}
                </p>
              )}
            </div>
          </div>
          {tipe === "PEMBELAJARAN" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-url-zoom">URL Zoom *</Label>
                <Input
                  id="edit-url-zoom"
                  value={urlZoom}
                  onChange={(e) => setUrlZoom(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pemateri-asesor">Pemateri *</Label>
                <Select
                  value={pemateriAsesorId}
                  onValueChange={(value) => {
                    setPemateriAsesorId(value);
                    setFieldErrors(prev => ({...prev, pemateri: undefined}));
                  }}
                >
                  <SelectTrigger 
                    id="edit-pemateri-asesor"
                    className={fieldErrors.pemateri ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="--- Pilih Pemateri ---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">--- Tidak Ditugaskan ---</SelectItem>
                    {asesorList.map((asesor) => (
                      <SelectItem key={asesor.id} value={asesor.id}>
                        {asesor.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.pemateri && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.pemateri}
                  </p>
                )}
              </div>
            </>
          )}
          {fieldErrors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validasi Gagal</AlertTitle>
              <AlertDescription>{fieldErrors.general}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSesiModal({
  event,
  skemaOptions,
  allAsesi = [],
  open,
  onOpenChange,
  onSesiUpdated,
}) {
  const [skemaId, setSkemaId] = useState(event?.skemaId || "");
  const [tipeUjian, setTipeUjian] = useState(event?.tipeUjian || "");
  const [kelas, setKelas] = useState(event?.kelas || "");
  const [tanggal, setTanggal] = useState(""); // <-- UBAH KE STRING
  const [waktu, setWaktu] = useState(event?.waktu || "");
  const [ruangan, setRuangan] = useState(event?.ruangan || "");
  const [kapasitas, setKapasitas] = useState(
    event?.kapasitas?.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk field validation
  const [fieldErrors, setFieldErrors] = useState({});

  // Daftar kelas dinamis berdasarkan skema yang dipilih
  const kelasList = useMemo(() => {
    if (!skemaId) return [];
    const asesiInSkema = allAsesi.filter((a) => a.skemaId === skemaId);
    const kelasSet = new Set(asesiInSkema.map((a) => a.kelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [allAsesi, skemaId]);

  // UPDATE STATE TANGGAL SAAT EVENT BERUBAH ATAU MODAL DIBUKA
  useEffect(() => {
    if (event && open) {
      setSkemaId(event.skemaId || "");
      setTipeUjian(event.tipeUjian || "");
      setKelas(event.kelas || "");
      setTanggal(dateToInputString(event.tanggal)); // <-- KONVERSI DATE KE STRING
      setWaktu(event.waktu || "");
      setRuangan(event.ruangan || "");
      setKapasitas(event.kapasitas?.toString() || "");
    }

    if (!open) {
      setError(null);
      setIsSubmitting(false);
      setFieldErrors({});
    }
  }, [event, open]);

  // Reset pilihan kelas jika skema berubah
  useEffect(() => {
    if (event && skemaId && skemaId !== event.skemaId) {
      setKelas("");
    }
  }, [skemaId, event]);

  // Fungsi untuk mendapatkan tanggal minimum (hari ini)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validasi field wajib
    const missingFields = [];
    if (!skemaId) missingFields.push("Skema");
    if (!tipeUjian) missingFields.push("Tipe Ujian");
    if (!kelas) missingFields.push("Kelas");
    if (!tanggal) missingFields.push("Tanggal"); // <-- Cek string kosong
    if (!waktu) missingFields.push("Waktu");
    if (!ruangan) missingFields.push("Ruangan");
    if (!kapasitas) missingFields.push("Kapasitas");

    if (missingFields.length > 0) {
      setFieldErrors({ 
        general: `Field berikut wajib diisi: ${missingFields.join(", ")}` 
      });
      return;
    }

    const selectedDate = new Date(tanggal); // <-- Konversi dari string

    if (!isValidTimeFormat(waktu)) {
      setFieldErrors({
        waktu: "Format waktu tidak valid. Gunakan format HH:MM (contoh: 09:00 atau 14:30)"
      });
      return;
    }

    // Validasi tanggal dan waktu
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Cek Tanggal tidak boleh di masa lalu
    if (selectedDate < today) {
      setFieldErrors({
        tanggal: "Tanggal harus 17.07 atau setelahnya."
      });
      return;
    }

    // 2. Validasi Waktu menggunakan fungsi baru
    const isToday = selectedDate.toDateString() === today.toDateString();
    const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
    if (timeValidationError) {
      setFieldErrors({
        waktu: timeValidationError
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const sesiData = {
        skemaId,
        tipeUjian,
        kelas,
        tanggal: new Date(tanggal), // <-- Kirim Date Object
        waktu,
        ruangan,
        kapasitas: Number.parseInt(kapasitas),
      };

      console.log("[EditSesiModal] submitting update:", event?.id, sesiData);
      const updated = await mockUpdateSesiUjianOffline(event.id, sesiData);
      console.log("[EditSesiModal] update response:", updated);

      // Panggil callback untuk update parent
      if (typeof onSesiUpdated === "function") {
        await onSesiUpdated(updated);
      }

      // Tutup modal setelah berhasil
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating sesi:", err);
      setError(err.message || "Gagal memperbarui sesi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Sesi Ujian</DialogTitle>
          <DialogDescription>
            Perbarui jadwal ujian offline untuk Asesi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-skema-sesi">Skema *</Label>
            <Select 
              value={skemaId} 
              onValueChange={(value) => {
                setSkemaId(value);
                setFieldErrors(prev => ({...prev, skema: undefined}));
              }} 
              required
            >
              <SelectTrigger 
                id="edit-skema-sesi"
                className={fieldErrors.skema ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih skema" />
              </SelectTrigger>
              <SelectContent>
                {skemaOptions.map((skema) => (
                  <SelectItem key={skema.id} value={skema.id}>
                    {skema.judul}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.skema && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.skema}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tipe-sesi">Tipe Sesi Ujian *</Label>
              <Select 
                value={tipeUjian} 
                onValueChange={(value) => {
                  setTipeUjian(value);
                  setFieldErrors(prev => ({...prev, tipeUjian: undefined}));
                }} 
                required
              >
                <SelectTrigger 
                  id="edit-tipe-sesi"
                  className={fieldErrors.tipeUjian ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih tipe sesi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEORI">Ujian Teori (Offline)</SelectItem>
                  <SelectItem value="UNJUK_DIRI">Ujian Unjuk Diri</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.tipeUjian && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.tipeUjian}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kelas-sesi">Kelas *</Label>
              <Select
                value={kelas}
                onValueChange={(value) => {
                  setKelas(value);
                  setFieldErrors(prev => ({...prev, kelas: undefined}));
                }}
                required
                disabled={!skemaId || kelasList.length === 0}
              >
                <SelectTrigger 
                  id="edit-kelas-sesi"
                  className={fieldErrors.kelas ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={!skemaId ? "Pilih skema dulu" : "Pilih kelas"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.kelas && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.kelas}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tanggal-sesi">Tanggal *</Label>
            <Input
              id="edit-tanggal-sesi"
              type="date"
              value={tanggal} // <-- BIND KE STRING STATE
              onChange={(e) => {
                setTanggal(e.target.value); // <-- SIMPAN STRING MENTAH
                setFieldErrors(prev => ({...prev, tanggal: undefined}));
              }}
              min={getMinDate()}
              required
            />
            {fieldErrors.tanggal && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.tanggal}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-waktu-sesi">Waktu (WIB) *</Label>
              <Input
                id="edit-waktu-sesi"
                type="time"
                value={waktu}
                onChange={(e) => {
                  setWaktu(e.target.value);
                  setFieldErrors(prev => ({...prev, waktu: undefined}));
                }}
                placeholder="Contoh: 09:00"
                required
              />
              {fieldErrors.waktu && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.waktu}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kapasitas-sesi">Kapasitas *</Label>
              <Input
                id="edit-kapasitas-sesi"
                type="number"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                placeholder="Contoh: 35"
                min="1"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-ruangan-sesi">Ruangan *</Label>
            <Input
              id="edit-ruangan-sesi"
              value={ruangan}
              onChange={(e) => setRuangan(e.target.value)}
              placeholder="Contoh: Laboratorium Komputer 1"
              required
            />
          </div>
          {fieldErrors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validasi Gagal</AlertTitle>
              <AlertDescription>{fieldErrors.general}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TimelinePage() {
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skemaOptions, setSkemaOptions] = useState([]);
  const [asesorList, setAsesorList] = useState([]);
  const [error, setError] = useState(null);
  const [allAsesi, setAllAsesi] = useState([]);

  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editSesiOpen, setEditSesiOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [skemaData, linimasaData, sesiUjianData, allAsesorData, asesiData] =
        await Promise.all([
          mockGetAllSkema(),
          mockGetLinimasa("ALL"),
          mockGetSesiUjianOffline("ALL"),
          mockGetAsesorUsers(),
          mockGetAsesiUsers(),
        ]);

      setSkemaOptions(skemaData);
      setAsesorList(allAsesorData);
      setAllAsesi(asesiData);

      const asesorNameMap = new Map(allAsesorData.map((a) => [a.id, a.nama]));

      const formattedLinimasa = linimasaData.map((item) => {
        const tanggalDate =
          item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
        return {
          id: item.id,
          date: tanggalDate.toDateString(),
          title: `[${item.tipe}] ${item.judul}`,
          time: item.waktu || "Sepanjang hari",
          description: item.deskripsi,
          url: item.urlZoom,
          type: item.tipe === "PENGUMUMAN" ? "announcement" : "event",
          skemaId: item.skemaId || "UMUM",
          pemateriAsesorId: item.pemateriAsesorId,
          pemateriNama: asesorNameMap.get(item.pemateriAsesorId) || null,
          originalData: item,
          judul: item.judul,
          deskripsi: item.deskripsi,
          tipe: item.tipe,
          tanggal: item.tanggal,
          waktu: item.waktu,
          urlZoom: item.urlZoom,
        };
      });

      const formattedSesiUjian = sesiUjianData.map((item) => {
        const tanggalDate =
          item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
        return {
          id: item.id,
          date: tanggalDate.toDateString(),
          title: `[UJIAN] ${
            item.tipeUjian === "TEORI" ? "Ujian Teori" : "Unjuk Diri"
          }`,
          time: item.waktu || "Waktu Menyusul",
          description: `Lokasi: ${item.ruangan} (Kapasitas: ${item.kapasitas})`,
          url: null,
          type: "exam",
          skemaId: item.skemaId,
          kelas: item.kelas || "Kelas Belum Diatur",
          pemateriNama: null,
          originalData: item,
          tipeUjian: item.tipeUjian,
          tanggal: item.tanggal,
          waktu: item.waktu,
          ruangan: item.ruangan,
          kapasitas: item.kapasitas,
          kelas: item.kelas,
        };
      });

      const combinedEvents = [...formattedLinimasa, ...formattedSesiUjian];
      combinedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

      setAllEvents(combinedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  const onDataChanged = () => {
    loadData();
  };

  const handleEditEvent = (event) => {
    setSelectedEventForEdit(event);
    if (event.type === "exam") {
      setEditEventOpen(false);
      setEditSesiOpen(true);
    } else {
      setEditSesiOpen(false);
      setEditEventOpen(true);
    }
  };

  const handleDeleteEvent = (event) => {
    setDeleteTarget(event);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "exam") {
        await mockDeleteSesiUjianOffline(deleteTarget.originalData.id);
      } else {
        await mockDeleteLinimasa(deleteTarget.originalData.id);
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.message || "Gagal menghapus kegiatan.");
    }
  };

  const selectedDateStr = date
    ? date.toDateString()
    : new Date().toDateString();
  const selectedEvents = allEvents
    .filter((event) => event.date === selectedDateStr)
    .sort((a, b) => {
      const parseTime = (timeStr) => {
        if (timeStr === "Sepanjang hari") return 0;
        if (timeStr === "Waktu Menyusul") return 1;

        const parts = String(timeStr).split(":");
        if (parts.length === 2) {
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          if (!isNaN(hours) && !isNaN(minutes)) {
            return hours * 60 + minutes;
          }
        }
        return 9999;
      };

      const timeA = parseTime(a.time);
      const timeB = parseTime(b.time);

      return timeA - timeB;
    });

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Linimasa</h1>
            <p className="text-muted-foreground mt-1">
              Atur semua jadwal kegiatan, pengumuman, dan sesi ujian.
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <CreateLinimasaModal
              skemaOptions={skemaOptions}
              asesorList={asesorList}
              onEventCreated={onDataChanged}
            />
            <CreateSesiModal
              skemaOptions={skemaOptions}
              onSesiCreated={onDataChanged}
              allAsesi={allAsesi}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 h-fit">
            <CardContent className="p-0">
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full p-4"
                  components={{
                    DayButton: (props) => (
                      <CustomDayButton {...props} linimasa={allEvents} />
                    ),
                  }}
                />
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold">
              Kegiatan{" "}
              {new Date(selectedDateStr).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : selectedEvents.length === 0 ? (
              <Alert>
                <CalendarIcon className="h-4 w-4" />
                <AlertDescription>
                  Tidak ada kegiatan yang dijadwalkan pada tanggal ini.
                </AlertDescription>
              </Alert>
            ) : (
              selectedEvents.map((event) => (
                <AdminEventCard
                  key={event.id}
                  event={event}
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => handleDeleteEvent(event)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedEventForEdit && selectedEventForEdit.type !== "exam" && (
        <EditLinimasaModal
          event={selectedEventForEdit.originalData}
          skemaOptions={skemaOptions}
          asesorList={asesorList}
          open={editEventOpen}
          onOpenChange={(open) => {
            setEditEventOpen(open);
            setEditSesiOpen(false);
            if (!open) setSelectedEventForEdit(null);
          }}
          onEventUpdated={async () => {
            await loadData();
            setSelectedEventForEdit(null);
          }}
        />
      )}

      {selectedEventForEdit && selectedEventForEdit.type === "exam" && (
        <EditSesiModal
          event={selectedEventForEdit.originalData}
          skemaOptions={skemaOptions}
          allAsesi={allAsesi}
          open={editSesiOpen}
          onOpenChange={(open) => {
            setEditSesiOpen(open);
            setEditEventOpen(false);
            if (!open) setSelectedEventForEdit(null);
          }}
          onSesiUpdated={async () => {
            await loadData();
            setSelectedEventForEdit(null);
          }}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kegiatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kegiatan "{deleteTarget?.title}
              "? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}