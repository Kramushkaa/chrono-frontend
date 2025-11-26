import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditWarningModal } from '../EditWarningModal'

describe('EditWarningModal', () => {
  const defaultProps = {
    isOpen: true,
    personName: 'Test Person',
    onRevertToDraft: vi.fn(async () => {}),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when closed', () => {
    render(<EditWarningModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    render(<EditWarningModal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Редактирование недоступно/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Person/i)).toBeInTheDocument()
  })

  it('should display person name in warning message', () => {
    render(<EditWarningModal {...defaultProps} personName="Иван Иванов" />)

    expect(screen.getByText(/«Иван Иванов»/i)).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<EditWarningModal {...defaultProps} onCancel={onCancel} />)

    const cancelButton = screen.getByRole('button', { name: /Отмена/i })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onRevertToDraft when revert button is clicked', async () => {
    const onRevertToDraft = vi.fn(async () => {})
    render(<EditWarningModal {...defaultProps} onRevertToDraft={onRevertToDraft} />)

    const revertButton = screen.getByRole('button', { name: /Вернуть в черновики/i })
    fireEvent.click(revertButton)

    await waitFor(() => {
      expect(onRevertToDraft).toHaveBeenCalledTimes(1)
    })
  })

  it('should disable buttons when isReverting is true', () => {
    render(<EditWarningModal {...defaultProps} isReverting />)

    const cancelButton = screen.getByRole('button', { name: /Отмена/i })
    const revertButton = screen.getByRole('button', { name: /Возвращаем.../i })

    expect(cancelButton).toBeDisabled()
    expect(revertButton).toBeDisabled()
  })

  it('should show loading text when isReverting is true', () => {
    render(<EditWarningModal {...defaultProps} isReverting />)

    expect(screen.getByText(/Возвращаем.../i)).toBeInTheDocument()
    expect(screen.queryByText(/Вернуть в черновики/i)).not.toBeInTheDocument()
  })

  it('should not call onRevertToDraft when isReverting is true', async () => {
    const onRevertToDraft = vi.fn(async () => {})
    render(<EditWarningModal {...defaultProps} onRevertToDraft={onRevertToDraft} isReverting />)

    const revertButton = screen.getByRole('button', { name: /Возвращаем.../i })
    fireEvent.click(revertButton)

    // Wait a bit to ensure the handler doesn't run
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(onRevertToDraft).not.toHaveBeenCalled()
  })

  it('should have proper ARIA attributes', () => {
    render(<EditWarningModal {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should display informative messages', () => {
    render(<EditWarningModal {...defaultProps} />)

    expect(screen.getByText(/находится на модерации/i)).toBeInTheDocument()
    expect(screen.getByText(/Редактировать можно только черновики/i)).toBeInTheDocument()
    expect(screen.getByText(/также станут черновиками/i)).toBeInTheDocument()
  })
})

