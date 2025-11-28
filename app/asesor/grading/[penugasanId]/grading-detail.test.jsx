import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GradingDetailPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mock Layout dll
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mock Dialog
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }) => open ? <div>{children}</div> : null,
  AlertDialogContent: ({ children }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }) => <div>{children}</div>,
  AlertDialogAction: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ onClick, children }) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ penugasanId: 'tugas-101' }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/asesor/grading/tugas-101',
}))

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetPenugasanDetail: vi.fn(),
  mockSubmitNilai: vi.fn(),
}))

describe('Halaman Form Penilaian (Grading Detail)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ASESOR' }, loading: false })
    vi.mocked(apiMock.mockGetPenugasanDetail).mockResolvedValue({
      id: 'tugas-101',
      asesiNama: 'Budi Santoso',
      tipe: 'PRAKTIKUM',
      unitJudul: 'Studi Kasus Data Science',
      statusPenilaian: 'BELUM_DINILAI'
    })
  })

  it('harus menampilkan form penilaian dan bisa submit', async () => {
    render(<GradingDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
    })

    // FIX: Tangani radio button ganda
    // Cari semua elemen dengan label 'Kompeten' (case insensitive)
    const radios = screen.getAllByLabelText(/Kompeten/i)
    // Ambil yang pertama (biasanya yang benar)
    const radioKompeten = radios[0]
    
    expect(radioKompeten).toBeInTheDocument()
    
    // Klik radio button
    fireEvent.click(radioKompeten)

    // Klik Simpan
    const saveBtn = screen.getByText(/Simpan Penilaian/i)
    fireEvent.click(saveBtn)

    // Klik Konfirmasi di Dialog
    const confirmBtn = screen.getByText(/Ya, Simpan/i)
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(apiMock.mockSubmitNilai).toHaveBeenCalled()
    })
  })
})