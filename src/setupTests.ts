import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (global as any).jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (global as any).jest.fn(), // deprecated
    removeListener: (global as any).jest.fn(), // deprecated
    addEventListener: (global as any).jest.fn(),
    removeEventListener: (global as any).jest.fn(),
    dispatchEvent: (global as any).jest.fn(),
  })),
})

// Mock IntersectionObserver
;(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null
  rootMargin = ''
  thresholds = []
  takeRecords() { return [] }
}

// Mock ResizeObserver
;(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: (global as any).jest.fn(),
  setItem: (global as any).jest.fn(),
  removeItem: (global as any).jest.fn(),
  clear: (global as any).jest.fn(),
  length: 0,
  key: (global as any).jest.fn(),
}
;(global as any).localStorage = localStorageMock

// Mock fetch
;(global as any).fetch = (global as any).jest.fn()

// Suppress console warnings in tests (only in test environment)
if ((global as any).beforeAll) {
  const originalError = console.error
  ;(global as any).beforeAll(() => {
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning: ReactDOM.render is no longer supported')
      ) {
        return
      }
      originalError.call(console, ...args)
    }
  })

  ;(global as any).afterAll(() => {
    console.error = originalError
  })
}
