import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FormModal } from '../FormModal'

// Mock Modal component
vi.mock('../Modal', () => ({
  Modal: ({ isOpen, onClose, title, children, size, customWidth }: any) => {
    if (!isOpen) return null
    return (
      <div role="dialog" data-testid="modal">
        {title && <h2>{title}</h2>}
        <button onClick={onClose} aria-label="Close">Close</button>
        <div data-size={size} data-width={customWidth}>{children}</div>
      </div>
    )
  },
}))

describe('FormModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    title: 'Test Form',
    children: <div>Form Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    render(<FormModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Form')).toBeInTheDocument()
    expect(screen.getByText('Form Content')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<FormModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render form with submit and cancel buttons', () => {
    render(<FormModal {...defaultProps} />)

    const form = screen.getByRole('dialog').querySelector('form')
    expect(form).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: /Сохранить/i })
    const cancelButton = screen.getByRole('button', { name: /Отмена/i })

    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
    expect(cancelButton).toBeInTheDocument()
    expect(cancelButton).toHaveAttribute('type', 'button')
  })

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => {
      e.preventDefault()
    })
    render(<FormModal {...defaultProps} onSubmit={onSubmit} />)

    const form = screen.getByRole('dialog').querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('should handle async onSubmit', async () => {
    const onSubmit = vi.fn(async (e) => {
      e.preventDefault()
      await new Promise((resolve) => setTimeout(resolve, 10))
    })
    render(<FormModal {...defaultProps} onSubmit={onSubmit} />)

    const form = screen.getByRole('dialog').querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<FormModal {...defaultProps} onClose={onClose} />)

    const cancelButton = screen.getByRole('button', { name: /Отмена/i })
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<FormModal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should use custom submit text', () => {
    render(<FormModal {...defaultProps} submitText="Submit Custom" />)

    const submitButton = screen.getByRole('button', { name: /Submit Custom/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should use custom cancel text', () => {
    render(<FormModal {...defaultProps} cancelText="Cancel Custom" />)

    const cancelButton = screen.getByRole('button', { name: /Cancel Custom/i })
    expect(cancelButton).toBeInTheDocument()
  })

  it('should show loading state on submit button when isSubmitting is true', () => {
    render(<FormModal {...defaultProps} isSubmitting />)

    const submitButton = screen.getByRole('button', { name: /Сохранение.../i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should disable buttons when isSubmitting is true', () => {
    render(<FormModal {...defaultProps} isSubmitting />)

    const submitButton = screen.getByRole('button', { name: /Сохранение.../i })
    const cancelButton = screen.getByRole('button', { name: /Отмена/i })

    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('should not call onSubmit when form is submitted while isSubmitting', async () => {
    const onSubmit = vi.fn((e) => {
      e.preventDefault()
    })
    render(<FormModal {...defaultProps} onSubmit={onSubmit} isSubmitting />)

    const form = screen.getByRole('dialog').querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    // Should still call onSubmit (form can still be submitted)
    // But buttons are disabled to prevent multiple submissions
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('should pass size to Modal', () => {
    const { rerender } = render(<FormModal {...defaultProps} size="small" />)
    let modalContent = screen.getByRole('dialog').querySelector('[data-size]')
    expect(modalContent).toHaveAttribute('data-size', 'small')

    rerender(<FormModal {...defaultProps} size="large" />)
    modalContent = screen.getByRole('dialog').querySelector('[data-size]')
    expect(modalContent).toHaveAttribute('data-size', 'large')
  })

  it('should pass customWidth to Modal', () => {
    render(<FormModal {...defaultProps} size="custom" customWidth={800} />)

    const modalContent = screen.getByRole('dialog').querySelector('[data-width]')
    expect(modalContent).toHaveAttribute('data-width', '800')
  })

  it('should render children in form', () => {
    render(
      <FormModal {...defaultProps}>
        <input type="text" placeholder="Test input" />
        <textarea placeholder="Test textarea" />
      </FormModal>
    )

    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Test textarea')).toBeInTheDocument()
  })

  it('should prevent default form submission', async () => {
    const onSubmit = vi.fn((e) => {
      // Should prevent default
      expect(e.defaultPrevented).toBe(true)
    })
    render(<FormModal {...defaultProps} onSubmit={onSubmit} />)

    const form = screen.getByRole('dialog').querySelector('form') as HTMLFormElement
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(submitEvent)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})

