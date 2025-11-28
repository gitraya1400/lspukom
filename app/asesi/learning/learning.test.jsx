import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LearningPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}))

// FIX 1: Mock Collapsible untuk interaksi (Expand Unit)
vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, open, onOpenChange }) => {
    return (
      <div data-testid="collapsible">
        {/* Tombol rahasia untuk simulasi toggle di test */}
        <button 
          data-testid="force-toggle" 
          onClick={() => onOpenChange && onOpenChange(!open)} 
          style={{ display: 'none' }}
        >
          Toggle Unit
        </button>
        {children}
      </div>
    )
  },
  CollapsibleTrigger: ({ children }) => <div role="button">{children}</div>,
  CollapsibleContent: ({ children }) => <div>{children}</div>,
}))

// FIX 2: Mock Router Stabil untuk mencegah Infinite Loop
// Kita definisikan router di dalam factory agar referensinya TETAP (Stable Reference)
vi.mock('next/navigation', () => {
  const stableRouter = { push: vi.fn() } // Objek ini dibuat sekali saja
  return {
    useRouter: () => stableRouter, // Selalu kembalikan objek yang sama
    usePathname: () => '/asesi/learning',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetUnitsForSkema: vi.fn(),
  mockGetMateriForUnit: vi.fn(),
  mockGetProgressAsesi: vi.fn(),
  mockMarkMateriViewed: vi.fn(),
  mockMarkUnitCompleted: vi.fn(),
}))

describe('Halaman Learning', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesi-1', role: 'ASESI', skemaId: 'ADS' }, loading: false })
    
    // Mock data Unit
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([
      { id: 'u1', nomorUnit: 1, judul: 'Unit Dasar', materiCount: 1, durasiTeori: 10 }
    ])
    
    // Mock data Materi (muncul setelah unit dibuka)
    vi.mocked(apiMock.mockGetMateriForUnit).mockResolvedValue([
      { id: 'm1', judul: 'Video Intro', jenis: 'VIDEO', urlKonten: 'http://vid.com' }
    ])
    
    // Mock Progress
    vi.mocked(apiMock.mockGetProgressAsesi).mockResolvedValue({
      statusPraAsesmen: 'SELESAI', completedUnitIds: [], viewedMateriIds: []
    })
    
    // Mock respon saat materi dilihat
    vi.mocked(apiMock.mockMarkMateriViewed).mockResolvedValue({
      statusPraAsesmen: 'SELESAI', completedUnitIds: [], viewedMateriIds: ['m1']
    })
    
    vi.stubGlobal('open', vi.fn())
  })

  it('tombol buka materi harus memanggil API tracking', async () => {
    render(<LearningPage />)
    
    // 1. Tunggu Unit muncul (Pastikan loading selesai)
    await screen.findByText(/Unit 1: Unit Dasar/i)

    // 2. Klik tombol toggle rahasia untuk membuka unit
    // Ini akan memicu fungsi loadMateri di halaman
    const toggleBtns = screen.getAllByTestId('force-toggle')
    fireEvent.click(toggleBtns[0])

    // 3. Tunggu sampai materi "Video Intro" muncul
    // Karena router sudah stabil, loading tidak akan looping, dan materi akan muncul.
    await waitFor(() => {
        expect(screen.getByText('Video Intro')).toBeInTheDocument()
    })

    // 4. Klik tombol "Buka"
    const btnBuka = screen.getByText('Buka')
    fireEvent.click(btnBuka)

    // 5. Pastikan API dipanggil
    await waitFor(() => {
      expect(apiMock.mockMarkMateriViewed).toHaveBeenCalledWith('asesi-1', 'm1')
    })
  })
})