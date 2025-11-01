import React, { FormEvent } from 'react'
import { Modal } from './Modal'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: FormEvent) => void | Promise<void>
  title: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  isSubmitting?: boolean
  size?: 'small' | 'medium' | 'large' | 'custom'
  customWidth?: number
}

/**
 * Reusable form modal wrapper
 * Handles form submission and provides consistent styling
 */
export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Сохранить',
  cancelText = 'Отмена',
  isSubmitting = false,
  size = 'medium',
  customWidth,
}: FormModalProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = onSubmit(e)
    if (result instanceof Promise) {
      await result
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} customWidth={customWidth}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>{children}</div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid rgba(139, 69, 19, 0.4)',
              background: 'rgba(44, 24, 16, 0.6)',
              color: '#f4e4c1',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {cancelText}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Сохранение...' : submitText}
          </button>
        </div>
      </form>
    </Modal>
  )
}




