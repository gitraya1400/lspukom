import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsesiListPage from './page'
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
    usePathname: () => '/asesor/asesi-list',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({ mockGetPenugasanAsesor: vi.fn() }))

describe('Halaman Daftar Asesi (Asesor)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'asesor-1', role: 'ASESOR' }, loading: false })

    // Mock Data Asesi yang ditugaskan
    vi.mocked(apiMock.mockGetPenugasanAsesor).mockResolvedValue([
      { 
        id: 'p1', 
        asesiId: 'a1', 
        asesiNama: 'Mahasiswa Rajin', 
        asesiKelas: '4SI1',
        skemaId: 'DS',
        statusPenilaian: 'BELUM_DINILAI',
        tipe: 'TEORI',
        unitJudul: 'Unit Test'
      }
    ])
  })

  it('harus menampilkan tabel daftar asesi', async () => {
    render(<AsesiListPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Daftar Asesi', level: 1 })).toBeInTheDocument()
    })

    // Cek apakah nama mahasiswa muncul
    await waitFor(() => {
      expect(screen.getByText('Mahasiswa Rajin')).toBeInTheDocument()
      expect(screen.getByText('4SI1')).toBeInTheDocument()
    })
  })
})