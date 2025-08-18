import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: 'small' | 'medium' | 'large' | 'custom'
  customWidth?: number
  customHeight?: number
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  style?: React.CSSProperties
  contentStyle?: React.CSSProperties
}

const sizeStyles = {
  small: { minWidth: 360, maxWidth: 480 },
  medium: { minWidth: 480, maxWidth: 720 },
  large: { minWidth: 720, maxWidth: 960 },
  custom: {}
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  customWidth,
  customHeight,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  style,
  contentStyle
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedBeforeModalRef = useRef<HTMLElement | null>(null)

  const trapFocus = (container: HTMLElement, e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    const list = Array.from(focusable).filter(el => el.offsetParent !== null)
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement as HTMLElement | null
    const shift = (e as any).shiftKey
    if (!shift && active === last) { e.preventDefault(); first.focus(); }
    else if (shift && active === first) { e.preventDefault(); last.focus(); }
  }

  useEffect(() => {
    if (isOpen) {
      lastFocusedBeforeModalRef.current = document.activeElement as HTMLElement
      setTimeout(() => { modalRef.current?.focus() }, 0)
    } else if (!isOpen && lastFocusedBeforeModalRef.current) {
      try { lastFocusedBeforeModalRef.current.focus() } catch {}
      lastFocusedBeforeModalRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const baseContentStyle = {
    background: 'rgba(44,24,16,0.95)',
    border: '1px solid rgba(139,69,19,0.4)',
    borderRadius: 8,
    padding: 16,
    ...sizeStyles[size],
    ...(customWidth && { width: customWidth }),
    ...(customHeight && { height: customHeight }),
    ...contentStyle
  }

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 10000,
        ...style
      }} 
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={baseContentStyle}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (modalRef.current) trapFocus(modalRef.current, e) }}
      >
        {title && (
          <div style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            marginBottom: 16, 
            borderBottom: '1px solid rgba(139,69,19,0.3)', 
            paddingBottom: 8 
          }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
