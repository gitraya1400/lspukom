import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminResultsPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

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

// FIX: Buat objek router yang stabil agar referensinya tidak berubah saat re-render
const mockRouter = { push: vi.fn() }
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter, // Selalu kembalikan objek yang sama
  usePathname: () => '/admin/results',
}))

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetRekapHasilAkhir: vi.fn(),
  mockGetAllSkema: vi.fn(),
}))

describe('Halaman Rekap Hasil Admin', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })
    
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

    // FIX: Gunakan waitForElementToBeRemoved untuk menunggu loading selesai dengan benar
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('loading-skeleton'))

    // Sekarang kita yakin loading selesai, cek datanya
    expect(screen.getByText(/Mahasiswa Lulus/i)).toBeInTheDocument()
    
    // Gunakan getAllByText karena kata KOMPETEN muncul berkali-kali (status akhir, teori, dll)
    const badges = screen.getAllByText(/KOMPETEN/i)
    expect(badges.length).toBeGreaterThan(0)
  })
})