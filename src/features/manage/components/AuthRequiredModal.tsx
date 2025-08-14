import React, { useEffect, useRef } from 'react'
import { LoginForm } from 'features/auth/components/LoginForm'

type Props = {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  emailVerified: boolean
  onGoToProfile: () => void
}

export function AuthRequiredModal({ isOpen, onClose, isAuthenticated, emailVerified, onGoToProfile }: Props) {
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

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000 }} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{ position: 'relative', background: 'rgba(44,24,16,0.98)', border: '1px solid rgba(139,69,19,0.5)', borderRadius: 8, padding: 16, minWidth: 360, maxWidth: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (modalRef.current) trapFocus(modalRef.current, e) }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8, width: '100%' }}>
          <div style={{ fontWeight: 'bold' }}>Требуется авторизация</div>
          <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8 }}>✕</button>
        </div>
        <div style={{ marginBottom: 8, opacity: 0.9 }}>
          {isAuthenticated ? (
            emailVerified ? 'Недостаточно прав' : 'Подтвердите email, чтобы продолжить редактирование.'
          ) : 'Изменять информацию могут только авторизованные пользователи.'}
        </div>
        {!isAuthenticated && <LoginForm onSuccess={onClose} />}
        {isAuthenticated && !emailVerified && (
          <div style={{ display: 'grid', gap: 8, width: '100%' }}>
            <button onClick={onGoToProfile}>Перейти в профиль</button>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              В профиле можно повторно отправить письмо для подтверждения.
            </div>
          </div>
        )}
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
          {!isAuthenticated && <button onClick={() => { window.location.href = '/register' }}>Зарегистрироваться</button>}
        </div>
      </div>
    </div>
  )
}



