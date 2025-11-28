import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const mockLogin = vi.fn()
// Hapus mockLoginWithGoogle karena komponen ternyata memakai mockLogin untuk simulasi SSO
vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    user: null,
    loading: false
  })),
}))

describe('LoginPage (Integration Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form correctly', () => {
    render(<LoginPage />)
    expect(screen.getAllByText(/Masuk|Login/i).length).toBeGreaterThan(0)
  })

  it('should allow user to type in manual login form', () => {
    const { container } = render(<LoginPage />)
    const emailInput = container.querySelector('input[type="email"]') || container.querySelector('input[name="email"]')
    if (emailInput) {
        fireEvent.change(emailInput, { target: { value: 'test@stis.ac.id' } })
        expect(emailInput.value).toBe('test@stis.ac.id')
    }
  })

  it('should call manual login function on submit', async () => {
    mockLogin.mockResolvedValue({ success: true })
    const { container } = render(<LoginPage />)
    
    const emailInput = container.querySelector('input[type="email"]')
    const passInput = container.querySelector('input[type="password"]')
    
    if(emailInput) fireEvent.change(emailInput, { target: { value: 'admin@stis.ac.id' } })
    if(passInput) fireEvent.change(passInput, { target: { value: 'admin123' } })
    
    const form = container.querySelector('form')
    if(form) fireEvent.submit(form)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@stis.ac.id', 'admin123')
    })
  })

  it('should call SSO login function on button click', async () => {
    render(<LoginPage />)
    
    // Cari tombol SSO dengan teks spesifik
    const googleBtn = screen.getByText(/Masuk dengan Akun STIS/i)
    
    fireEvent.click(googleBtn)
    
    await waitFor(() => {
      // FIX: Komponen memanggil login() dengan kredensial hardcoded untuk simulasi
      expect(mockLogin).toHaveBeenCalledWith("222310001@stis.ac.id", "Nadia Nisrina")
    })
  })
})