/**
 * Test Suite untuk Halaman Manajemen Skema (Admin)
 *
 * Pengujian ini memastikan:
 * 1. Halaman dapat diakses dan merender komponen utama (judul).
 * 2. Daftar skema berhasil diambil dari API dan ditampilkan.
 * 3. Navigasi dan layout dasar berfungsi (via Mock).
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SchemaPage from './page'
import { useAuth } from '@/lib/auth-context'
import * as apiMock from '@/lib/api-mock'

// Mocking Layout Utama
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mocking Next.js Navigation
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/schema',
  }
})

// Mocking Auth & API
vi.mock('@/lib/auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api-mock', () => ({
  mockGetAllSkema: vi.fn(),
  mockGetUnitsForSkema: vi.fn(),
  mockGetSoalTryoutGabungan: vi.fn(),
  mockGetSoalPraktikumGabungan: vi.fn(),
  mockGetMateriForUnit: vi.fn(),
  mockGetSoalForUnit: vi.fn(),
  mockGetYearsForSkema: vi.fn().mockResolvedValue(['2024/2025']), // Default mock tahun
}))

describe('Halaman Manajemen Skema', () => {
  beforeEach(() => {
    // Simulasi user admin login
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN_LSP' }, loading: false })

    // Simulasi data skema
    vi.mocked(apiMock.mockGetAllSkema).mockResolvedValue([
      { id: 'SKEMA-1', judul: 'Data Science' }
    ])
    vi.mocked(apiMock.mockGetUnitsForSkema).mockResolvedValue([])
    vi.mocked(apiMock.mockGetSoalTryoutGabungan).mockResolvedValue([])
    vi.mocked(apiMock.mockGetSoalPraktikumGabungan).mockResolvedValue([])
  })

  it('harus menampilkan daftar skema dengan benar', async () => {
    render(<SchemaPage />)

    // Verifikasi judul halaman
    expect(screen.getByText('Manajemen Skema & Konten')).toBeInTheDocument()

    // Verifikasi skema muncul setelah loading
    await waitFor(() => {
      expect(screen.getByText(/Data Science/i)).toBeInTheDocument()
    })
  })
})