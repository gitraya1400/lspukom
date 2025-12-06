/**
 * Test Suite untuk Halaman Rekapitulasi Hasil (Admin)
 *
 * Pengujian ini memastikan:
 * 1. Data rekapitulasi hasil asesi berhasil diambil dari API dan ditampilkan.
 * 2. Status kelulusan (Kompeten) dirender dengan benar.
 * 3. Loading state ditangani dengan benar sebelum data muncul.
 */

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminResultsPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking Layout Utama
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

// Mocking UI Components
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}))

vi.mock('@/components/ui/table', () => ({
  Table: (props) => <table {...props} />,
  TableHeader: (props) => <thead {...props} />,
  TableBody: (props) => <tbody {...props} />,
  TableHead: (props) => <th {...props} />,
  TableRow: (props) => <tr {...props} />,
  TableCell: (props) => <td {...props} />,
}))

// Mocking Next.js Navigation
const mockRouter = { push: vi.fn() }
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/admin/results',
}))

// Mocking Auth & API
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetRekapHasilAkhir: vi.fn(),
  mockGetAllSkema: vi.fn(),
}))

describe('Halaman Rekap Hasil Admin', () => {
  beforeEach(() => {
    // Simulasi user admin login
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })
    
    // Simulasi data API
    vi.mocked(apiMock.mockGetRekapHasilAkhir).mockResolvedValue([
      {
        asesiData: { id: 'a1', nama: 'Mahasiswa Lulus', nim: '12345', kelas: '4SI1' },
        hasilAkhir: {
          skemaId: 'DS',
          statusAkhir: 'KOMPETEN',
          hasilTeori: { statusAkumulasi: 'KOMPETEN' },
          hasilPraktikum: 'KOMPETEN',
          hasilUnjukDiri: 'KOMPETEN',
          asesorTeoriDetail: []
        }
      }
    ])
    vi.mocked(apiMock.mockGetAllSkema).mockResolvedValue([])
  })

  it('harus menampilkan tabel rekapitulasi hasil', async () => {
    render(<AdminResultsPage />)

    // Menunggu loading skeleton hilang
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loading-skeleton'))

    // Verifikasi data asesi muncul
    expect(screen.getByText(/Mahasiswa Lulus/i)).toBeInTheDocument()
    
    // Verifikasi badge status muncul
    const badges = screen.getAllByText(/KOMPETEN/i)
    expect(badges.length).toBeGreaterThan(0)
  })
})