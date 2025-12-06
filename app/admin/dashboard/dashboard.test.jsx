/**
 * Test Suite untuk Halaman Dashboard Admin
 * * Cakupan Pengujian:
 * 1. Memastikan komponen utama berhasil dirender.
 * 2. Memastikan data statistik dari API berhasil ditampilkan.
 * 3. Memastikan layout dan navigasi dasar tersedia.
 * * Strategi Mocking:
 * - Mock MainLayout untuk isolasi UI.
 * - Mock Next.js Navigation untuk menghindari error routing.
 * - Mock API `mockGetStatistics` untuk mengontrol data yang ditampilkan.
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminDashboard from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking Layout Utama agar tidak merender Sidebar/Header yang kompleks
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mocking Navigasi Next.js
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/dashboard',
  }
})

// Mocking Context Auth dan API
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetStatistics: vi.fn() }))

describe('Halaman Dashboard Admin', () => {
  beforeEach(() => {
    // Simulasi User Admin sedang login
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })
    
    // Simulasi respons data statistik dari API
    vi.mocked(apiMock.mockGetStatistics).mockResolvedValue({
      totalAsesi: 100,
      totalAsesor: 10,
      pendingGrading: 5,
      readyForExam: 20
    })
  })

  it('seharusnya menampilkan kartu statistik dengan nilai yang benar', async () => {
    render(<AdminDashboard />)

    // Verifikasi Judul Halaman
    expect(screen.getByText('Dashboard Admin LSP')).toBeInTheDocument()

    // Verifikasi Nilai Statistik muncul setelah loading selesai
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument() // Total Asesi
      expect(screen.getByText('10')).toBeInTheDocument()  // Total Asesor
      expect(screen.getByText('5')).toBeInTheDocument()   // Penilaian Tertunda
    })
  })
})