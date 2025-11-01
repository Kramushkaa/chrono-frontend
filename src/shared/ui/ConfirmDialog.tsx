import React from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isProcessing?: boolean
}

/**
 * Reusable confirmation dialog
 * Reduces duplication for simple confirmation modals
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'info',
  isProcessing = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    const result = onConfirm()
    if (result instanceof Promise) {
      await result
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: {
            backgroundColor: '#dc2626',
            color: 'white',
          },
        }
      case 'warning':
        return {
          confirmButton: {
            backgroundColor: '#f59e0b',
            color: 'white',
          },
        }
      default:
        return {
          confirmButton: {
            backgroundColor: '#3b82f6',
            color: 'white',
          },
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>{message}</div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          disabled={isProcessing}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid rgba(139, 69, 19, 0.4)',
            background: 'rgba(44, 24, 16, 0.6)',
            color: '#f4e4c1',
            borderRadius: '6px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
          }}
        >
          {cancelText}
        </button>

        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            ...variantStyles.confirmButton,
          }}
        >
          {isProcessing ? 'Обработка...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}




