import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsesorSchedulePage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

// FIX: Mock Skeleton
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/asesor/schedule',
}))

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetLinimasa: vi.fn(),
  mockGetAsesorUsers: vi.fn(),
}))

describe('Halaman Jadwal Asesor', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesor-1', role: 'ASESOR' }, loading: false })
    vi.mocked(apiMock.mockGetLinimasa).mockResolvedValue([
      { id: 'ev1', judul: 'Ujian Sidang', tipe: 'UJIAN', tanggal: new Date().toISOString(), waktu: '09:00', pemateriAsesorId: 'asesor-1' }
    ])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([{ id: 'asesor-1', nama: 'Asesor' }])
  })

  it('harus menampilkan statistik dan daftar kegiatan', async () => {
    render(<AsesorSchedulePage />)

    // Tunggu Skeleton Hilang
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Ujian Sidang')).toBeInTheDocument()
    })
  })
})