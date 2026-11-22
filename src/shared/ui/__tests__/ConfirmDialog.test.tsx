import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    message: 'Are you sure you want to proceed?',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    expect(screen.getByText('Подтверждение')).toBeInTheDocument() // default title
    expect(screen.getByText('Подтвердить')).toBeInTheDocument() // default confirm text
    expect(screen.getByText('Отмена')).toBeInTheDocument() // default cancel text
  })

  it('should not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    
    fireEvent.click(screen.getByText('Подтвердить'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByText('Отмена'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should handle async onConfirm', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    
    fireEvent.click(screen.getByText('Подтвердить'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  it('should use custom text props', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        title="Custom Title"
        message="Custom message"
        confirmText="Custom Confirm"
        cancelText="Custom Cancel"
      />
    )
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom message')).toBeInTheDocument()
    expect(screen.getByText('Custom Confirm')).toBeInTheDocument()
    expect(screen.getByText('Custom Cancel')).toBeInTheDocument()
  })

  it('should show processing state', () => {
    render(<ConfirmDialog {...defaultProps} isProcessing={true} />)
    
    const confirmButton = screen.getByText('Обработка...')
    const cancelButton = screen.getByText('Отмена')
    
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('should apply danger variant styles', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />)
    
    const confirmButton = screen.getByText('Подтвердить')
    expect(confirmButton).toHaveStyle({ backgroundColor: '#dc2626' })
  })

  it('should apply warning variant styles', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />)
    
    const confirmButton = screen.getByText('Подтвердить')
    expect(confirmButton).toHaveStyle({ backgroundColor: '#f59e0b' })
  })

  it('should apply default variant styles', () => {
    render(<ConfirmDialog {...defaultProps} variant="info" />)
    
    const confirmButton = screen.getByText('Подтвердить')
    expect(confirmButton).toHaveStyle({ backgroundColor: '#3b82f6' })
  })

  it('should disable buttons when processing', () => {
    render(<ConfirmDialog {...defaultProps} isProcessing={true} />)
    
    const confirmButton = screen.getByText('Обработка...')
    const cancelButton = screen.getByText('Отмена')
    
    expect(confirmButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('should enable buttons when not processing', () => {
    render(<ConfirmDialog {...defaultProps} isProcessing={false} />)
    
    const confirmButton = screen.getByText('Подтвердить')
    const cancelButton = screen.getByText('Отмена')
    
    expect(confirmButton).not.toBeDisabled()
    expect(cancelButton).not.toBeDisabled()
  })
})




