/**
 * Halaman Jadwal & Linimasa (Asesor)
 * * Fitur:
 * 1. Menampilkan kalender kegiatan dan sesi ujian.
 * 2. Menampilkan ringkasan statistik (total, minggu ini, bulan ini).
 * 3. Menampilkan detail kegiatan per tanggal dan tautan Zoom jika ada.
 */

"use client"

import React, { useEffect, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Clock,
  Link as LinkIcon,
  CalendarDays,
  Users,
  AlertCircle,
  Info,
  UserCheck,
  Presentation,
  User as UserIcon
} from "lucide-react"
import { mockGetLinimasa, mockGetAsesorUsers } from "@/lib/api-mock"
import { cn } from "@/lib/utils"

// ===============================================================
// --- HELPER COMPONENT: Event Tag & Custom Day ---
// ===============================================================
const EventTag = ({ event }) => {
  let Icon = Info
  let colors = "bg-blue-500 text-white"
  let label = event.tipe || "Info"

  switch (event.tipe) {
    case "PENGUMUMAN":
      Icon = AlertCircle
      colors = "bg-yellow-500 text-white"
      label = "Info"
      break
    case "UJIAN":
      Icon = UserCheck
      colors = "bg-purple-600 text-white"
      label = "Ujian"
      break
    case "SESI_OFFLINE":
      Icon = Presentation
      colors = "bg-indigo-500 text-white"
      label = "Sesi"
      break
  }

  const titleWord = event.judul.split(" ")[0]

  return (
    <div className={cn("event-tag max-w-full", colors)}>
      <Icon className="w-3 h-3" />
      <span className="truncate">{titleWord.length > 10 ? label : titleWord}</span>
    </div>
  )
}

// Komponen kustom untuk tanggal di kalender agar bisa menampilkan titik/tag event
const CustomDayButton = ({ linimasa = [], ...props }) => {
  const { day } = props

  const eventsForDay = useMemo(
    () =>
      linimasa.filter(
        (event) => new Date(event.tanggal).toDateString() === day.date.toDateString()
      ),
    [linimasa, day.date]
  )

  return (
    <CalendarDayButton {...props}>
      {props.children}
      {eventsForDay.length > 0 && (
        <div className="event-tag-container">
          {eventsForDay.slice(0, 1).map((event) => (
            <EventTag key={event.id} event={event} />
          ))}
          {eventsForDay.length > 1 && (
            <div className="event-tag-more">+{eventsForDay.length - 1} lagi</div>
          )}
        </div>
      )}
    </CalendarDayButton>
  )
}

// Komponen Kartu Statistik 
const StatCard = ({ title, value, icon, colorClass, loading }) => {
  const Icon = icon
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className={cn("text-sm font-medium", colorClass)}>{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <Icon className={cn("w-10 h-10", colorClass)} />
      </CardContent>
    </Card>
  )
}

// ===============================================================
// --- HALAMAN JADWAL ASESOR ---
// ===============================================================
export default function AsesorSchedulePage() {
  const { user } = useAuth()
  const [linimasa, setLinimasa] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [stats, setStats] = useState({ total: 0, mingguIni: 0, bulanIni: 0 })

  useEffect(() => {
    if (user) loadLinimasa()
  }, [user])

  const loadLinimasa = async () => {
    try {
      setLoading(true)
      const skemaId = user?.skemaKeahlian?.[0] || "ADS"

      const [data, allAsesorData] = await Promise.all([
        mockGetLinimasa(skemaId),
        mockGetAsesorUsers()
      ])

      const asesorNameMap = new Map(allAsesorData.map((a) => [a.id, a.nama]))

      const formattedLinimasa = data.map((event) => ({
        ...event,
        pemateriNama: asesorNameMap.get(event.pemateriAsesorId) || null,
        isPemateri: event.pemateriAsesorId === user.id
      }))

      setLinimasa(formattedLinimasa)

      const today = new Date()
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const lastDayOfWeek = new Date(firstDayOfWeek)
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6)

      let mingguIni = 0
      let bulanIni = 0
      const currentMonth = new Date().getMonth()

      data.forEach((event) => {
        const eventDate = new Date(event.tanggal)
        if (eventDate.getMonth() === currentMonth) bulanIni++
        if (eventDate >= firstDayOfWeek && eventDate <= lastDayOfWeek) mingguIni++
      })

      setStats({ total: data.length, mingguIni, bulanIni })
    } catch (error) {
      console.error("Error loading linimasa:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedEvents = selectedDate
    ? linimasa.filter(
        (event) => new Date(event.tanggal).toDateString() === selectedDate.toDateString()
      )
    : []

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Statistik Ringkas */}
          <StatCard
            title="Total Kegiatan"
            value={stats.total}
            icon={CalendarDays}
            colorClass="text-blue-600"
            loading={loading}
          />
          <StatCard
            title="Minggu Ini"
            value={stats.mingguIni}
            icon={Clock}
            colorClass="text-blue-600"
            loading={loading}
          />
          <StatCard
            title="Bulan Ini"
            value={stats.bulanIni}
            icon={Users}
            colorClass="text-blue-600"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kalender Besar */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg p-0">
              <CardHeader className="bg-blue-600 text-white rounded-t-xl p-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Kalender Kegiatan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="p-4 w-full"
                    components={{
                      DayButton: (props) => (
                        <CustomDayButton {...props} linimasa={linimasa} />
                      )
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Detail Kegiatan Tanggal Terpilih */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg sticky top-6 p-0">
              <CardHeader className="bg-gray-800 text-white rounded-t-xl p-4">
                <CardTitle className="text-base">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "Pilih Tanggal"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <Skeleton className="h-24 w-full" />
                ) : selectedEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Tidak ada kegiatan pada tanggal ini
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <span
                              className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded-full",
                                event.tipe === "PENGUMUMAN"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : event.tipe === "UJIAN"
                                  ? "bg-purple-100 text-purple-800"
                                  : event.tipe === "SESI_OFFLINE"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-blue-100 text-blue-800"
                              )}
                            >
                              {event.tipe.replace("_", " ")}
                            </span>

                            <h4 className="font-semibold mt-2">{event.judul}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.deskripsi}
                            </p>

                            {event.pemateriNama && (
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 mt-3 text-sm",
                                  event.isPemateri
                                    ? "text-blue-700 font-semibold"
                                    : "text-gray-600"
                                )}
                              >
                                <UserIcon className="w-4 h-4" />
                                Pemateri: {event.pemateriNama}
                                {event.isPemateri && " (Anda)"}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {event.waktu || "Seharian"}
                            </div>

                            {event.urlZoom && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => window.open(event.urlZoom, "_blank")}
                              >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Masuk Zoom
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
