import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackendInfo } from '../BackendInfo';

vi.mock('shared/api/core', () => ({
  getBackendInfo: vi.fn(() => ({
    baseUrl: 'http://localhost:3001',
    isLocal: true,
    config: {
      timeout: 5000,
      retries: 3,
    },
  })),
  testBackendConnection: vi.fn(() => Promise.resolve(true)),
  getApiCandidates: vi.fn(() => ({
    local: 'http://localhost:3001',
    remote: 'https://api.example.com',
  })),
  applyBackendOverride: vi.fn(),
}));

vi.mock('shared/api/meta', () => ({
  getDtoVersion: vi.fn(() => Promise.resolve('1.0.0')),
}));

vi.mock('shared/dto/dtoDescriptors', () => ({
  DTO_VERSION: '1.0.0',
}));

describe('BackendInfo', () => {
  beforeEach(() => {
    Object.assign(import.meta.env, {
      MODE: 'development',
      VITE_USE_LOCAL_BACKEND: 'true',
      VITE_SHOW_BACKEND_INFO: 'true',
    });

    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  it('renders backend info summary', () => {
    render(<BackendInfo />);
    expect(screen.getByText(/Backend/)).toBeInTheDocument();
  });

  it('toggles details on header click', () => {
    render(<BackendInfo />);
    const header = screen.getByText(/Backend/).closest('div');
    if (header) {
      fireEvent.click(header);
      expect(screen.getByText(/Таймаут/)).toBeInTheDocument();
    }
  });

  it('respects custom className', () => {
    const { container } = render(<BackendInfo className="custom-class" />);
    expect(container.firstChild).toHaveClass('backend-info', 'custom-class');
  });
});

