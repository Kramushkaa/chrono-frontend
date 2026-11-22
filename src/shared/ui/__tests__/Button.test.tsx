import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  const defaultProps = {
    onClick: vi.fn(),
    children: 'Test Button',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render button with default props', () => {
    render(<Button {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('button')
    expect(button).toHaveClass('button--secondary')
    expect(button).toHaveClass('button--medium')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should render with custom children', () => {
    render(<Button onClick={vi.fn()}>Custom Text</Button>)

    const button = screen.getByRole('button', { name: 'Custom Text' })
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Custom Text')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)

    const button = screen.getByRole('button', { name: 'Click Me' })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply variant classes correctly', () => {
    const { rerender } = render(<Button {...defaultProps} variant="primary" />)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('button--primary')

    rerender(<Button {...defaultProps} variant="secondary" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('button--secondary')

    rerender(<Button {...defaultProps} variant="danger" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('button--danger')
  })

  it('should apply size classes correctly', () => {
    const { rerender } = render(<Button {...defaultProps} size="small" />)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('button--small')

    rerender(<Button {...defaultProps} size="medium" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('button--medium')

    rerender(<Button {...defaultProps} size="large" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('button--large')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('should be disabled when loading is true', () => {
    render(<Button {...defaultProps} loading />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('should show loading spinner when loading is true', () => {
    render(<Button {...defaultProps} loading>Loading...</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('button--loading')
    
    // Check for loading spinner
    const spinner = screen.getByRole('status', { name: 'Загрузка' })
    expect(spinner).toBeInTheDocument()
  })

  it('should apply loading class to content when loading', () => {
    render(<Button {...defaultProps} loading>Button Text</Button>)

    const content = screen.getByText('Button Text')
    expect(content).toHaveClass('button__content--loading')
  })

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button {...defaultProps} disabled onClick={handleClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should not call onClick when loading', () => {
    const handleClick = vi.fn()
    render(<Button {...defaultProps} loading onClick={handleClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should apply HTML button type correctly', () => {
    const { rerender } = render(<Button {...defaultProps} type="submit" />)
    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')

    rerender(<Button {...defaultProps} type="reset" />)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'reset')

    rerender(<Button {...defaultProps} type="button" />)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should pass through additional HTML attributes', () => {
    render(<Button {...defaultProps} id="test-id" data-testid="custom-button" />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('id', 'test-id')
    expect(button).toHaveAttribute('data-testid', 'custom-button')
  })

  it('should handle click event object correctly', () => {
    const handleClick = vi.fn((e) => {
      expect(e).toBeDefined()
      expect(e.type).toBe('click')
    })

    render(<Button onClick={handleClick}>Click Me</Button>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render without onClick handler', () => {
    render(<Button>No Click Handler</Button>)

    const button = screen.getByRole('button', { name: 'No Click Handler' })
    expect(button).toBeInTheDocument()
    
    // Should not crash on click
    fireEvent.click(button)
  })

  it('should combine multiple classes correctly', () => {
    render(
      <Button
        {...defaultProps}
        variant="primary"
        size="large"
        className="extra-class"
        loading
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('button')
    expect(button).toHaveClass('button--primary')
    expect(button).toHaveClass('button--large')
    expect(button).toHaveClass('button--loading')
    expect(button).toHaveClass('extra-class')
  })

  it('should render complex children correctly', () => {
    render(
      <Button onClick={vi.fn()}>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })
})

