import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedQuiz } from '../hooks/useSharedQuiz';
import { useAuthUser } from 'shared/context/AuthContext';
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
  const navigate = useNavigate();
  const { createSharedQuiz, loading } = useSharedQuiz();
  const { user, isAuthenticated } = useAuthUser();
  const [showModal, setShowModal] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const handleCreateShare = async () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите название квиза');
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
        alert('Не удалось создать квиз. Проверьте, что вы авторизованы.');
      }
    } catch (error) {
      alert('Ошибка при создании квиза: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Ссылка скопирована в буфер обмена!');
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
      if (window.confirm('Для создания shared-квиза нужно авторизоваться. Перейти на страницу входа?')) {
        navigate('/login', { state: { returnUrl: window.location.pathname } });
      }
      return;
    }
    
    // Предзаполняем название (используем полное имя)
    const userName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Пользователя';
    setTitle(`Викторина ${userName}`);
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="quiz-button quiz-button-secondary"
      >
        Поделиться квизом
      </button>

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

