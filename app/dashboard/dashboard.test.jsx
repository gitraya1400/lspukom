import { render, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './page'
import { useAuth } from '@/lib/auth-context'

const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', async (importOriginal) => {
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
    }),
    usePathname: () => '/dashboard',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))

describe('Halaman Utama Dashboard (Redirector)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('harus redirect ke login jika user belum login', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, isLoggedIn: false, loading: false })
    render(<DashboardPage />)
    await waitFor(() => {
      const calls = [...mockPush.mock.calls, ...mockReplace.mock.calls]
      expect(calls.some(c => c[0].includes('/login'))).toBe(true)
    })
  })

  it('harus redirect ke dashboard ASESI jika role user adalah ASESI', async () => {
    // FIX: Tambahkan isLoggedIn: true
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ASESI' }, isLoggedIn: true, loading: false })
    render(<DashboardPage />)
    await waitFor(() => {
      const calls = [...mockPush.mock.calls, ...mockReplace.mock.calls]
      expect(calls.some(c => c[0].includes('/asesi/dashboard'))).toBe(true)
    })
  })

  it('harus redirect ke dashboard ASESOR jika role user adalah ASESOR', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ASESOR' }, isLoggedIn: true, loading: false })
    render(<DashboardPage />)
    await waitFor(() => {
      const calls = [...mockPush.mock.calls, ...mockReplace.mock.calls]
      expect(calls.some(c => c[0].includes('/asesor/dashboard'))).toBe(true)
    })
  })

  it('harus redirect ke dashboard ADMIN jika role user adalah ADMIN_LSP', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, isLoggedIn: true, loading: false })
    render(<DashboardPage />)
    await waitFor(() => {
      const calls = [...mockPush.mock.calls, ...mockReplace.mock.calls]
      expect(calls.some(c => c[0].includes('/admin/dashboard'))).toBe(true)
    })
  })
})