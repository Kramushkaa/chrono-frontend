import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToggleButton } from '../ToggleButton'

describe('ToggleButton', () => {
  const defaultProps = {
    isActive: false,
    onClick: jest.fn(),
    title: 'Test Button',
    ariaLabel: 'Test Button',
    children: 'Test',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render toggle button', () => {
    render(<ToggleButton {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Test Button')
    expect(button).toHaveAttribute('title', 'Test Button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should show active state', () => {
    render(<ToggleButton {...defaultProps} isActive={true} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('should handle click events', () => {
    render(<ToggleButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('should handle keyboard events', () => {
    render(<ToggleButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })

    expect(defaultProps.onClick).toHaveBeenCalledTimes(2)
  })

  it('should apply custom dimensions', () => {
    render(
      <ToggleButton 
        {...defaultProps} 
        width="50px" 
        height="60px" 
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      width: '50px',
      height: '60px',
    })
  })

  it('should apply custom id', () => {
    render(<ToggleButton {...defaultProps} id="custom-id" />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('id', 'custom-id')
  })

  it('should apply aria-describedby', () => {
    render(<ToggleButton {...defaultProps} ariaDescribedBy="description-id" />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-describedby', 'description-id')
  })

  it('should handle hover state', () => {
    render(<ToggleButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    fireEvent.mouseLeave(button)

    // Component should handle hover without crashing
    expect(button).toBeInTheDocument()
  })

  it('should be focusable with tabIndex', () => {
    render(<ToggleButton {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('tabIndex', '0')
  })
})
