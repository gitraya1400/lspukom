/**
 * Halaman Manajemen Linimasa & Jadwal (Admin)
 *
 * Halaman ini berfungsi untuk:
 * 1. Menampilkan kalender interaktif yang menggabungkan Linimasa (Kegiatan Umum) dan Sesi Ujian.
 * 2. Membuat, Mengedit, dan Menghapus Kegiatan Linimasa (Zoom, Pengumuman).
 * 3. Membuat, Mengedit, dan Menghapus Sesi Ujian Offline (Teori, Unjuk Diri).
 * 4. Validasi jadwal (tanggal tidak boleh lampau, format waktu valid).
 *
 * Komponen:
 * - TimelinePage (Main)
 * - CreateLinimasaModal / EditLinimasaModal
 * - CreateSesiModal / EditSesiModal
 * - AdminEventCard (List Item)
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, PlusCircle, AlertCircle, Clock, Users, Video, Info, 
  UserCheck, Edit2, UserIcon, Trash2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  mockGetSesiUjianOffline, mockCreateSesiUjianOffline, mockGetAllSkema,
  mockGetLinimasa, mockCreateLinimasa, mockGetAsesorUsers, mockUpdateLinimasa,
  mockDeleteLinimasa, mockUpdateSesiUjianOffline, mockDeleteSesiUjianOffline,
  mockGetAsesiUsers,
} from "@/lib/api-mock";

// --- Helper Functions ---

/**
 * Memvalidasi format waktu (HH:MM)
 */
function isValidTimeFormat(timeString) {
  if (timeString === null || timeString === undefined) return false;
  const s = String(timeString).trim();
  if (s === "" || s === "Sepanjang hari" || s === "Waktu Menyusul") return true;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);
}

/**
 * Memvalidasi logika tanggal dan waktu
 * Mencegah pemilihan waktu lampau pada hari ini.
 */
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

/**
 * Mengubah Date Object ke string YYYY-MM-DD untuk input type="date"
 */
const dateToInputString = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
};

// --- Sub-Components ---

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
  }

  const titleWord = event.title.split(" ").find((word) => word.length > 2 && !word.startsWith("[")) || label;

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
    if (!Array.isArray(linimasa)) return [];
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
    <div className={`p-4 rounded-lg border ${colors} flex flex-col gap-4 w-full`}>
      <div className="flex items-start gap-4 w-full">
        <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors} border border-current whitespace-nowrap`}>
            {skemaLabel}
          </span>
          {event.type === "exam" && event.kelas && (
            <span className={`ml-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors} border border-current whitespace-nowrap`}>
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
              Pemateri: <span className="font-medium">{event.pemateriNama}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {event.time}
            </span>
            {event.url && (
              <Button size="sm" variant="link" asChild className="p-0 h-auto flex-shrink-0">
                <a href={event.url} target="_blank" rel="noopener noreferrer">Link Zoom</a>
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
        
        <Button size="sm" variant="ghost" className="text-gray-600" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus
        </Button>
      </div>
    </div>
  );
};

// --- Modal Components ---

function CreateLinimasaModal({ skemaOptions, asesorList, onEventCreated }) {
  const [open, setOpen] = useState(false);
  const [skemaId, setSkemaId] = useState("UMUM");
  const [tipe, setTipe] = useState("PEMBELAJARAN");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState(""); 
  const [waktu, setWaktu] = useState("");
  const [urlZoom, setUrlZoom] = useState("");
  const [pemateriAsesorId, setPemateriAsesorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validasi Pemateri
    if (tipe === "PEMBELAJARAN" && !pemateriAsesorId) {
      setFieldErrors({ pemateri: "Bidang Pemateri wajib dipilih." });
      return;
    }
    
    // Validasi Tanggal
    if (!tanggal) {
      setFieldErrors({ tanggal: "Tanggal harus diisi." });
      return;
    }

    const selectedDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFieldErrors({ tanggal: "Tanggal harus hari ini atau setelahnya." });
      return;
    }

    // Validasi Wajib Isi Waktu untuk Pembelajaran
    if (tipe === "PEMBELAJARAN" && !waktu) {
      setFieldErrors({ waktu: "Waktu harus diisi." });
      return;
    }

    // Validasi Waktu (Berlaku untuk semua tipe jika waktu diisi)
    if (waktu && waktu !== "Sepanjang hari") {
        if (!isValidTimeFormat(waktu)) {
            setFieldErrors({ waktu: "Format waktu tidak valid (HH:MM)." });
            return;
        }

        const isToday = selectedDate.toDateString() === today.toDateString();
        const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
        if (timeValidationError) {
            setFieldErrors({ waktu: timeValidationError });
            return;
        }
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        skemaId,
        tipe,
        judul,
        deskripsi,
        tanggal: selectedDate,
        waktu: waktu || "Sepanjang hari",
        urlZoom: tipe === "PEMBELAJARAN" ? urlZoom : "",
        pemateriAsesorId: tipe === "PEMBELAJARAN" && pemateriAsesorId !== "NONE" ? pemateriAsesorId : "",
      };
      const newEvent = await mockCreateLinimasa(eventData);
      onEventCreated(newEvent);

      // Reset
      setOpen(false);
      setSkemaId("UMUM");
      setTipe("PEMBELAJARAN");
      setJudul("");
      setDeskripsi("");
      setTanggal("");
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

  // Reset errors saat modal ditutup
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
        <form id="linimasa-form" onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="judul-kegiatan">Judul Kegiatan *</Label>
            <Input id="judul-kegiatan" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Sosialisasi Skema ADS" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi-kegiatan">Deskripsi *</Label>
            <Textarea id="deskripsi-kegiatan" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat kegiatan..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipe-kegiatan">Tipe Kegiatan *</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger id="tipe-kegiatan"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEMBELAJARAN">Sesi Pembelajaran (Zoom)</SelectItem>
                  <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skema-kegiatan">Untuk Skema</Label>
              <Select value={skemaId} onValueChange={setSkemaId}>
                <SelectTrigger id="skema-kegiatan"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UMUM">Semua Skema (Umum)</SelectItem>
                  {skemaOptions.map((skema) => (
                    <SelectItem key={skema.id} value={skema.id}>{skema.judul}</SelectItem>
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
                value={tanggal} 
                onChange={(e) => {
                  setTanggal(e.target.value);
                  setFieldErrors(prev => ({...prev, tanggal: undefined}));
                }}
                min={new Date().toISOString().split("T")[0]}
                required 
              />
              {fieldErrors.tanggal && <p className="text-sm text-red-600">{fieldErrors.tanggal}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="waktu-kegiatan">Waktu (WIB) {tipe === "PEMBELAJARAN" && "*"}</Label>
              <Input 
                id="waktu-kegiatan" 
                type="time" 
                value={waktu} 
                onChange={(e) => {
                  setWaktu(e.target.value);
                  setFieldErrors(prev => ({...prev, waktu: undefined}));
                }}
                required={tipe === "PEMBELAJARAN"} 
              />
              {fieldErrors.waktu && <p className="text-sm text-red-600">{fieldErrors.waktu}</p>}
            </div>
          </div>
          {tipe === "PEMBELAJARAN" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url-zoom">URL Zoom *</Label>
                <Input id="url-zoom" value={urlZoom} onChange={(e) => setUrlZoom(e.target.value)} placeholder="https://zoom.us/j/..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemateri-asesor">Pemateri *</Label>
                <Select value={pemateriAsesorId} onValueChange={(value) => {
                    setPemateriAsesorId(value);
                    setFieldErrors(prev => ({...prev, pemateri: undefined}));
                  }}>
                  <SelectTrigger id="pemateri-asesor" className={fieldErrors.pemateri ? "border-red-500" : ""}><SelectValue placeholder="--- Pilih Pemateri ---" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">--- Tidak Ditugaskan ---</SelectItem>
                    {asesorList.map((asesor) => (
                      <SelectItem key={asesor.id} value={asesor.id}>{asesor.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.pemateri && <p className="text-sm text-red-600">{fieldErrors.pemateri}</p>}
              </div>
            </>
          )}
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button type="submit" form="linimasa-form" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}</Button>
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
  const [tanggal, setTanggal] = useState(""); 
  const [waktu, setWaktu] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [kapasitas, setKapasitas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const kelasList = useMemo(() => {
    if (!skemaId) return [];
    const asesiInSkema = allAsesi.filter((a) => a.skemaId === skemaId);
    const kelasSet = new Set(asesiInSkema.map((a) => a.kelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [allAsesi, skemaId]);

  useEffect(() => { setKelas(""); }, [skemaId]);
  useEffect(() => { if (!open) { setFieldErrors({}); setError(null); } }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!skemaId || !tipeUjian || !kelas || !tanggal || !waktu) {
      setFieldErrors({ general: "Mohon lengkapi semua field wajib (*)." });
      return;
    }

    const selectedDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFieldErrors({ tanggal: "Tanggal harus hari ini atau setelahnya." });
      return;
    }

    if (!isValidTimeFormat(waktu)) {
      setFieldErrors({ waktu: "Format waktu tidak valid." });
      return;
    }

    const isToday = selectedDate.toDateString() === today.toDateString();
    const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
    if (timeValidationError) {
      setFieldErrors({ waktu: timeValidationError });
      return;
    }

    setIsSubmitting(true);
    try {
      const sesiData = {
        skemaId, tipeUjian, kelas,
        tanggal: selectedDate,
        waktu, ruangan,
        kapasitas: Number.parseInt(kapasitas),
      };
      const newSesi = await mockCreateSesiUjianOffline(sesiData);
      onSesiCreated(newSesi);

      setOpen(false);
      setSkemaId(""); setTipeUjian(""); setKelas("");
      setTanggal(""); setWaktu(""); setRuangan(""); setKapasitas("");
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
          <UserCheck className="w-4 h-4 mr-2" /> Buat Sesi Ujian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buat Sesi Ujian Offline</DialogTitle>
          <DialogDescription>Buat jadwal untuk ujian tatap muka (Ujian Teori / Unjuk Diri).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Skema *</Label>
            <Select value={skemaId} onValueChange={setSkemaId} required>
              <SelectTrigger className={fieldErrors.general ? "border-red-500" : ""}><SelectValue placeholder="Pilih skema" /></SelectTrigger>
              <SelectContent>
                {skemaOptions.map((skema) => (<SelectItem key={skema.id} value={skema.id}>{skema.judul}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe Sesi Ujian *</Label>
              <Select value={tipeUjian} onValueChange={setTipeUjian} required>
                <SelectTrigger className={fieldErrors.general ? "border-red-500" : ""}><SelectValue placeholder="Pilih tipe sesi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEORI">Ujian Teori (Offline)</SelectItem>
                  <SelectItem value="UNJUK_DIRI">Ujian Unjuk Diri</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kelas *</Label>
              <Select value={kelas} onValueChange={setKelas} required disabled={!skemaId || kelasList.length === 0}>
                <SelectTrigger className={fieldErrors.general ? "border-red-500" : ""}><SelectValue placeholder={!skemaId ? "Pilih skema dulu" : "Pilih kelas"} /></SelectTrigger>
                <SelectContent>
                  {kelasList.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tanggal *</Label>
            <Input type="date" value={tanggal} onChange={(e) => { setTanggal(e.target.value); setFieldErrors(p => ({...p, tanggal: undefined})); }} min={new Date().toISOString().split("T")[0]} required />
            {fieldErrors.tanggal && <p className="text-sm text-red-600">{fieldErrors.tanggal}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Waktu (WIB) *</Label>
              <Input type="time" value={waktu} onChange={(e) => { setWaktu(e.target.value); setFieldErrors(p => ({...p, waktu: undefined})); }} required />
              {fieldErrors.waktu && <p className="text-sm text-red-600">{fieldErrors.waktu}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kapasitas *</Label>
              <Input type="number" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} placeholder="35" min="1" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ruangan *</Label>
            <Input value={ruangan} onChange={(e) => setRuangan(e.target.value)} placeholder="Lab Komputer 1" required />
          </div>
          {fieldErrors.general && <p className="text-sm text-red-600">{fieldErrors.general}</p>}
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Sesi"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditLinimasaModal({ event, skemaOptions, asesorList, open, onOpenChange, onEventUpdated }) {
  const [tipe, setTipe] = useState(event?.tipe || "PEMBELAJARAN");
  const [judul, setJudul] = useState(event?.judul || "");
  const [deskripsi, setDeskripsi] = useState(event?.deskripsi || "");
  const [tanggal, setTanggal] = useState(""); 
  const [waktu, setWaktu] = useState(event?.waktu || "");
  const [urlZoom, setUrlZoom] = useState(event?.urlZoom || "");
  const [skemaId, setSkemaId] = useState(event?.skemaId || "UMUM");
  const [pemateriAsesorId, setPemateriAsesorId] = useState(event?.pemateriAsesorId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (event) {
      setTipe(event.tipe || "PEMBELAJARAN");
      setJudul(event.judul || "");
      setDeskripsi(event.deskripsi || "");
      setTanggal(dateToInputString(event.tanggal));
      setWaktu(event.waktu || "");
      setUrlZoom(event.urlZoom || "");
      setSkemaId(event.skemaId || "UMUM");
      setPemateriAsesorId(event.pemateriAsesorId || "");
    }
  }, [event]);

  useEffect(() => { if (!open) { setFieldErrors({}); setError(null); } }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (tipe === "PEMBELAJARAN" && !pemateriAsesorId) {
      setFieldErrors({ pemateri: "Bidang Pemateri wajib dipilih." });
      return;
    }

    if (!judul || !deskripsi || !tanggal) {
      setFieldErrors({ general: "Field Judul, Deskripsi, dan Tanggal wajib diisi." });
      return;
    }

    const selectedDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFieldErrors({ tanggal: "Tanggal harus hari ini atau setelahnya." });
      return;
    }

    // Validasi Waktu Edit (General)
    if (waktu && waktu !== "Sepanjang hari" && waktu !== "Waktu Menyusul") {
       const isToday = selectedDate.toDateString() === today.toDateString();
       const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
       if (timeValidationError) {
         setFieldErrors({ waktu: timeValidationError });
         return;
       }
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        tipe, judul, deskripsi,
        tanggal: new Date(tanggal),
        waktu: waktu || "Sepanjang hari",
        urlZoom: tipe === "PEMBELAJARAN" ? urlZoom : "",
        skemaId,
        pemateriAsesorId: tipe === "PEMBELAJARAN" && pemateriAsesorId !== "NONE" ? pemateriAsesorId : "",
      };
      const updated = await mockUpdateLinimasa(event.id, eventData);
      if (onEventUpdated) await onEventUpdated(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Gagal memperbarui kegiatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Kegiatan Linimasa</DialogTitle>
          <DialogDescription>Perbarui jadwal kegiatan untuk Asesi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
           <div className="space-y-2">
            <Label>Judul Kegiatan *</Label>
            <Input value={judul} onChange={(e) => setJudul(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi *</Label>
            <Textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe Kegiatan *</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEMBELAJARAN">Sesi Pembelajaran</SelectItem>
                  <SelectItem value="PENGUMUMAN">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Untuk Skema</Label>
              <Select value={skemaId} onValueChange={setSkemaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UMUM">Semua Skema (Umum)</SelectItem>
                  {skemaOptions.map((s) => (<SelectItem key={s.id} value={s.id}>{s.judul}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
              {fieldErrors.tanggal && <p className="text-sm text-red-600">{fieldErrors.tanggal}</p>}
            </div>
            <div className="space-y-2">
              <Label>Waktu</Label>
              <Input type="time" value={waktu} onChange={(e) => setWaktu(e.target.value)} />
              {fieldErrors.waktu && <p className="text-sm text-red-600">{fieldErrors.waktu}</p>}
            </div>
          </div>
           {tipe === "PEMBELAJARAN" && (
            <>
              <div className="space-y-2">
                <Label>URL Zoom</Label>
                <Input value={urlZoom} onChange={(e) => setUrlZoom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pemateri</Label>
                <Select value={pemateriAsesorId} onValueChange={setPemateriAsesorId}>
                  <SelectTrigger><SelectValue placeholder="Pilih Pemateri" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">--- Tidak Ditugaskan ---</SelectItem>
                    {asesorList.map((a) => (<SelectItem key={a.id} value={a.id}>{a.nama}</SelectItem>))}
                  </SelectContent>
                </Select>
                {fieldErrors.pemateri && <p className="text-sm text-red-600">{fieldErrors.pemateri}</p>}
              </div>
            </>
          )}
           {fieldErrors.general && <Alert variant="destructive"><AlertDescription>{fieldErrors.general}</AlertDescription></Alert>}
           {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
           <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
             <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSesiModal({ event, skemaOptions, allAsesi = [], open, onOpenChange, onSesiUpdated }) {
  const [skemaId, setSkemaId] = useState(event?.skemaId || "");
  const [tipeUjian, setTipeUjian] = useState(event?.tipeUjian || "");
  const [kelas, setKelas] = useState(event?.kelas || "");
  const [tanggal, setTanggal] = useState(""); 
  const [waktu, setWaktu] = useState(event?.waktu || "");
  const [ruangan, setRuangan] = useState(event?.ruangan || "");
  const [kapasitas, setKapasitas] = useState(event?.kapasitas?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const kelasList = useMemo(() => {
    if (!skemaId) return [];
    const asesiInSkema = allAsesi.filter((a) => a.skemaId === skemaId);
    const kelasSet = new Set(asesiInSkema.map((a) => a.kelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [allAsesi, skemaId]);

  useEffect(() => {
    if (event && open) {
      setSkemaId(event.skemaId || "");
      setTipeUjian(event.tipeUjian || "");
      setKelas(event.kelas || "");
      setTanggal(dateToInputString(event.tanggal));
      setWaktu(event.waktu || "");
      setRuangan(event.ruangan || "");
      setKapasitas(event.kapasitas?.toString() || "");
    }
    if (!open) { setError(null); setIsSubmitting(false); setFieldErrors({}); }
  }, [event, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!skemaId || !tipeUjian || !kelas || !tanggal || !waktu) {
      setFieldErrors({ general: "Mohon lengkapi semua field wajib." });
      return;
    }

    const selectedDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFieldErrors({ tanggal: "Tanggal harus hari ini atau setelahnya." });
      return;
    }

    const isToday = selectedDate.toDateString() === today.toDateString();
    const timeValidationError = validateDateTime(selectedDate, waktu, isToday);
    if (timeValidationError) {
      setFieldErrors({ waktu: timeValidationError });
      return;
    }

    setIsSubmitting(true);
    try {
      const sesiData = {
        skemaId, tipeUjian, kelas,
        tanggal: new Date(tanggal),
        waktu, ruangan,
        kapasitas: Number.parseInt(kapasitas),
      };
      const updated = await mockUpdateSesiUjianOffline(event.id, sesiData);
      if (onSesiUpdated) await onSesiUpdated(updated);
      onOpenChange(false);
    } catch (err) {
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
          <DialogDescription>Perbarui jadwal ujian offline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Skema</Label>
               <Select value={skemaId} onValueChange={setSkemaId} required>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>{skemaOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.judul}</SelectItem>)}</SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label>Tipe Ujian</Label>
               <Select value={tipeUjian} onValueChange={setTipeUjian} required>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="TEORI">Teori</SelectItem>
                    <SelectItem value="UNJUK_DIRI">Unjuk Diri</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          </div>
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select value={kelas} onValueChange={setKelas} required disabled={!skemaId}>
               <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
               <SelectContent>{kelasList.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                {fieldErrors.tanggal && <p className="text-sm text-red-600">{fieldErrors.tanggal}</p>}
             </div>
             <div className="space-y-2">
                <Label>Waktu</Label>
                <Input type="time" value={waktu} onChange={e => setWaktu(e.target.value)} required />
                {fieldErrors.waktu && <p className="text-sm text-red-600">{fieldErrors.waktu}</p>}
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kapasitas</Label>
              <Input type="number" value={kapasitas} onChange={e => setKapasitas(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Ruangan</Label>
              <Input value={ruangan} onChange={e => setRuangan(e.target.value)} required />
            </div>
          </div>
          {fieldErrors.general && <Alert variant="destructive"><AlertDescription>{fieldErrors.general}</AlertDescription></Alert>}
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
     </Dialog>
  );
}

// --- Main Page Component ---

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
        const tanggalDate = item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
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
          // props untuk edit modal
          judul: item.judul,
          deskripsi: item.deskripsi,
          tipe: item.tipe,
          tanggal: item.tanggal,
          waktu: item.waktu,
          urlZoom: item.urlZoom,
        };
      });

      const formattedSesiUjian = sesiUjianData.map((item) => {
        const tanggalDate = item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
        return {
          id: item.id,
          date: tanggalDate.toDateString(),
          title: `[UJIAN] ${item.tipeUjian === "TEORI" ? "Ujian Teori" : "Unjuk Diri"}`,
          time: item.waktu || "Waktu Menyusul",
          description: `Lokasi: ${item.ruangan} (Kapasitas: ${item.kapasitas})`,
          url: null,
          type: "exam",
          skemaId: item.skemaId,
          kelas: item.kelas || "Kelas Belum Diatur",
          pemateriNama: null,
          originalData: item,
          // props untuk edit modal
          tipeUjian: item.tipeUjian,
          tanggal: item.tanggal,
          waktu: item.waktu,
          ruangan: item.ruangan,
          kapasitas: item.kapasitas,
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

  const selectedDateStr = date ? date.toDateString() : new Date().toDateString();
  
  const selectedEvents = allEvents
    .filter((event) => event.date === selectedDateStr)
    .sort((a, b) => {
      const parseTime = (timeStr) => {
        if (timeStr === "Sepanjang hari") return 0;
        if (timeStr === "Waktu Menyusul") return 1;
        const parts = String(timeStr).split(":");
        if (parts.length === 2) {
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 9999;
      };
      return parseTime(a.time) - parseTime(b.time);
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
              Kegiatan {new Date(selectedDateStr).toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
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

      {/* Modal Edit Linimasa (Umum) */}
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

      {/* Modal Edit Sesi Ujian (Offline) */}
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

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kegiatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kegiatan "{deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.
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