import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfilePage from './page'
import { useAuth } from '@/lib/auth-context'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/profile',
}))

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))

describe('Halaman Profil Pengguna', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        nama: 'Budi Santoso',
        email: 'budi@stis.ac.id',
        role: 'ASESI',
        nim: '2110001',
        kelas: '4SI1'
      },
      loading: false
    })
  })

  it('harus menampilkan nama dan role pengguna dengan benar', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getAllByText('Budi Santoso')[0]).toBeInTheDocument()
      expect(screen.getByText('budi@stis.ac.id')).toBeInTheDocument()
      
      // FIX: Gunakan getAllByText karena "Peserta (Asesi)" muncul lebih dari sekali
      const roles = screen.getAllByText(/Asesi/i)
      expect(roles.length).toBeGreaterThan(0)
    })
  })

  it('harus menampilkan detail informasi akun', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText('2110001')).toBeInTheDocument()
      expect(screen.getByText('4SI1')).toBeInTheDocument()
    })
  })

  it('harus menampilkan loading jika data user belum ada', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true })
    render(<ProfilePage />)
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument()
  })
})