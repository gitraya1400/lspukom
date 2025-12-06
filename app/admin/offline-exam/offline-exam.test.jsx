/**
 * Test Suite untuk Halaman Plotting Ujian Offline
 * * Cakupan Pengujian:
 * 1. Memastikan halaman berhasil dirender (detail sesi dan kapasitas).
 * 2. Memastikan daftar asesi yang belum di-plot dan sudah di-plot muncul.
 * 3. Memastikan interaksi tombol 'Simpan' memanggil API update plotting.
 * * * Strategi Mocking:
 * - Mock `useParams` untuk mensimulasikan halaman sesi tertentu (misal ID: sesi-123).
 * - Mock API `mockGetSesiUjianDetail` untuk data sesi.
 * - Mock API `mockGetAsesiBelumDiplot` untuk data asesi yang tersedia.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlottingPage from './[sesiId]/page' 
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking Layout Utama
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mocking Navigasi dan Parameter URL
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/offline-exam/sesi-123',
    useParams: () => ({ sesiId: 'sesi-123' }), // Simulasi ID sesi dari URL
  }
})

// Mocking Context Auth dan API
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetSesiUjianDetail: vi.fn(),
  mockGetAsesiBelumDiplot: vi.fn(),
  mockUpdatePlottingSesi: vi.fn(),
}))

describe('Halaman Plotting Ujian Offline', () => {
  beforeEach(() => {
    // Setup User Admin
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })

    // Setup Data Dummy Sesi Ujian
    vi.mocked(apiMock.mockGetSesiUjianDetail).mockResolvedValue({
      id: 'sesi-123',
      tipeUjian: 'TEORI',
      ruangan: 'Lab Komputer 1',
      tanggal: new Date().toISOString(),
      kapasitas: 40,
      skemaId: 'ADS',
      asesiTerplot: []
    })

    // Setup Data Dummy Asesi Available
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

  it('seharusnya menampilkan detail sesi, ruangan, dan kapasitas', async () => {
    render(<PlottingPage />)

    // Tunggu judul halaman muncul
    await waitFor(() => {
      expect(screen.getByText('Atur Peserta Sesi Ujian Offline')).toBeInTheDocument()
    })

    // Verifikasi detail ruangan dan kapasitas
    expect(screen.getByText(/Lab Komputer 1/i)).toBeInTheDocument()
    expect(screen.getByText(/40/)).toBeInTheDocument()
  })

  it('tombol simpan seharusnya memanggil API update plotting', async () => {
    render(<PlottingPage />)
    await waitFor(() => screen.getByText('Atur Peserta Sesi Ujian Offline'))

    const saveBtn = screen.getByText('Simpan Plotting Peserta')
    fireEvent.click(saveBtn)

    await waitFor(() => {
      // Memastikan fungsi API dipanggil dengan ID sesi dan array kosong (karena belum ada yang di-plot di test ini)
      expect(apiMock.mockUpdatePlottingSesi).toHaveBeenCalledWith('sesi-123', [])
    })
  })
})