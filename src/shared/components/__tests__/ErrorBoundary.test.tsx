import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'
import { ErrorFallback } from '../ErrorFallback'

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Mock window.location (используем delete для избежания ошибки redefine)
let mockLocationHref = ''
const mockLocation = {
  get href() { return mockLocationHref },
  set href(value: string) { mockLocationHref = value },
  reload: jest.fn(),
}
try {
  delete (window as any).location
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  })
} catch (e) {
  // Already mocked, that's okay
}

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary')
  }
  return <div>No error</div>
}

// Component that doesn't throw
const NoError: React.FC = () => <div>No error</div>

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset location mock
    mockLocationHref = ''
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render ErrorFallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    expect(screen.getByText(/Произошла непредвиденная ошибка/)).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
  })

  it('should reset error state when reset button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Should show error initially
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()

    // Click reset button
    const resetButton = screen.getByText('Попробовать снова')
    fireEvent.click(resetButton)

    // Should still show error because ThrowError will throw again
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
  })

  it('should handle error in componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary:',
      expect.any(Error),
      expect.any(Object)
    )
  })
})

describe('ErrorFallback', () => {
  beforeEach(() => {
    mockLocationHref = ''
  })

  it('should render error message', () => {
    const error = new Error('Test error message')
    render(<ErrorFallback error={error} errorInfo={null} />)

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    expect(screen.getByText(/Произошла непредвиденная ошибка/)).toBeInTheDocument()
  })

  it('should show reset button when onReset is provided', () => {
    const onReset = jest.fn()
    render(
      <ErrorFallback 
        error={new Error('Test error')} 
        errorInfo={null} 
        onReset={onReset}
      />
    )

    const resetButton = screen.getByText('Попробовать снова')
    expect(resetButton).toBeInTheDocument()

    fireEvent.click(resetButton)
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should not show reset button when onReset is not provided', () => {
    render(
      <ErrorFallback 
        error={new Error('Test error')} 
        errorInfo={null}
      />
    )

    expect(screen.queryByText('Попробовать снова')).not.toBeInTheDocument()
  })

  it('should navigate to home when home button is clicked', () => {
    render(
      <ErrorFallback 
        error={new Error('Test error')} 
        errorInfo={null}
      />
    )

    const homeButton = screen.getByText('На главную')
    fireEvent.click(homeButton)

    expect(mockLocationHref).toBe('/')
  })

  it('should show error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const error = new Error('Test error message')
    error.stack = 'Error stack trace'
    const errorInfo = {
      componentStack: 'Component stack trace',
    }

    render(
      <ErrorFallback 
        error={error} 
        errorInfo={errorInfo}
      />
    )

    expect(screen.getByText('Информация об ошибке (dev mode)')).toBeInTheDocument()

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should not show error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const error = new Error('Test error message')
    error.stack = 'Error stack trace'

    render(
      <ErrorFallback 
        error={error} 
        errorInfo={null}
      />
    )

    expect(screen.queryByText('Информация об ошибке (dev mode)')).not.toBeInTheDocument()

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should handle hover effects on buttons', () => {
    render(
      <ErrorFallback 
        error={new Error('Test error')} 
        errorInfo={null}
      />
    )

    const homeButton = screen.getByText('На главную')
    
    // Test hover enter
    fireEvent.mouseEnter(homeButton)
    
    // Test hover leave
    fireEvent.mouseLeave(homeButton)

    // The actual style changes are inline and hard to test directly,
    // but we can ensure the handlers don't throw
    expect(homeButton).toBeInTheDocument()
  })
})
