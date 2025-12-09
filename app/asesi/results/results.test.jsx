import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResultsPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mock MainLayout
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mock Navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/asesi/results',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetHasilAkhir: vi.fn() }))

describe('Halaman Hasil Akhir', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesi-1' }, loading: false })
  })

  it('harus menampilkan status KOMPETEN dengan benar', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'KOMPETEN',
      hasilTeori: { 
        statusAkumulasi: 'KOMPETEN', 
        totalUnitLulus: 10, 
        totalUnitSkema: 10, 
        rincianUnit: [] 
      },
      hasilPraktikum: { status: 'KOMPETEN', soalSesuai: 1, soalTotal: 1 },
      hasilUnjukDiri: { status: 'KOMPETEN', soalSesuai: 1, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText('Status Akhir')).toBeInTheDocument()
      // Cari teks "Kompeten" (dengan regex case-insensitive)
      const statusBadges = screen.getAllByText(/kompeten/i)
      expect(statusBadges.length).toBeGreaterThan(0)
    })
  })

  it('harus menampilkan status BELUM KOMPETEN dengan benar', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'BELUM_KOMPETEN',
      hasilTeori: { 
        statusAkumulasi: 'BELUM_KOMPETEN', 
        totalUnitLulus: 5, 
        totalUnitSkema: 10, 
        rincianUnit: [] 
      },
      hasilPraktikum: { status: 'BELUM_KOMPETEN', soalSesuai: 0, soalTotal: 1 },
      hasilUnjukDiri: { status: 'BELUM_KOMPETEN', soalSesuai: 0, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText('Status Akhir')).toBeInTheDocument()
      const belumKompetenText = screen.getAllByText(/belum kompeten/i)
      expect(belumKompetenText.length).toBeGreaterThan(0)
    })
  })

  it('harus menampilkan status SEDANG DINILAI dengan benar', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'SEDANG_DINILAI',
      hasilTeori: { 
        statusAkumulasi: 'SEDANG_DINILAI', 
        totalUnitLulus: 5, 
        totalUnitSkema: 10, 
        rincianUnit: [] 
      },
      hasilPraktikum: { status: 'SEDANG_DINILAI', soalSesuai: 0, soalTotal: 1 },
      hasilUnjukDiri: { status: 'BELUM_DINILAI', soalSesuai: 0, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText('Status Akhir')).toBeInTheDocument()
      const sedangDinilaiText = screen.getAllByText(/sedang dinilai/i)
      expect(sedangDinilaiText.length).toBeGreaterThan(0)
    })
  })

  it('harus menampilkan detail rincian unit dengan benar', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'KOMPETEN',
      hasilTeori: { 
        statusAkumulasi: 'KOMPETEN', 
        totalUnitLulus: 2, 
        totalUnitSkema: 2, 
        rincianUnit: [
          { unitId: 'u1', judul: 'Unit 1', status: 'KOMPETEN', soalSesuai: 4, soalTotal: 4 },
          { unitId: 'u2', judul: 'Unit 2', status: 'KOMPETEN', soalSesuai: 4, soalTotal: 4 }
        ]
      },
      hasilPraktikum: { status: 'KOMPETEN', soalSesuai: 1, soalTotal: 1 },
      hasilUnjukDiri: { status: 'KOMPETEN', soalSesuai: 1, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText('Unit 1')).toBeInTheDocument()
      expect(screen.getByText('Unit 2')).toBeInTheDocument()
      expect(screen.getByText('2 / 2')).toBeInTheDocument() // Unit Lulus
    })
  })

  it('harus menampilkan pesan kontekstual untuk status KOMPETEN', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'KOMPETEN',
      hasilTeori: { 
        statusAkumulasi: 'KOMPETEN', 
        totalUnitLulus: 10, 
        totalUnitSkema: 10, 
        rincianUnit: [] 
      },
      hasilPraktikum: { status: 'KOMPETEN', soalSesuai: 1, soalTotal: 1 },
      hasilUnjukDiri: { status: 'KOMPETEN', soalSesuai: 1, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText(/selamat.*kompeten/i)).toBeInTheDocument()
    })
  })

  it('harus menampilkan pesan kontekstual untuk status BELUM KOMPETEN', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'BELUM_KOMPETEN',
      hasilTeori: { 
        statusAkumulasi: 'BELUM_KOMPETEN', 
        totalUnitLulus: 5, 
        totalUnitSkema: 10, 
        rincianUnit: [] 
      },
      hasilPraktikum: { status: 'BELUM_KOMPETEN', soalSesuai: 0, soalTotal: 1 },
      hasilUnjukDiri: { status: 'BELUM_KOMPETEN', soalSesuai: 0, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText(/belum kompeten.*remedial/i)).toBeInTheDocument()
    })
  })

  it('harus menampilkan pesan kontekstual untuk status SEDANG DINILAI', async () => {
    vi.mocked(apiMock.mockGetHasilAkhir).mockResolvedValue({
      statusAkhir: 'SEDANG_DINILAI',
      hasilTeori: { 
        statusAkumulasi: 'SEDANG_DINILAI', 
        totalUnitLulus: 5, 
        totalUnitSkema: 10, 
        rincianUnit: [] 
      },
      hasilPraktikum: { status: 'SEDANG_DINILAI', soalSesuai: 0, soalTotal: 1 },
      hasilUnjukDiri: { status: 'BELUM_DINILAI', soalSesuai: 0, soalTotal: 1 }
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText(/asesor sedang melakukan proses penilaian/i)).toBeInTheDocument()
    })
  })
})