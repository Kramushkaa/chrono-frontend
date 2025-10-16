import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizHistory } from 'shared/api/quiz';
import type { QuizHistoryEntry } from 'shared/dto/quiz-types';
import { AppHeader } from 'shared/layout/AppHeader';
import { getMinimalHeaderProps } from '../utils/headerProps';
import { ContactFooter } from 'shared/ui/ContactFooter';
import '../styles/quiz.css';

export const QuizHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuizHistory(20);
      setAttempts(response.data.attempts);
    } catch (err) {
      console.error('Failed to load quiz history:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} мин ${remainingSeconds} сек`;
    }
    return `${seconds} сек`;
  };

  const getScorePercentage = (correct: number, total: number) => {
    return Math.round((correct / total) * 100);
  };

  const handleViewAttempt = (attemptId: number) => {
    navigate(`/quiz/history/attempt/${attemptId}`);
  };

  return (
    <div className="quiz-page">
      <AppHeader {...getMinimalHeaderProps({ 
        extraLeftButton: { label: '← К викторинам', onClick: () => navigate('/quiz') }
      })} />

      <div className="quiz-content">
        <div className="quiz-container">
          <h1 className="quiz-title">История прохождений</h1>

          {loading && (
            <div className="quiz-loading">
              <p>Загрузка истории...</p>
            </div>
          )}

          {error && (
            <div className="quiz-error">
              <p>{error}</p>
              <button onClick={loadHistory} className="quiz-button">
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && attempts.length === 0 && (
            <div className="quiz-empty">
              <p>У вас пока нет завершённых квизов</p>
              <button onClick={() => navigate('/quiz')} className="quiz-button">
                Начать квиз
              </button>
            </div>
          )}

          {!loading && !error && attempts.length > 0 && (
            <div className="quiz-history-list">
              {attempts.map((attempt) => (
                <div
                  key={attempt.attemptId}
                  className="quiz-history-item"
                  onClick={() => handleViewAttempt(attempt.attemptId)}
                >
                  <div className="quiz-history-header">
                    <h3>
                      {attempt.quizTitle}
                      {!attempt.isShared && <span className="quiz-type-badge">Обычный</span>}
                    </h3>
                    <span className="quiz-history-date">
                      {formatDate(attempt.createdAt)}
                    </span>
                  </div>

                  <div className="quiz-history-stats">
                    <div className="quiz-history-stat">
                      <span className="stat-label">Результат:</span>
                      <span className={`stat-value ${attempt.correctAnswers === attempt.totalQuestions ? 'perfect' : ''}`}>
                        {attempt.correctAnswers} / {attempt.totalQuestions}
                        {' '}({getScorePercentage(attempt.correctAnswers, attempt.totalQuestions)}%)
                      </span>
                    </div>

                    <div className="quiz-history-stat">
                      <span className="stat-label">Время:</span>
                      <span className="stat-value">{formatTime(attempt.totalTimeMs)}</span>
                    </div>

                    <div className="quiz-history-stat">
                      <span className="stat-label">Рейтинг:</span>
                      <span className="stat-value">{Math.round(Number(attempt.ratingPoints))} очков</span>
                    </div>
                  </div>

                  <div className="quiz-history-action">
                    <span className="quiz-link-text">Посмотреть детали →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ContactFooter />
    </div>
  );
};

