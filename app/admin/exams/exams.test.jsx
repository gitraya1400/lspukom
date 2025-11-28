import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminExamsPage from './page'

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
    usePathname: () => '/admin/exams',
  }
})

describe('Halaman Admin Exams (Placeholder)', () => {
  it('harus menampilkan pesan pengembangan', () => {
    render(<AdminExamsPage />)

    expect(screen.getByText('Manajemen Ujian')).toBeInTheDocument()
    expect(screen.getByText('Fitur Manajemen Ujian sedang dalam pengembangan.')).toBeInTheDocument()
  })
})