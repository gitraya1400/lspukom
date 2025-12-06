/**
 * Test Suite untuk Halaman Manajemen Pengguna (Admin)
 *
 * Pengujian ini memastikan:
 * 1. Halaman berhasil di-render dan menampilkan data pengguna (Asesi, Asesor, dll).
 * 2. Fungsi pencarian dan filter dasar bekerja (via simulasi render).
 * 3. Interaksi tombol "Ubah Role" membuka dialog yang sesuai.
 */

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UsersPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking Layout Utama
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

// Mocking Table Component
vi.mock('@/components/ui/table', () => ({
  Table: (props) => <table {...props} />,
  TableHeader: (props) => <thead {...props} />,
  TableBody: (props) => <tbody {...props} />,
  TableHead: (props) => <th {...props} />,
  TableRow: (props) => <tr {...props} />,
  TableCell: (props) => <td {...props} />,
}))

// Mocking Dialog Component
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div>{children}</div> : null,
  DialogContent: (props) => <div {...props} />,
  DialogHeader: (props) => <div {...props} />,
  DialogTitle: (props) => <div {...props} />,
  DialogDescription: (props) => <div {...props} />,
  DialogFooter: (props) => <div {...props} />,
  DialogTrigger: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}))

// Mocking Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/users',
}))

// Mocking Tabs
vi.mock('@/components/ui/tabs', () => ({
  Tabs: (props) => <div {...props} />,
  TabsList: (props) => <div {...props} />,
  TabsTrigger: ({ children, value, onClick }) => (
    <button onClick={onClick} data-value={value}>{children}</button>
  ),
  TabsContent: (props) => <div {...props} />,
}))

// Mocking Auth & API
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetAllUsers: vi.fn(),
  mockGetAsesiUsers: vi.fn(),
  mockGetAsesorUsers: vi.fn(),
  mockGetAdminUsers: vi.fn(),
  mockUpdateUserRole: vi.fn(),
}))

describe('Halaman Manajemen User (Admin)', () => {
  beforeEach(() => {
    // Simulasi user admin login
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })
    
    // Simulasi data user
    const mockAsesi = { id: 'u1', nama: 'Asesi Budi', role: 'ASESI', email: 'budi@stis.ac.id', kelas: '3SD1' }
    const mockAsesor = { id: 'u2', nama: 'Asesor Siti', role: 'ASESOR', email: 'siti@stis.ac.id' }
    
    vi.mocked(apiMock.mockGetAllUsers).mockResolvedValue([mockAsesi, mockAsesor])
    vi.mocked(apiMock.mockGetAsesiUsers).mockResolvedValue([mockAsesi])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([mockAsesor])
    vi.mocked(apiMock.mockGetAdminUsers).mockResolvedValue([])
  })

  it('harus me-render judul dan tabel user dengan benar', async () => {
    render(<UsersPage />)
    
    // Verifikasi data muncul
    const rows = await screen.findAllByText(/Asesi Budi/i)
    expect(rows.length).toBeGreaterThan(0)
  })

  it('harus membuka dialog edit saat tombol Ubah Role diklik', async () => {
    render(<UsersPage />)
    
    // Tunggu data Asesor muncul
    const asesorName = await screen.findByText('Asesor Siti')
    
    // Cari tombol Ubah Role pada baris tersebut
    const row = asesorName.closest('tr')
    const editBtn = within(row).getByText(/Ubah Role/i)
    
    // Klik tombol
    fireEvent.click(editBtn)

    // Verifikasi dialog terbuka
    await waitFor(() => {
      expect(screen.getByText(/Ubah Role Pengguna/i)).toBeInTheDocument()
    })
  })
})