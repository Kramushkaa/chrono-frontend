import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DraftModerationButtons } from '../DraftModerationButtons'

describe('DraftModerationButtons', () => {
  const defaultProps = {
    mode: 'create' as const,
    onSaveDraft: vi.fn(async () => {}),
    onSubmitModeration: vi.fn(async () => {}),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render both buttons', () => {
    render(<DraftModerationButtons {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Сохранить как черновик для редактирования позже' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отправить на проверку модераторам' })).toBeInTheDocument()
  })

  it('should call onSaveDraft when draft button is clicked', async () => {
    const onSaveDraft = vi.fn(async () => {})
    render(<DraftModerationButtons {...defaultProps} onSaveDraft={onSaveDraft} />)

    const draftButton = screen.getByRole('button', { name: 'Сохранить как черновик для редактирования позже' })
    fireEvent.click(draftButton)

    await waitFor(() => {
      expect(onSaveDraft).toHaveBeenCalledTimes(1)
    })
  })

  it('should call onSubmitModeration when submit button is clicked', async () => {
    const onSubmitModeration = vi.fn(async () => {})
    render(<DraftModerationButtons {...defaultProps} onSubmitModeration={onSubmitModeration} />)

    const submitButton = screen.getByRole('button', { name: 'Отправить на проверку модераторам' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmitModeration).toHaveBeenCalledTimes(1)
    })
  })

  it('should disable buttons when disabled prop is true', () => {
    render(<DraftModerationButtons {...defaultProps} disabled />)

    const draftButton = screen.getByRole('button', { name: 'Сохранить как черновик для редактирования позже' })
    const submitButton = screen.getByRole('button', { name: 'Отправить на проверку модераторам' })

    expect(draftButton).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should disable buttons when saving prop is true', () => {
    render(<DraftModerationButtons {...defaultProps} saving />)

    const draftButton = screen.getByText('Сохраняем…').closest('button')
    const submitButton = screen.getByText('Отправляем…').closest('button')

    expect(draftButton).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should show loading text when saving is true', () => {
    render(<DraftModerationButtons {...defaultProps} saving />)

    expect(screen.getByText('Сохраняем…')).toBeInTheDocument()
    expect(screen.getByText('Отправляем…')).toBeInTheDocument()
    expect(screen.queryByText('Сохранить как черновик')).not.toBeInTheDocument()
    expect(screen.queryByText('Отправить на модерацию')).not.toBeInTheDocument()
  })

  it('should not call handlers when disabled', async () => {
    const onSaveDraft = vi.fn(async () => {})
    const onSubmitModeration = vi.fn(async () => {})
    render(
      <DraftModerationButtons
        {...defaultProps}
        disabled
        onSaveDraft={onSaveDraft}
        onSubmitModeration={onSubmitModeration}
      />
    )

    const draftButton = screen.getByRole('button', { name: 'Сохранить как черновик для редактирования позже' })
    const submitButton = screen.getByRole('button', { name: 'Отправить на проверку модераторам' })

    fireEvent.click(draftButton)
    fireEvent.click(submitButton)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(onSaveDraft).not.toHaveBeenCalled()
    expect(onSubmitModeration).not.toHaveBeenCalled()
  })

  it('should not call handlers when saving', async () => {
    const onSaveDraft = vi.fn(async () => {})
    const onSubmitModeration = vi.fn(async () => {})
    render(
      <DraftModerationButtons
        {...defaultProps}
        saving
        onSaveDraft={onSaveDraft}
        onSubmitModeration={onSubmitModeration}
      />
    )

    const draftButton = screen.getByText('Сохраняем…').closest('button')
    const submitButton = screen.getByText('Отправляем…').closest('button')

    if (draftButton) fireEvent.click(draftButton)
    if (submitButton) fireEvent.click(submitButton)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(onSaveDraft).not.toHaveBeenCalled()
    expect(onSubmitModeration).not.toHaveBeenCalled()
  })

  it('should show description when showDescription is true', () => {
    render(<DraftModerationButtons {...defaultProps} showDescription />)

    expect(screen.getByText(/изменения сохранятся/i)).toBeInTheDocument()
    expect(screen.getByText(/на проверку модераторам/i)).toBeInTheDocument()
  })

  it('should not show description when showDescription is false', () => {
    render(<DraftModerationButtons {...defaultProps} showDescription={false} />)

    expect(screen.queryByText(/изменения сохранятся/i)).not.toBeInTheDocument()
  })

  it('should display correct description text for create mode', () => {
    render(<DraftModerationButtons {...defaultProps} mode="create" showDescription />)

    expect(screen.getByText(/личность.*будут отправлены/i)).toBeInTheDocument()
  })

  it('should display correct description text for edit mode', () => {
    render(<DraftModerationButtons {...defaultProps} mode="edit" showDescription />)

    expect(screen.getByText(/изменения.*будут отправлены/i)).toBeInTheDocument()
  })

  it('should have proper ARIA labels', () => {
    render(<DraftModerationButtons {...defaultProps} />)

    const draftButton = screen.getByLabelText(/Сохранить как черновик для редактирования позже/i)
    const submitButton = screen.getByLabelText(/Отправить на проверку модераторам/i)

    expect(draftButton).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })
})
