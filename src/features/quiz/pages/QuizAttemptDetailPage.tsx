import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizAttemptDetail } from 'shared/api/quiz';
import type { QuizAttemptDetailResponse } from 'shared/dto/quiz-types';
import { AppHeader } from 'shared/layout/AppHeader';
import { getMinimalHeaderProps } from '../utils/headerProps';
import { ContactFooter } from 'shared/ui/ContactFooter';
import { QuizPersonPanel } from '../components/QuizPersonPanel';
import { QuizLoading, QuizError } from '../components/QuizStateMessages';
import { usePersonPanel } from '../hooks/usePersonPanel';
import { formatTime, formatDate, getScorePercentage } from '../utils/formatters';
import {
  renderMatchingTable,
  renderBirthOrderList,
  renderContemporariesGroups,
  renderGuessPersonDetails,
  formatAnswer,
} from '../utils/answerRenderers';
import '../styles/quiz.css';

export const QuizAttemptDetailPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<QuizAttemptDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const { selectedPerson, handlePersonInfoClick, closePersonPanel } = usePersonPanel();

  useEffect(() => {
    if (attemptId) {
      loadAttemptDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const loadAttemptDetail = async () => {
    if (!attemptId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getQuizAttemptDetail(parseInt(attemptId));
      setData(response.data);
    } catch (err) {
      console.error('Failed to load attempt details:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить детали попытки');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (questionId: string) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleBackToHistory = () => {
    navigate('/quiz/history');
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <AppHeader {...getMinimalHeaderProps({ 
          extraLeftButton: { label: '← К викторинам', onClick: () => navigate('/quiz') }
        })} />
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
        <AppHeader {...getMinimalHeaderProps({ 
          extraLeftButton: { label: '← К викторинам', onClick: () => navigate('/quiz') }
        })} />
        <div className="quiz-content">
          <QuizError 
            message={error || 'Попытка не найдена'} 
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
      <AppHeader {...getMinimalHeaderProps({ 
        extraLeftButton: { label: '← К викторинам', onClick: () => navigate('/quiz') }
      })} />

      <div className="quiz-content">
        <div className="quiz-container">
          <h1 className="quiz-title">
            {data.attempt.quizTitle}
            {!data.attempt.isShared && <span className="quiz-type-badge">Обычный</span>}
          </h1>

          <div className="quiz-session-info">
            <p><strong>Завершено:</strong> {formatDate(data.attempt.createdAt)}</p>
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
              <div className="result-stat">
                <span className="stat-label">Рейтинг:</span>
                <span className="stat-value">{Math.round(Number(data.results.ratingPoints))} очков</span>
              </div>
            </div>
          </div>

          <div className="quiz-results-answers">
            <h3>Детали ответов:</h3>
            <div className="quiz-answers-list">
              {data.detailedAnswers.map((answer, index) => {
                const isExpanded = expandedAnswers.has(answer.questionId);
                const questionWithData = {
                  id: answer.questionId,
                  type: answer.questionType,
                  question: answer.question,
                  correctAnswer: answer.correctAnswer,
                  explanation: answer.explanation,
                  data: (answer as any).data,
                  options: [],
                };
                
                return (
                  <div 
                    key={`answer-${index}-${answer.questionId}`} 
                    className={`quiz-answer-item ${answer.isCorrect ? 'correct' : 'incorrect'} ${isExpanded ? 'expanded' : ''}`}
                  >
                    <div 
                      className="quiz-answer-header"
                      onClick={() => toggleAnswer(answer.questionId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="quiz-answer-number">Вопрос {index + 1}</span>
                      <span className="quiz-answer-time">{formatTime(answer.timeSpent)}</span>
                      <span className="quiz-answer-status">
                        {answer.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                      </span>
                      <span className="quiz-answer-toggle">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                    
                    {isExpanded && (
                      <div className="quiz-answer-body">
                        <p className="quiz-answer-question">
                          <strong>Вопрос:</strong> {answer.question}
                        </p>
                        
                        {answer.questionType === 'achievementsMatch' ? (
                          <div className="quiz-answer-section">
                            {renderMatchingTable(answer.questionId, questionWithData, answer.userAnswer, handlePersonInfoClick)}
                          </div>
                        ) : answer.questionType === 'birthOrder' ? (
                          <div className="quiz-answer-section">
                            {renderBirthOrderList(answer.questionId, questionWithData, answer.userAnswer, handlePersonInfoClick)}
                          </div>
                        ) : answer.questionType === 'contemporaries' ? (
                          <div className="quiz-answer-section">
                            {renderContemporariesGroups(answer.questionId, questionWithData, answer.userAnswer, handlePersonInfoClick)}
                          </div>
                        ) : answer.questionType === 'guessPerson' ? (
                          <div className="quiz-answer-section">
                            {renderGuessPersonDetails(answer.questionId, questionWithData, answer.userAnswer, handlePersonInfoClick)}
                          </div>
                        ) : (
                          <>
                            {/* Показываем информацию о личности для простых вопросов */}
                            {(answer.questionType === 'birthYear' || answer.questionType === 'deathYear' || answer.questionType === 'profession' || answer.questionType === 'country') && (
                              <p className="quiz-answer-person-info">
                                <strong>Личность:</strong> {(questionWithData.data as any)?.person?.name || '—'}
                                {(questionWithData.data as any)?.person && (
                                  <button
                                    className="quiz-person-info-button-inline"
                                    onClick={() => handlePersonInfoClick((questionWithData.data as any).person)}
                                    title="Подробная информация"
                                    aria-label={`Подробная информация о ${(questionWithData.data as any).person.name}`}
                                  >
                                    ℹ️
                                  </button>
                                )}
                              </p>
                            )}
                            
                            {!answer.isCorrect && (
                              <p className="quiz-answer-user">
                                <strong>Ваш ответ:</strong> {formatAnswer(answer.userAnswer)}
                              </p>
                            )}
                            
                            <p className="quiz-answer-correct">
                              <strong>Правильный ответ:</strong> {formatAnswer(answer.correctAnswer)}
                            </p>
                          </>
                        )}
                        
                        {answer.explanation && (
                          <p className="quiz-answer-explanation">
                            <strong>Пояснение:</strong> {answer.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="quiz-actions">
            <button onClick={handleBackToHistory} className="quiz-button">
              Вернуться к истории
            </button>
          </div>
        </div>
      </div>

      <ContactFooter />
      
      <QuizPersonPanel selectedPerson={selectedPerson} onClose={closePersonPanel} />
    </div>
  );
};

