/**
 * Test Suite untuk Halaman Manajemen Ujian (Placeholder)
 * * Cakupan Pengujian:
 * 1. Memastikan halaman dapat diakses tanpa error (Smoke Test).
 * 2. Memastikan pesan "sedang dalam pengembangan" muncul, agar user/tester sadar fitur belum final.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminExamsPage from './page'

// Mocking komponen Layout untuk mengisolasi pengujian halaman
vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>,
}))

// Mocking Navigasi Next.js
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/admin/exams',
  }
})

describe('Halaman Manajemen Ujian (Admin)', () => {
  it('seharusnya merender halaman dan menampilkan pesan placeholder pengembangan', () => {
    render(<AdminExamsPage />)

    // Verifikasi judul halaman
    expect(screen.getByText('Manajemen Ujian')).toBeInTheDocument()
    
    // Verifikasi pesan informasi fitur belum tersedia
    expect(screen.getByText('Fitur Manajemen Ujian sedang dalam pengembangan.')).toBeInTheDocument()
  })
})