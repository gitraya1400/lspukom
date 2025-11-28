import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminDashboard from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// FIX: Mock MainLayout (Isolasi UI)
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// FIX: Mock Navigation Lengkap
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/dashboard',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetStatistics: vi.fn() }))

describe('Halaman Dashboard Admin', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })
    
    vi.mocked(apiMock.mockGetStatistics).mockResolvedValue({
      totalAsesi: 100,
      totalAsesor: 10,
      pendingGrading: 5,
      readyForExam: 20
    })
  })

  it('harus menampilkan kartu statistik dengan benar', async () => {
    render(<AdminDashboard />)

    expect(screen.getByText('Dashboard Admin LSP')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument() // Total Asesi
      expect(screen.getByText('10')).toBeInTheDocument()  // Total Asesor
      expect(screen.getByText('5')).toBeInTheDocument()   // Penilaian Tertunda
    })
  })
})