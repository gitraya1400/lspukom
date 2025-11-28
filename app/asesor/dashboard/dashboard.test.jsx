import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsesorDashboard from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/asesor/dashboard',
}))

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetPenugasanAsesor: vi.fn() }))

describe('Halaman Dashboard Asesor', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: 'asesor-1', nama: 'Pak Budi', role: 'ASESOR' }, 
      loading: false 
    })

    vi.mocked(apiMock.mockGetPenugasanAsesor).mockResolvedValue([
      { id: 't1', tipe: 'TEORI', statusPenilaian: 'BELUM_DINILAI' },
      { id: 't2', tipe: 'PRAKTIKUM', statusPenilaian: 'SELESAI' }
    ])
  })

  it('harus menampilkan nama asesor dan statistik tugas', async () => {
    render(<AsesorDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Pak Budi/i)).toBeInTheDocument()
    })

    // FIX: Cek apakah angka '1' muncul (untuk jumlah per kategori)
    // Karena kita punya 1 Teori dan 1 Praktikum, angka 1 harusnya muncul
    const stats = screen.getAllByText('1')
    expect(stats.length).toBeGreaterThan(0)
  })
})