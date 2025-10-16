import React, { useState } from 'react';
import { QuizAuthModal } from './QuizAuthModal';

interface AuthPromptProps {
  onContinueAsGuest: () => void;
  message?: string;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({
  onContinueAsGuest,
  message = 'Войдите, чтобы ваш результат отобразился в лидерборде!',
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // После авторизации автоматически продолжаем
    onContinueAsGuest();
  };

  return (
    <>
      <div className="auth-prompt">
        <div className="auth-prompt-content">
          <h3>Хотите попасть в лидерборд?</h3>
          <p>{message}</p>

          <div className="auth-prompt-actions">
            <button onClick={handleLogin} className="quiz-button quiz-button-primary">
              Войти
            </button>
            <button onClick={handleRegister} className="quiz-button quiz-button-primary">
              Зарегистрироваться
            </button>
            <button
              onClick={onContinueAsGuest}
              className="quiz-button quiz-button-secondary"
            >
              Продолжить как гость
            </button>
          </div>

          <p className="auth-prompt-note">
            Если вы продолжите как гость, вы будете отображаться как "Неизвестный ронин"
          </p>
        </div>
      </div>

      <QuizAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        message="Войдите, чтобы ваш результат отобразился в лидерборде!"
      />
    </>
  );
};

