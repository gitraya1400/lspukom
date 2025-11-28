import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SchemaPage from './page'
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
    usePathname: () => '/admin/schema',
  }
})

vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetAllSkema: vi.fn(),
  mockGetUnitsForSkema: vi.fn(),
  mockGetSoalTryoutGabungan: vi.fn(),
  mockGetSoalPraktikumGabungan: vi.fn(),
  mockGetMateriForUnit: vi.fn(),
  mockGetSoalForUnit: vi.fn(),
  mockGetYearsForSkema: vi.fn().mockResolvedValue(['2024/2025']), // Mock data tahun
}))

describe('Halaman Manajemen Skema', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })

    vi.mocked(apiMock.mockGetAllSkema).mockResolvedValue([
      { id: 'SKEMA-1', judul: 'Data Science' }
    ])
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([])
    vi.mocked(apiMock.mockGetSoalTryoutGabungan).mockResolvedValue([])
    vi.mocked(apiMock.mockGetSoalPraktikumGabungan).mockResolvedValue([])
  })

  it('harus menampilkan daftar skema', async () => {
    render(<SchemaPage />)

    expect(screen.getByText('Manajemen Skema & Konten')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Data Science/i)).toBeInTheDocument()
    })
  })
})