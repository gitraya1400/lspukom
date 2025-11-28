import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UsersPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div>{children}</div>,
}))

// FIX: Mock Table dengan spread props
vi.mock('@/components/ui/table', () => ({
  Table: (props) => <table {...props} />,
  TableHeader: (props) => <thead {...props} />,
  TableBody: (props) => <tbody {...props} />,
  TableHead: (props) => <th {...props} />,
  TableRow: (props) => <tr {...props} />,
  TableCell: (props) => <td {...props} />,
}))

// FIX: Mock Dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div>{children}</div> : null,
  DialogContent: (props) => <div {...props} />,
  DialogHeader: (props) => <div {...props} />,
  DialogTitle: (props) => <div {...props} />,
  DialogDescription: (props) => <div {...props} />,
  DialogFooter: (props) => <div {...props} />,
  DialogTrigger: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/users',
}))

// FIX: Mock Tabs sederhana
vi.mock('@/components/ui/tabs', () => ({
  Tabs: (props) => <div {...props} />,
  TabsList: (props) => <div {...props} />,
  TabsTrigger: ({ children, value, onClick }) => (
    <button onClick={onClick} data-value={value}>{children}</button>
  ),
  TabsContent: (props) => <div {...props} />,
}))

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
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })
    
    const mockAsesi = { id: 'u1', nama: 'Asesi Budi', role: 'ASESI', email: 'budi@stis.ac.id', kelas: '3SD1' }
    const mockAsesor = { id: 'u2', nama: 'Asesor Siti', role: 'ASESOR', email: 'siti@stis.ac.id' }
    
    vi.mocked(apiMock.mockGetAllUsers).mockResolvedValue([mockAsesi, mockAsesor])
    vi.mocked(apiMock.mockGetAsesiUsers).mockResolvedValue([mockAsesi])
    vi.mocked(apiMock.mockGetAsesorUsers).mockResolvedValue([mockAsesor])
    vi.mocked(apiMock.mockGetAdminUsers).mockResolvedValue([])
  })

  it('harus me-render judul dan tabel user dengan benar', async () => {
    render(<UsersPage />)
    const rows = await screen.findAllByText(/Asesi Budi/i)
    expect(rows.length).toBeGreaterThan(0)
  })

  it('harus membuka dialog edit saat tombol Ubah Role diklik', async () => {
    render(<UsersPage />)
    
    // 1. Tunggu data Asesor muncul di layar
    const asesorName = await screen.findByText('Asesor Siti')
    
    // 2. Cari baris (row) tabel yang mengandung 'Asesor Siti'
    // Ini memastikan kita mengklik tombol milik Asesor, bukan Asesi
    const row = asesorName.closest('tr')
    expect(row).toBeInTheDocument()
    
    // 3. Cari tombol "Ubah Role" spesifik di dalam baris tersebut
    const editBtn = within(row).getByText(/Ubah Role/i)
    
    // 4. Klik tombol
    fireEvent.click(editBtn)

    // 5. Assert Dialog terbuka
    await waitFor(() => {
      expect(screen.getByText(/Ubah Role Pengguna/i)).toBeInTheDocument()
    })
  })
})