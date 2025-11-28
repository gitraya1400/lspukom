import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AssignmentsPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// --- 1. MOCKING KOMPONEN UI & LAYOUT (SOLUSI UTAMA) ---
// Kita ganti MainLayout dengan div biasa agar Sidebar tidak ikut dirender
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Kita ganti AlertDialog agar Title-nya tidak dianggap sebagai Heading yang bentrok
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }) => <div>{children}</div>,
  AlertDialogContent: ({ children }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>, // Jadi div biasa
  AlertDialogDescription: ({ children }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }) => <div>{children}</div>,
  AlertDialogAction: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
}))

// --- 2. MOCK NAVIGATION ---
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

// --- 3. MOCK AUTH & API ---
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

// --- 4. TEST SUITE ---
describe('Halaman Penugasan Asesor', () => {
  beforeEach(() => {
    // Setup User Admin yang sedang login
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'ADMIN_LSP', nama: 'Admin Test' },
      loading: false
    })

    // Setup Data Dummy API
    vi.mocked(apiMock.mockGetAllSkema).mockResolvedValue([
      { id: 'ADS', judul: 'Associate Data Scientist' }
    ])
    vi.mocked(apiMock.mockGetAsesiUsers).mockResolvedValue([
      { id: 'a1', nama: 'Asesi Alpha', skemaId: 'ADS', kelas: '3SD1' }
    ])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([])
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([])
  })

  it('harus merender halaman dan menampilkan data asesi', async () => {
    render(<AssignmentsPage />)

    // Tunggu sampai data asesi muncul (tanda loading selesai)
    await waitFor(() => {
      expect(screen.getByText('Asesi Alpha')).toBeInTheDocument()
    })

    // Cek judul halaman utama
    // Karena AlertDialog sudah di-mock jadi div, hanya ada SATU heading sekarang (judul halaman)
    expect(screen.getByRole('heading', { name: 'Penugasan Asesor' })).toBeInTheDocument()
    
    // Cek apakah filter tersedia
    expect(screen.getByText('Filter Kelas')).toBeInTheDocument()
  })
})