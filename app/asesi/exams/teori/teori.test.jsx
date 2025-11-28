import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
// FIX: Path import diperbaiki dari './page' menjadi './run/page'
import TeoriExamRunPage from './run/page' 
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
    usePathname: () => '/asesi/exams/teori/run',
  }
})

// Mock Fullscreen API
Element.prototype.requestFullscreen = vi.fn().mockResolvedValue()
document.exitFullscreen = vi.fn().mockResolvedValue()

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetExamStatus: vi.fn(),
  mockGetUnitsForSkema: vi.fn(),
  mockGetSoalForUnit: vi.fn(),
  mockSubmitUjianTeori: vi.fn(),
}))

describe('Halaman Ujian Teori', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesi-1', role: 'ASESI', skemaId: 'ADS' }, loading: false })
    
    vi.mocked(apiMock.mockGetExamStatus).mockResolvedValue({
      teori: { status: 'SIAP_DIJADWALKAN', jadwal: { tanggal: new Date().toISOString() } }
    })
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([
      { id: 'u1', judul: 'Unit Kompetensi A', durasiTeori: 15, nomorUnit: 1 }
    ])
    vi.mocked(apiMock.mockGetSoalForUnit).mockResolvedValue([
      { id: 's1', teks: 'Soal Ujian Asli', unitId: 'u1' }
    ])
  })

  it('harus menampilkan tombol mulai ujian jika status siap', async () => {
    render(<TeoriExamRunPage />)
    
    // Tunggu tombol mulai muncul
    await waitFor(() => {
      expect(screen.getByText(/Mulai Ujian/i)).toBeInTheDocument()
    })
    
    // Pastikan konten unit juga termuat
    expect(screen.getByText(/Unit Kompetensi A/i)).toBeInTheDocument()
  })
})