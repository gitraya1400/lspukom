import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserver)

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Next/Image (Fix warning non-boolean attribute)
vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }) => {
    return React.createElement('img', {
      ...props,
      // Konversi prop boolean ke string agar tidak warning di console test
      ...(fill ? { 'data-fill': 'true' } : {}),
      ...(priority ? { 'data-priority': 'true' } : {}),
    })
  },
}))

// Mock Navigation Global
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  useServerInsertedHTML: vi.fn(),
}))

// Mock DOM APIs
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  window.HTMLElement.prototype.releasePointerCapture = vi.fn()
  window.HTMLElement.prototype.hasPointerCapture = vi.fn()
  window.scrollTo = vi.fn()
}

// Mock PointerEvent
class MockPointerEvent extends Event {
  constructor(type, props) {
    super(type, props)
    this.button = props?.button || 0
    this.ctrlKey = props?.ctrlKey || false
    this.pointerType = props?.pointerType || 'mouse'
  }
}
window.PointerEvent = MockPointerEvent