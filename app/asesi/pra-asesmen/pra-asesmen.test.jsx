import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PraAsesmenPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// FIX: Mock MainLayout (Penting karena halaman ini ada Layout)
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// FIX: Mock AlertDialog agar tidak bentrok heading
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }) => <div>{children}</div>,
  AlertDialogContent: ({ children }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }) => <div role="status">{children}</div>, // Ganti role agar tidak terdeteksi heading
  AlertDialogDescription: ({ children }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }) => <div>{children}</div>,
  AlertDialogAction: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
}))

// FIX: Mock Navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/asesi/pra-asesmen',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetProgressAsesi: vi.fn(),
  mockSubmitPraAsesmen: vi.fn(),
}))

describe('Halaman Pra-Asesmen', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: 'asesi-1', nama: 'Budi', role: 'ASESI' }, 
      loading: false 
    })
    vi.mocked(apiMock.mockGetProgressAsesi).mockResolvedValue({ statusPraAsesmen: 'BELUM' })
  })

  it('harus memvalidasi input sebelum simpan', async () => {
    render(<PraAsesmenPage />)
    
    // Pastikan judul halaman muncul
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Pra-Asesmen', level: 1 })).toBeInTheDocument()
    })

    // Isi sebagian data (misal Telepon)
    const telInput = screen.getByLabelText(/Nomor Telepon/i)
    fireEvent.change(telInput, { target: { value: '0812345' } })
    
    // Klik simpan tanpa mengisi tanggal lahir (wajib)
    const saveButton = screen.getByText(/Simpan Data dan Lanjut/i)
    fireEvent.click(saveButton)

    // Harapkan error validasi muncul di dialog
    await waitFor(() => {
      // Karena mock AlertDialogTitle kita ubah rolenya, kita cari teksnya saja
      expect(screen.getByText(/Validasi Gagal/i)).toBeInTheDocument()
    })
  })
})