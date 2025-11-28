import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlottingPage from './[sesiId]/page' // Pastikan path import ini benar sesuai struktur folder Anda
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// FIX: Mock MainLayout
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// FIX: Mock Navigation & Params
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/offline-exam/sesi-123',
    useParams: () => ({ sesiId: 'sesi-123' }), // Mock Params untuk halaman ini
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetSesiUjianDetail: vi.fn(),
  mockGetAsesiBelumDiplot: vi.fn(),
  mockUpdatePlottingSesi: vi.fn(),
}))

describe('Halaman Plotting Ujian Offline', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })

    vi.mocked(apiMock.mockGetSesiUjianDetail).mockResolvedValue({
      id: 'sesi-123',
      tipeUjian: 'TEORI',
      ruangan: 'Lab Komputer 1',
      tanggal: new Date().toISOString(),
      kapasitas: 40,
      skemaId: 'ADS',
      asesiTerplot: []
    })

    vi.mocked(apiMock.mockGetAsesiBelumDiplot).mockResolvedValue([
      {
        namaKelas: '3SD1',
        asesi: [
          { id: 'a1', nama: 'Mahasiswa A', nim: '111' },
          { id: 'a2', nama: 'Mahasiswa B', nim: '222' }
        ]
      }
    ])
  })

  it('harus menampilkan detail sesi dan kapasitas', async () => {
    render(<PlottingPage />)

    await waitFor(() => {
      expect(screen.getByText('Atur Peserta Sesi Ujian Offline')).toBeInTheDocument()
    })

    expect(screen.getByText(/Lab Komputer 1/i)).toBeInTheDocument()
    expect(screen.getByText(/40/)).toBeInTheDocument()
  })

  it('tombol simpan harus memanggil API update', async () => {
    render(<PlottingPage />)
    await waitFor(() => screen.getByText('Atur Peserta Sesi Ujian Offline'))

    const saveBtn = screen.getByText('Simpan Plotting Peserta')
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(apiMock.mockUpdatePlottingSesi).toHaveBeenCalledWith('sesi-123', [])
    })
  })
})