import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GradingListPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// FIX: Mock MainLayout
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// FIX: Mock Navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/asesor/grading',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetPenugasanAsesor: vi.fn() }))

describe('Halaman Daftar Grading (Asesor)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesor-1', role: 'ASESOR' }, loading: false })

    // Mock Data Tugas
    vi.mocked(apiMock.mockGetPenugasanAsesor).mockResolvedValue([
      { 
        id: 't1', 
        asesiNama: 'Mahasiswa A', 
        unitId: '1', 
        unitJudul: 'Analisis Big Data', 
        tipe: 'TEORI',
        statusPenilaian: 'BELUM_DINILAI' 
      }
    ])
  })

  it('harus menampilkan daftar tugas penilaian', async () => {
    render(<GradingListPage />)

    await waitFor(() => {
      expect(screen.getByText('Tugas Penilaian')).toBeInTheDocument()
    })

    // Pastikan judul unit muncul
    await waitFor(() => {
      expect(screen.getByText(/Analisis Big Data/i)).toBeInTheDocument()
      expect(screen.getByText('Mahasiswa A')).toBeInTheDocument()
    })
  })
})