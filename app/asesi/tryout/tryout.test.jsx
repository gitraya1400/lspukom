import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TryoutPage from './page'
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
    usePathname: () => '/asesi/tryout',
  }
})

// Mock Fullscreen API
Element.prototype.requestFullscreen = vi.fn().mockResolvedValue()
document.exitFullscreen = vi.fn().mockResolvedValue()

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetProgressAsesi: vi.fn(),
  mockGetUnitsForSkema: vi.fn(),
  mockGetSoalTryoutGabungan: vi.fn(),
  mockSubmitTryout: vi.fn(),
}))

describe('Halaman Tryout', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesi-1', skemaId: 'ADS' }, loading: false })
    
    vi.mocked(apiMock.mockGetProgressAsesi).mockResolvedValue({ progressPembelajaran: 100 })
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([])
    vi.mocked(apiMock.mockGetSoalTryoutGabungan).mockResolvedValue([
      { id: 'soal-1', teks: 'Contoh Soal Tryout?' }
    ])
  })

  it('harus menampilkan soal setelah tombol mulai diklik', async () => {
    render(<TryoutPage />)
    
    // Tunggu tombol mulai
    await waitFor(() => screen.getByText('Mulai Tryout'))
    fireEvent.click(screen.getByText('Mulai Tryout'))

    // Pastikan soal muncul
    await waitFor(() => {
      expect(screen.getByText('Contoh Soal Tryout?')).toBeInTheDocument()
    })
  })
})