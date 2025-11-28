import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SchedulePage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/asesi/schedule',
}))

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetLinimasa: vi.fn(),
  mockGetPlottingAsesi: vi.fn(),
  mockGetAsesorUsers: vi.fn(),
}))

describe('Halaman Jadwal Asesi', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesi-1', role: 'ASESI' }, loading: false })
    
    // Pastikan tanggalnya Valid ISO String
    const today = new Date().toISOString()
    
    vi.mocked(apiMock.mockGetLinimasa).mockResolvedValue([
      { id: 'ev1', judul: 'Sosialisasi', tipe: 'PENGUMUMAN', tanggal: today, waktu: '08:00' }
    ])
    vi.mocked(apiMock.mockGetPlottingAsesi).mockResolvedValue([])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([])
  })

  it('harus menampilkan jadwal kegiatan', async () => {
    render(<SchedulePage />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })

    // FIX: Gunakan regex untuk pencocokan parsial karena judul dirender sebagai "[PENGUMUMAN] Sosialisasi"
    const events = await screen.findAllByText(/Sosialisasi/i)
    expect(events.length).toBeGreaterThan(0)
  })
})