import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastContext';
import type { AuthUser } from '../features/auth/services/auth';

// Test data factories
export const createMockUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 1,
  email: 'test@example.com',
  role: 'user',
  email_verified: true,
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: undefined,
  ...overrides,
});

export const createMockPerson = (overrides: any = {}) => ({
  id: '1',
  name: 'Test Person',
  birthYear: -500,
  deathYear: -400,
  category: 'Category1',
  country: 'Country1',
  achievements: [],
  ...overrides,
});

export const createMockQuizQuestion = (overrides: any = {}) => ({
  id: 1,
  question: 'Test question?',
  type: 'single-choice',
  options: ['Option A', 'Option B', 'Option C'],
  correctAnswer: 'Option A',
  ...overrides,
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: AuthUser | null;
  isAuthenticated?: boolean;
  initialEntries?: string[];
}

const AllTheProviders = ({ 
  children, 
  user = null, 
  isAuthenticated = false 
}: { 
  children: React.ReactNode;
  user?: AuthUser | null;
  isAuthenticated?: boolean;
}) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { user, isAuthenticated, initialEntries, ...renderOptions } = options;

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} isAuthenticated={isAuthenticated}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Helper functions for common test scenarios
export const waitForElement = async (selector: string, timeout = 1000) => {
  const { waitFor } = await import('@testing-library/react');
  return waitFor(() => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return element;
  }, { timeout });
};

export const mockApiResponse = <T,>(data: T) => {
  return {
    ok: true,
    json: async () => data,
  } as Response;
};

export const mockApiError = (message: string) => {
  return {
    ok: false,
    json: async () => ({ message }),
  } as Response;
};

// Re-export everything from testing-library
export {
  screen,
  fireEvent,
  waitFor,
  act,
  renderHook,
  createEvent,
  render,
} from '@testing-library/react';
export type { RenderResult, RenderOptions } from '@testing-library/react';

// Custom render function with providers
export const renderWithProviders = customRender;

// Helper for common test patterns
export const renderWithAuth = (ui: ReactElement, user?: AuthUser) => {
  return customRender(ui, { user, isAuthenticated: !!user });
};

export const renderWithRouter = (ui: ReactElement) => {
  return customRender(ui);
};
