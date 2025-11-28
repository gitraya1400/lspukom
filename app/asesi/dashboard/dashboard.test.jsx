import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsesiDashboard from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// FIX: Isolasi MainLayout
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// FIX: Mock Navigation
const mockPush = vi.fn()
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    usePathname: () => '/asesi/dashboard',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetProgressAsesi: vi.fn() }))

const mockUser = { id: 'asesi-test', nama: 'Asesi Test', skemaId: 'ADS', role: 'ASESI' }

// Helper untuk mencari kartu fase
const findFaseCardByPhaseLabel = (faseLabelText) => {
    const labels = screen.getAllByText(faseLabelText)
    return labels[0].closest('.shadow-sm')
}

describe('AsesiDashboard (Logika Fase)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, isLoggedIn: true, loading: false })
    mockPush.mockClear()
    vi.mocked(apiMock.mockGetProgressAsesi).mockClear()
  })

  it('should redirect to Pra-Asesmen page if statusPraAsesmen is BELUM', async () => {
    vi.mocked(apiMock.mockGetProgressAsesi).mockResolvedValue({ statusPraAsesmen: 'BELUM' })
    
    render(<AsesiDashboard />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/asesi/pra-asesmen')
    })
  })

  it('should show Pembelajaran as ACTIVE and others as TERKUNCI when progress is 0%', async () => {
    vi.mocked(apiMock.mockGetProgressAsesi).mockResolvedValue({ 
      statusPraAsesmen: 'SELESAI', progressPembelajaran: 0, tryoutSelesai: false,
    })
    
    render(<AsesiDashboard />)
    
    await waitFor(() => {
        const card = findFaseCardByPhaseLabel('Fase 1: Pembelajaran')
        expect(within(card).getByRole('link', { name: /Mulai/i })).toBeInTheDocument()
        
        const tryoutCard = findFaseCardByPhaseLabel('Fase 2: Tryout')
        expect(within(tryoutCard).getByText(/Terkunci/i)).toBeInTheDocument()
    })
  })
  
  it('should show Tryout as ACTIVE when Pembelajaran is 100%', async () => {
    vi.mocked(apiMock.mockGetProgressAsesi).mockResolvedValue({ 
      statusPraAsesmen: 'SELESAI', progressPembelajaran: 100, tryoutSelesai: false,
    })
    
    render(<AsesiDashboard />)
    
    await waitFor(() => {
        const card = findFaseCardByPhaseLabel('Fase 2: Tryout')
        expect(within(card).getByRole('link', { name: /Mulai/i })).toBeInTheDocument()
    })
  })
})