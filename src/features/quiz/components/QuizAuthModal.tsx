import React from 'react';
import { LoginForm } from 'features/auth/components/LoginForm';
import { Modal } from 'shared/ui/Modal';

interface QuizAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export const QuizAuthModal: React.FC<QuizAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  message = 'Для создания shared-квиза необходимо авторизоваться',
}) => {
  if (!isOpen) return null;

  const handleLoginSuccess = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small" title="Авторизация">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 16, opacity: 0.9 }}>
          {message}
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <button
            onClick={() => {
              window.location.href = '/register';
            }}
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </Modal>
  );
};




