import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizSessionDetail } from 'shared/api/quiz';
import type { QuizSessionDetailResponse } from 'shared/dto/quiz-types';
import { AppHeader } from 'shared/layout/AppHeader';
import { getMinimalHeaderProps } from '../utils/headerProps';
import { ContactFooter } from 'shared/ui/ContactFooter';
import { QuizLoading, QuizError } from '../components/QuizStateMessages';
import { formatTime, formatDate, getScorePercentage } from '../utils/formatters';
import '../styles/quiz.css';

export const QuizSessionDetailPage: React.FC = () => {
  const { sessionToken } = useParams<{ sessionToken: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<QuizSessionDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (sessionToken) {
      loadSessionDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  const loadSessionDetail = async () => {
    if (!sessionToken) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getQuizSessionDetail(sessionToken);
      setData(response.data);
    } catch (err) {
      if (import.meta.env.MODE !== 'production') {
        console.error('Failed to load session details:', err);
      }
      setError(err instanceof Error ? err.message : 'Не удалось загрузить детали сессии');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const renderAnswer = (answer: string | string[] | string[][]) => {
    if (Array.isArray(answer)) {
      if (answer.length > 0 && Array.isArray(answer[0])) {
        // Для contemporaries (string[][])
        return (answer as string[][]).map((group, idx) => (
          <div key={idx} className="answer-group">
            Группа {idx + 1}: {group.join(', ')}
          </div>
        ));
      }
      // Для achievementsMatch, birthOrder (string[])
      return <div>{answer.join(', ')}</div>;
    }
    return <div>{answer}</div>;
  };

  const handleBackToHistory = () => {
    navigate('/quiz/history');
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <AppHeader {...getMinimalHeaderProps({})} />
        <div className="quiz-content">
          <QuizLoading message="Загрузка деталей..." />
        </div>
        <ContactFooter />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="quiz-page">
        <AppHeader {...getMinimalHeaderProps({})} />
        <div className="quiz-content">
          <QuizError 
            message={error || 'Сессия не найдена'} 
            onRetry={handleBackToHistory}
            retryLabel="Вернуться к истории"
          />
        </div>
        <ContactFooter />
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <AppHeader {...getMinimalHeaderProps({})} />

      <div className="quiz-content">
        <div className="quiz-container">
          <h1 className="quiz-title">{data.session.quizTitle}</h1>

          <div className="quiz-session-info">
            <p><strong>Завершено:</strong> {formatDate(data.session.finishedAt)}</p>
          </div>

          <div className="quiz-results-summary">
            <h2>Результаты</h2>
            <div className="results-stats">
              <div className="result-stat">
                <span className="stat-label">Правильных ответов:</span>
                <span className={`stat-value ${data.results.correctAnswers === data.results.totalQuestions ? 'perfect' : ''}`}>
                  {data.results.correctAnswers} / {data.results.totalQuestions}
                  {' '}({getScorePercentage(data.results.correctAnswers, data.results.totalQuestions)}%)
                </span>
              </div>
              <div className="result-stat">
                <span className="stat-label">Время прохождения:</span>
                <span className="stat-value">{formatTime(data.results.totalTimeMs)}</span>
              </div>
            </div>
          </div>

          <div className="quiz-answers-section">
            <h2>Детали ответов</h2>
            
            {data.detailedAnswers.map((answer, index) => (
              <div key={answer.questionId} className="quiz-answer-item">
                <div
                  className="quiz-answer-header"
                  onClick={() => toggleQuestion(answer.questionId)}
                >
                  <div className="answer-header-left">
                    <span className="answer-number">Вопрос {index + 1}</span>
                    <span className={`answer-status ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  <span className="answer-time">{formatTime(answer.timeSpent)}</span>
                </div>

                {expandedQuestions.has(answer.questionId) && (
                  <div className="quiz-answer-details">
                    <p className="answer-question">{answer.question}</p>

                    <div className="answer-comparison">
                      <div className="answer-user">
                        <strong>Ваш ответ:</strong>
                        {renderAnswer(answer.userAnswer)}
                      </div>

                      <div className="answer-correct">
                        <strong>Правильный ответ:</strong>
                        {renderAnswer(answer.correctAnswer)}
                      </div>
                    </div>

                    {answer.explanation && (
                      <div className="answer-explanation">
                        <strong>Объяснение:</strong>
                        <p>{answer.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="quiz-actions">
            <button onClick={handleBackToHistory} className="quiz-button">
              Вернуться к истории
            </button>
          </div>
        </div>
      </div>

      <ContactFooter />
    </div>
  );
};




