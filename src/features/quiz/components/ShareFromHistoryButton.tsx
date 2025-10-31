import React, { useState } from 'react';
import { useSharedQuiz } from '../hooks/useSharedQuiz';
import { useAuthUser } from 'shared/context/AuthContext';
import { QuizAuthModal } from './QuizAuthModal';
import { getQuizAttemptDetail } from 'shared/api/quiz';
import type { QuizSetupConfig, QuizQuestion } from '../types';

interface ShareFromHistoryButtonProps {
  attemptId: number;
  isShared: boolean;
  shareCode?: string;
  quizTitle: string;
}

export const ShareFromHistoryButton: React.FC<ShareFromHistoryButtonProps> = ({
  attemptId,
  isShared,
  shareCode,
  quizTitle,
}) => {
  const { createSharedQuiz, loading } = useSharedQuiz();
  const { user, isAuthenticated } = useAuthUser();
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newShareCode, setNewShareCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleButtonClick = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isShared && shareCode) {
      // Для чужого квиза - просто показываем ссылку
      const fullUrl = `${window.location.origin}/quiz/${shareCode}`;
      setShareUrl(fullUrl);
      setNewShareCode(shareCode);
      setShowModal(true);
    } else {
      // Для обычного квиза - создаем новый shared квиз
      const userName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Пользователя';
      setTitle(`Викторина ${userName}`);
      setShowModal(true);
    }
  };

  const handleCreateShare = async () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите название квиза');
      return;
    }

    try {
      setLoadingQuestions(true);
      
      // Получаем детали попытки, чтобы восстановить вопросы
      const attemptDetail = await getQuizAttemptDetail(attemptId);
      
      if (!attemptDetail.data.detailedAnswers || attemptDetail.data.detailedAnswers.length === 0) {
        alert('Не удалось загрузить вопросы квиза');
        return;
      }

      // Восстанавливаем вопросы из detailedAnswers
      const questions: QuizQuestion[] = attemptDetail.data.detailedAnswers.map((answer: any) => ({
        id: answer.questionId,
        type: answer.questionType,
        question: answer.question,
        correctAnswer: answer.correctAnswer,
        explanation: answer.explanation,
        data: answer.data,
        options: answer.options,
      }));

      // Получаем config из попытки или создаем дефолтный
      const config: QuizSetupConfig = (attemptDetail.data as any).attempt?.config || {
        selectedCountries: [],
        selectedCategories: [],
        questionTypes: [],
        questionCount: questions.length,
        timeRange: { start: -3000, end: 2024 },
      };

      // Создаем shared квиз с результатами создателя
      const result = await createSharedQuiz(
        title.trim(),
        undefined,
        config,
        questions,
        {
          correctAnswers: attemptDetail.data.results.correctAnswers,
          totalQuestions: attemptDetail.data.results.totalQuestions,
          totalTimeMs: attemptDetail.data.results.totalTimeMs,
          answers: attemptDetail.data.detailedAnswers.map((answer: any) => ({
            questionId: answer.questionId,
            answer: answer.userAnswer,
            isCorrect: answer.isCorrect,
            timeSpent: answer.timeSpent,
          })),
        }
      );

      if (result) {
        const fullUrl = `${window.location.origin}/quiz/${result.shareCode}`;
        setNewShareCode(result.shareCode);
        setShareUrl(fullUrl);
      } else {
        alert('Не удалось создать квиз. Проверьте, что вы авторизованы.');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating shared quiz:', error);
      }
      alert('Ошибка при создании квиза: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setLoadingQuestions(false);
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
    setNewShareCode(null);
    setShareUrl(null);
    setTitle('');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // После авторизации автоматически открываем модалку
    handleButtonClick();
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="quiz-button quiz-button-secondary quiz-history-share-button"
        title="Поделиться квизом"
      >
        📤 Поделиться
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
            {!newShareCode ? (
              <>
                <h3>Создать квиз для друзей</h3>
                <p className="quiz-modal-description">
                  Создайте уникальную ссылку на квиз "{quizTitle}", чтобы ваши друзья могли пройти те же
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
                    disabled={loading || loadingQuestions || !title.trim()}
                    className="quiz-button quiz-button-primary"
                  >
                    {loadingQuestions ? 'Загрузка вопросов...' : loading ? 'Создание...' : 'Создать ссылку'}
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
                    <strong>Код:</strong> {newShareCode}
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

