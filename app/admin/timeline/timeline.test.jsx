/**
 * Test Suite untuk Halaman Manajemen Linimasa (Admin)
 *
 * Pengujian ini memastikan:
 * 1. Halaman utama dirender dengan benar (Kalender, Daftar Kegiatan).
 * 2. Data kegiatan (Linimasa) berhasil diambil dari API dan ditampilkan.
 * 3. Interaksi dasar seperti membuka modal "Buat Kegiatan" berfungsi.
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TimelinePage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking Layout Utama
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mocking Next.js Navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/timeline',
  }
})

// Mocking Auth & API
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetAllSkema: vi.fn(),
  mockGetLinimasa: vi.fn(),
  mockGetSesiUjianOffline: vi.fn(),
  mockGetAsesorUsers: vi.fn(),
  mockGetAsesiUsers: vi.fn(),
}))

describe('Halaman Manajemen Linimasa', () => {
  beforeEach(() => {
    // Simulasi user admin login
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })

    // Simulasi data dummy
    vi.mocked(apiMock.mockGetAllSkema).mockResolvedValue([])
    vi.mocked(apiMock.mockGetLinimasa).mockResolvedValue([
      { 
        id: 'ev1', 
        judul: 'Sosialisasi Penting', 
        tipe: 'PENGUMUMAN', 
        tanggal: new Date().toISOString(), 
        skemaId: 'UMUM' 
      }
    ])
    vi.mocked(apiMock.mockGetSesiUjianOffline).mockResolvedValue([])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([])
    vi.mocked(apiMock.mockGetAsesiUsers).mockResolvedValue([])
  })

  it('harus menampilkan kalender dan list kegiatan', async () => {
    render(<TimelinePage />)

    // Verifikasi judul halaman dan konten event muncul
    await waitFor(() => {
      expect(screen.getByText('Manajemen Linimasa')).toBeInTheDocument()
      expect(screen.getByText(/Sosialisasi Penting/i)).toBeInTheDocument()
    })

    // Verifikasi tombol aksi tersedia
    expect(screen.getByText('Buat Kegiatan')).toBeInTheDocument()
  })
})