'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MENU_ITEMS } from "@/lib/constants"
import {
  Menu, LogOut, X, Home, BookOpen, Play, ClipboardList,
  CheckCircle, Calendar, Users, CheckSquare, BookMarked, User, Settings
} from "lucide-react"
import STISLogo from "@/public/logo-stis.png"
import { mockGetProgressAsesi } from "@/lib/api-mock"

// ==========================================
// ICON MAP
// ==========================================
const iconMap = {
  Home: <Home />,
  BookOpen: <BookOpen />,
  Play: <Play />,
  ClipboardList: <ClipboardList />,
  CheckCircle: <CheckCircle />,
  Calendar: <Calendar />,
  Users: <Users />,
  CheckSquare: <CheckSquare />,
  BookMarked: <BookMarked />,
  User: <User />,
  Settings: <Settings />,
}

export function MainLayout({ children }) {
  const { user, logout: authLogout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // State untuk kunci pra-asesmen
  const [praAsesmenLocked, setPraAsesmenLocked] = useState(false)

  useEffect(() => {
    let mounted = true
    async function checkPraAsesmen() {
      if (!user || user.role !== "ASESI") {
        if (mounted) setPraAsesmenLocked(false)
        return
      }
      try {
        const progress = await mockGetProgressAsesi(user.id)
        if (mounted) {
          setPraAsesmenLocked(progress?.statusPraAsesmen === "BELUM")
        }
      } catch (e) {
        if (mounted) setPraAsesmenLocked(false)
      }
    }
    checkPraAsesmen()
    return () => { mounted = false }
  }, [user])

  const logout = () => {
    authLogout()
    router.push("/login")
  }

  if (!user) return <>{children}</>

  // ==========================================
  // MENU FILTERING
  // ==========================================
  let menuItems = MENU_ITEMS[user.role] || []
  if (user.role === "ASESI") {
    // tetap sembunyikan sertifikat untuk ASESI (sebelumnya ada)
    menuItems = menuItems.filter(item => item.path !== "/asesi/certificate")

    // Jika pra-asesmen belum selesai, batasi menu hanya ke halaman pra-asesmen
    if (praAsesmenLocked) {
      menuItems = [
        { icon: "CheckCircle", label: "Pra-Asesmen", path: "/asesi/pra-asesmen" }
      ]
    }
  }

  const getRoleDisplay = (role) => {
    const roleMap = {
      ASESI: "Peserta",
      ASESOR: "Penilai",
      ADMIN_LSP: "Admin LSP",
    }
    return roleMap[role] || role
  }

  // ==========================================
  // LAYOUT RENDERING
  // ==========================================
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:w-72 bg-white border-r border-gray-200 flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1">
              <Image src={STISLogo} alt="LSP Logo" width={40} height={40} priority />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">LSP Polstat STIS</h1>
              <p className="text-xs text-gray-500">Learning Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
              >
                <span className={`text-lg ${isActive ? "text-blue-700" : "opacity-70"}`}>
                  {iconMap[item.icon]}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Link
            href="/profile"
            title="Lihat Profil"
            className="block p-2 rounded-lg hover:bg-gray-100 transition-colors mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {user.nama ? user.nama.charAt(0) : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.nama}</p>
                <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
              </div>
            </div>
          </Link>

          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full text-sm border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Header + Drawer (Mobile) */}
      <div className="md:hidden flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1">
              <Image src={STISLogo} alt="LSP Logo" width={32} height={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">LSP Polstat STIS</p>
              <p className="text-xs text-gray-500">Learning Management System</p>
            </div>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-64">
              <SheetHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
                <SheetTitle className="font-bold text-gray-900">Menu</SheetTitle>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
              </SheetHeader>

              <nav className="space-y-1 p-4">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <SheetTrigger asChild key={item.label}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium
                          ${isActive
                            ? "bg-blue-100 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                      >
                        <span className={`text-lg ${isActive ? "text-blue-700" : "opacity-70"}`}>
                          {iconMap[item.icon]}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </SheetTrigger>
                  )
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                <SheetTrigger asChild>
                  <Link
                    href="/profile"
                    title="Lihat Profil"
                    className="block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {user.nama ? user.nama.charAt(0) : 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{user.nama}</p>
                        <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
                      </div>
                    </div>
                  </Link>
                </SheetTrigger>

                <SheetTrigger asChild>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                  >
                    <LogOut className="w-3 h-3 mr-1.5" />
                    Logout
                  </Button>
                </SheetTrigger>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Main Content (Desktop) */}
      <main className="hidden md:flex md:flex-1 md:flex-col md:overflow-auto">{children}</main>
    </div>
  )
}
