import React from 'react'
import { render, screen } from '@testing-library/react'
import { LoadingStates, LoadingSpinner } from '../LoadingStates'

// Mock CSS import
vi.mock('../LoadingStates.css', () => ({}))

describe('LoadingStates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default message', () => {
    render(<LoadingStates />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<LoadingStates message="Custom loading message" />)

    expect(screen.getByText('Custom loading message')).toBeInTheDocument()
  })

  it('should render different types with correct default messages', () => {
    const { rerender } = render(<LoadingStates type="persons" />)
    expect(screen.getByText('Загрузка личностей...')).toBeInTheDocument()

    rerender(<LoadingStates type="quiz" />)
    expect(screen.getByText('Генерация вопросов...')).toBeInTheDocument()

    rerender(<LoadingStates type="saving" />)
    expect(screen.getByText('Сохранение изменений...')).toBeInTheDocument()

    rerender(<LoadingStates type="deleting" />)
    expect(screen.getByText('Удаление...')).toBeInTheDocument()

    rerender(<LoadingStates type="loading" />)
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('should apply size classes correctly', () => {
    const { rerender } = render(<LoadingStates size="small" />)
    let spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('loading-spinner--small')

    rerender(<LoadingStates size="medium" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('loading-spinner--medium')

    rerender(<LoadingStates size="large" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('loading-spinner--large')
  })

  it('should apply custom className', () => {
    render(<LoadingStates className="custom-class" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-class')
  })

  it('should have proper ARIA attributes', () => {
    render(<LoadingStates />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-live', 'polite')
  })

  it('should prioritize custom message over type message', () => {
    render(<LoadingStates type="persons" message="Custom message" />)

    expect(screen.getByText('Custom message')).toBeInTheDocument()
    expect(screen.queryByText('Загрузка личностей...')).not.toBeInTheDocument()
  })

  describe('LoadingSpinner', () => {
    it('should render spinner without message', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner.querySelector('.loading-spinner__inner')).toBeInTheDocument()
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument()
    })

    it('should render spinner with message', () => {
      render(<LoadingSpinner message="Spinner message" />)

      const message = screen.getByText('Spinner message')
      expect(message).toBeInTheDocument()
      expect(message).toHaveClass('loading-spinner__message')
    })

    it('should apply size classes', () => {
      const { rerender } = render(<LoadingSpinner size="small" />)
      let spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('loading-spinner--small')

      rerender(<LoadingSpinner size="large" />)
      spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('loading-spinner--large')
    })

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('custom-spinner')
    })

    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-live', 'polite')
    })
  })
})
