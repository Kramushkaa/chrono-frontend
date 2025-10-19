import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../Modal'

// Mock CSS import
jest.mock('../Modal.css', () => ({}))

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Test content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when open', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByLabelText('Закрыть модальное окно')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByLabelText('Закрыть модальное окно'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should render title when provided', () => {
    render(<Modal {...defaultProps} title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render without title when not provided', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('should call onClose when backdrop is clicked and closeOnBackdropClick is true', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={true} />)
    
    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when backdrop is clicked and closeOnBackdropClick is false', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />)
    
    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should not call onClose when modal content is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={true} />)
    
    const modalContent = screen.getByText('Test content')
    fireEvent.click(modalContent)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should handle escape key when closeOnEscape is true', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={true} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not handle escape key when closeOnEscape is false', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should apply correct size styles', () => {
    const { rerender } = render(<Modal {...defaultProps} size="small" />)
    
    let modalContent = screen.getByRole('dialog').querySelector('.modal-content')
    expect(modalContent).toHaveStyle({ minWidth: '320px', maxWidth: '480px' })

    rerender(<Modal {...defaultProps} size="large" />)
    modalContent = screen.getByRole('dialog').querySelector('.modal-content')
    expect(modalContent).toHaveStyle({ minWidth: '320px', maxWidth: '960px' })
  })

  it('should apply custom width and height when provided', () => {
    render(<Modal {...defaultProps} size="custom" customWidth={500} customHeight={300} />)
    
    const modalContent = screen.getByRole('dialog').querySelector('.modal-content')
    expect(modalContent).toHaveStyle({ width: '500px', height: '300px' })
  })

  it('should have proper accessibility attributes', () => {
    render(<Modal {...defaultProps} title="Test Title" />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('role', 'dialog')
  })
})
