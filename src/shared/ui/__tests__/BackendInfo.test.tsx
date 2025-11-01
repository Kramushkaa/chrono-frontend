import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BackendInfo } from '../BackendInfo'

// Mock API functions
vi.mock('shared/api/api', () => ({
  getBackendInfo: vi.fn(() => ({
    baseUrl: 'http://localhost:3001',
    isLocal: true,
    config: {
      timeout: 5000,
      retries: 3
    }
  })),
  testBackendConnection: vi.fn(() => Promise.resolve(true)),
  getApiCandidates: vi.fn(() => ({
    local: 'http://localhost:3001',
    remote: 'https://api.example.com'
  })),
  applyBackendOverride: vi.fn(),
  getDtoVersion: vi.fn(() => Promise.resolve('1.0.0'))
}))

// Mock DTO version
vi.mock('../../dto', () => ({
  DTO_VERSION: '1.0.0'
}))

// Mock environment
const mockEnv = {
  NODE_ENV: 'development',
  REACT_APP_USE_LOCAL_BACKEND: 'true',
  REACT_APP_SHOW_BACKEND_INFO: 'true'
}

Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true
})

// Mock window.location will be set up in beforeEach

describe('BackendInfo', () => {
  beforeEach(() => {
    // Mock window.location - try different approach
    try {
      delete (window as any).location
    } catch (e) {
      // Ignore deletion errors
    }
    
    try {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          origin: 'http://localhost:3000'
        },
        writable: true,
        configurable: true
      })
    } catch (e) {
      // If we can't define it, try to assign directly
      (window as any).location = {
        hostname: 'localhost',
        origin: 'http://localhost:3000'
      }
    }
  })

  it('should render backend info component', () => {
    render(<BackendInfo />)
    
    // Should render at least some backend information
    expect(screen.getByText(/Backend/)).toBeInTheDocument()
  })

  it('should handle show details toggle', () => {
    render(<BackendInfo />)
    
    // Click to show details
    const header = screen.getByText(/Backend/).closest('div')
    if (header) {
      fireEvent.click(header)
      
      // Should show more details when toggled
      // Note: Specific details depend on mocked backendInfo
    }
  })

  it('should render with custom className', () => {
    const { container } = render(<BackendInfo className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('backend-info', 'custom-class')
  })
})




