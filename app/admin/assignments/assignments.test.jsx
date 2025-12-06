/**
 * Test Suite untuk Halaman Penugasan Asesor (Admin)
 * * Cakupan Pengujian:
 * 1. Memastikan halaman berhasil di-render tanpa error.
 * 2. Memastikan data asesi berhasil diambil dan ditampilkan.
 * 3. Memastikan elemen UI utama (judul, filter) tersedia.
 * * Strategi Mocking:
 * - Mock MainLayout untuk menghindari render sidebar yang kompleks.
 * - Mock UI components (AlertDialog) untuk menyederhanakan DOM tree.
 * - Mock API calls untuk simulasi data backend.
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AssignmentsPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking komponen UI untuk mengisolasi pengujian halaman
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mock komponen AlertDialog untuk mencegah error accessibility pada headless DOM
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }) => <div>{children}</div>,
  AlertDialogContent: ({ children }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>, 
  AlertDialogDescription: ({ children }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }) => <div>{children}</div>,
  AlertDialogAction: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
}))

// Mock Next.js Navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/admin/assignments',
  }
})

// Mock Modul Auth dan API
vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api-mock', () => ({
  mockGetAsesiUsers: vi.fn(),
  mockGetAsesorUsers: vi.fn(),
  mockGetAllSkema: vi.fn(),
  mockGetUnitsForSkema: vi.fn(),
  mockAssignAsesorPerUnit: vi.fn(),
}))

describe('Halaman Penugasan Asesor', () => {
  beforeEach(() => {
    // Simulasi User Admin yang sedang login
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'ADMIN_LSP', nama: 'Admin Test' },
      loading: false
    })

    // Simulasi Data Dummy API
    vi.mocked(apiMock.mockGetAllSkema).mockResolvedValue([
      { id: 'ADS', judul: 'Associate Data Scientist' }
    ])
    vi.mocked(apiMock.mockGetAsesiUsers).mockResolvedValue([
      { id: 'a1', nama: 'Asesi Alpha', skemaId: 'ADS', kelas: '3SD1' }
    ])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([])
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([])
  })

  it('seharusnya merender halaman dan menampilkan data asesi dengan benar', async () => {
    render(<AssignmentsPage />)

    // Tunggu hingga data asesi muncul di layar (menandakan loading selesai)
    await waitFor(() => {
      expect(screen.getByText('Asesi Alpha')).toBeInTheDocument()
    })

    // Verifikasi keberadaan elemen UI penting
    expect(screen.getByRole('heading', { name: 'Penugasan Asesor' })).toBeInTheDocument()
    expect(screen.getByText('Filter Kelas')).toBeInTheDocument()
  })
})