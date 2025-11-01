import React from 'react'
import { LoginForm } from 'features/auth/components/LoginForm'
import { Modal } from 'shared/ui/Modal'

type Props = {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  emailVerified: boolean
  onGoToProfile: () => void
}

export function AuthRequiredModal({ isOpen, onClose, isAuthenticated, emailVerified, onGoToProfile }: Props) {
  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      title="Требуется авторизация"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
    </Modal>
  )
}






