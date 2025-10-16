import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizHistory } from 'shared/api/quiz';
import type { QuizSessionHistoryEntry } from 'shared/dto/quiz-types';
import { AppHeader } from 'shared/layout/AppHeader';
import { getMinimalHeaderProps } from '../utils/headerProps';
import { ContactFooter } from 'shared/ui/ContactFooter';
import '../styles/quiz.css';

export const QuizHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<QuizSessionHistoryEntry[]>([]);
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
      setSessions(response.data.sessions);
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

  const handleViewSession = (sessionToken: string) => {
    navigate(`/quiz/history/${sessionToken}`);
  };

  const handleBackToQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="quiz-page">
      <AppHeader {...getMinimalHeaderProps({ onBackToMenu: handleBackToQuiz })} />

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

          {!loading && !error && sessions.length === 0 && (
            <div className="quiz-empty">
              <p>У вас пока нет завершённых shared-квизов</p>
              <button onClick={handleBackToQuiz} className="quiz-button">
                Начать квиз
              </button>
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="quiz-history-list">
              {sessions.map((session) => (
                <div
                  key={session.sessionToken}
                  className="quiz-history-item"
                  onClick={() => handleViewSession(session.sessionToken)}
                >
                  <div className="quiz-history-header">
                    <h3>{session.quizTitle}</h3>
                    <span className="quiz-history-date">
                      {formatDate(session.finishedAt)}
                    </span>
                  </div>

                  <div className="quiz-history-stats">
                    <div className="quiz-history-stat">
                      <span className="stat-label">Результат:</span>
                      <span className={`stat-value ${session.correctAnswers === session.totalQuestions ? 'perfect' : ''}`}>
                        {session.correctAnswers} / {session.totalQuestions}
                        {' '}({getScorePercentage(session.correctAnswers, session.totalQuestions)}%)
                      </span>
                    </div>

                    <div className="quiz-history-stat">
                      <span className="stat-label">Время:</span>
                      <span className="stat-value">{formatTime(session.totalTimeMs)}</span>
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

