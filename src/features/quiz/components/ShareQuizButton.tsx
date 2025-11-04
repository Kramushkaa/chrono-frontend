import React, { useState } from 'react';
import { useSharedQuiz } from '../hooks/useSharedQuiz';
import { useAuthUser } from 'shared/context/AuthContext';
import { useToast } from 'shared/context/ToastContext';
import { QuizAuthModal } from './QuizAuthModal';
import { classifyError, logError } from 'shared/utils/errorHandling';
import type { QuizQuestion, QuizSetupConfig } from '../types';

interface ShareQuizButtonProps {
  questions: QuizQuestion[];
  config: QuizSetupConfig;
  onShareCreated?: (shareCode: string, shareUrl: string) => void;
  creatorResults?: {
    correctAnswers: number;
    totalQuestions: number;
    totalTimeMs: number;
    answers: Array<{ questionId: string; answer: any; isCorrect: boolean; timeSpent: number }>;
  };
}

export const ShareQuizButton: React.FC<ShareQuizButtonProps> = ({
  questions,
  config,
  onShareCreated,
  creatorResults,
}) => {
  const { createSharedQuiz, loading } = useSharedQuiz();
  const { user, isAuthenticated } = useAuthUser();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const handleCreateShare = async () => {
    if (!title.trim()) {
      showToast('Пожалуйста, введите название квиза', 'error');
      return;
    }

    try {
      const result = await createSharedQuiz(
        title.trim(),
        undefined, // описание убрано
        config,
        questions,
        creatorResults
      );

      if (result) {
        const fullUrl = `${window.location.origin}/quiz/${result.shareCode}`;
        setShareCode(result.shareCode);
        setShareUrl(fullUrl);

        if (onShareCreated) {
          onShareCreated(result.shareCode, fullUrl);
        }
      } else {
        showToast('Не удалось создать квиз. Проверьте, что вы авторизованы.', 'error');
      }
    } catch (error) {
      logError(error, 'ShareQuizButton.handleCreateShare');
      
      const classified = classifyError(error);
      
      if (classified.type === 'auth') {
        // Close the share modal and show auth modal
        setShowModal(false);
        setShowAuthModal(true);
        showToast(classified.userMessage, 'info');
      } else {
        showToast(`Ошибка при создании квиза: ${classified.userMessage}`, 'error');
      }
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      showToast('Ссылка скопирована в буфер обмена!', 'success');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setShareCode(null);
    setShareUrl(null);
    setTitle('');
  };

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Предзаполняем название (используем полное имя)
    const userName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Пользователя';
    setTitle(`Викторина ${userName}`);
    setShowModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // После авторизации автоматически открываем модалку создания квиза
    if (user) {
      const userName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Пользователя';
      setTitle(`Викторина ${userName}`);
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="quiz-button quiz-button-secondary"
      >
        Поделиться квизом
      </button>

      <QuizAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        message="Для создания shared-квиза необходимо авторизоваться"
      />

      {showModal && (
        <div className="quiz-modal-overlay" onClick={handleClose}>
          <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
            {!shareCode ? (
              <>
                <h3>Создать квиз для друзей</h3>
                <p className="quiz-modal-description">
                  Создайте уникальную ссылку на этот квиз, чтобы ваши друзья могли пройти те же
                  самые вопросы и посоревноваться в лидерборде!
                </p>

                <div className="quiz-form-group">
                  <label htmlFor="quiz-title">Название квиза *</label>
                  <input
                    id="quiz-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Викторина Александра"
                    className="quiz-input"
                    maxLength={100}
                    autoFocus
                  />
                </div>

                <div className="quiz-modal-actions">
                  <button
                    onClick={handleCreateShare}
                    disabled={loading || !title.trim()}
                    className="quiz-button quiz-button-primary"
                  >
                    {loading ? 'Создание...' : 'Создать ссылку'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="quiz-button quiz-button-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Квиз создан!</h3>
                <p className="quiz-modal-description">
                  Поделитесь этой ссылкой с друзьями:
                </p>

                <div className="quiz-share-link-container">
                  <div className="quiz-share-code">
                    <strong>Код:</strong> {shareCode}
                  </div>
                  <div className="quiz-share-url">
                    <input
                      type="text"
                      value={shareUrl || ''}
                      readOnly
                      className="quiz-input"
                    />
                  </div>
                </div>

                <div className="quiz-modal-actions">
                  <button
                    onClick={handleCopyLink}
                    className="quiz-button quiz-button-primary"
                  >
                    Скопировать ссылку
                  </button>
                  <button
                    onClick={handleClose}
                    className="quiz-button quiz-button-secondary"
                  >
                    Закрыть
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};




