import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toasts } from '../Toasts'
import { ToastProvider, useToast } from 'shared/context/ToastContext'

// Test component to add toasts
const TestComponent = () => {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('Test success', 'success')}>Add Success</button>
      <button onClick={() => showToast('Test error', 'error')}>Add Error</button>
      <button onClick={() => showToast('Test info', 'info')}>Add Info</button>
      <Toasts />
    </div>
  )
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('Toasts', () => {
  it('should render without toasts', () => {
    render(
      <TestWrapper>
        <Toasts />
      </TestWrapper>
    )
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should render success toast', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Success'))
    
    expect(screen.getByText('Test success')).toBeInTheDocument()
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Успех: Test success')).toBeInTheDocument()
  })

  it('should render error toast', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Error'))
    
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Ошибка: Test error')).toBeInTheDocument()
  })

  it('should render info toast', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Info'))
    
    expect(screen.getByText('Test info')).toBeInTheDocument()
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Информация: Test info')).toBeInTheDocument()
  })

  it('should close toast when close button is clicked', () => {
    const TestCloseComponent = () => {
      const { showToast, removeToast } = useToast()
      return (
        <div>
          <button onClick={() => showToast('Test message', 'success')}>Add Toast</button>
          <button onClick={() => removeToast(1)}>Remove Toast</button>
          <Toasts />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestCloseComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Toast'))
    expect(screen.getByText('Test message')).toBeInTheDocument()
    
    // Find and click the close button (×)
    const closeButtons = screen.getAllByLabelText('Закрыть уведомление')
    fireEvent.click(closeButtons[0])
    
    // Toast should have 'removing' class but still be in DOM briefly (300ms animation)
    const toastElement = screen.queryByText('Test message')?.closest('.toast-item')
    expect(toastElement).toHaveClass('toast-item--removing')
  })

  it('should separate error toasts from other toasts', () => {
    const TestMultipleComponent = () => {
      const { showToast } = useToast()
      return (
        <div>
          <button onClick={() => {
            showToast('Error 1', 'error')
            showToast('Success 1', 'success')
            showToast('Info 1', 'info')
          }}>Add Multiple</button>
          <Toasts />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestMultipleComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Multiple'))
    
    // Should have separate regions for error and other toasts
    const alertRegions = screen.getAllByRole('alert')
    const statusRegions = screen.getAllByRole('status')
    
    // Error toast should be in alert region
    expect(screen.getByLabelText('Ошибка: Error 1')).toBeInTheDocument()
    expect(screen.getByText('Error 1')).toBeInTheDocument()
    
    // Success and info should be in status region
    expect(screen.getByLabelText('Успех: Success 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Информация: Info 1')).toBeInTheDocument()
    expect(screen.getByText('Success 1')).toBeInTheDocument()
    expect(screen.getByText('Info 1')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Error'))
    
    // Check the main toast container (has aria-live="assertive" for errors)
    const container = document.querySelector('.toast-container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('aria-live', 'assertive')
    expect(container).toHaveAttribute('aria-atomic', 'true')
  })

  it('should render multiple toasts', () => {
    const TestMultipleComponent = () => {
      const { showToast } = useToast()
      return (
        <div>
          <button onClick={() => {
            showToast('First toast', 'success')
            showToast('Second toast', 'info')
          }}>Add Multiple</button>
          <Toasts />
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestMultipleComponent />
      </TestWrapper>
    )
    
    fireEvent.click(screen.getByText('Add Multiple'))
    
    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })
})




