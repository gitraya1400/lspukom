import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResultsPage from './page'
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
      hasilTeori: { statusAkumulasi: 'KOMPETEN', totalUnitLulus: 10, totalUnitSkema: 10, rincianUnit: [] },
      hasilPraktikum: 'KOMPETEN',
      hasilUnjukDiri: 'KOMPETEN'
    })

    render(<ResultsPage />)

    await waitFor(() => {
      expect(screen.getByText('Status Akhir')).toBeInTheDocument()
      // Cek apakah kata "KOMPETEN" muncul (mungkin muncul lebih dari sekali, jadi kita cek length)
      const statusBadges = screen.getAllByText('KOMPETEN')
      expect(statusBadges.length).toBeGreaterThan(0)
    })
  })
})