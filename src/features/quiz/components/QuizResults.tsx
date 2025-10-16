import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizResult, QuizQuestion, QuizSetupConfig, QuizPerson } from '../types';
import { ShareQuizButton } from './ShareQuizButton';
import { formatTime, formatTimeCompact, getScoreMessage, getScoreColor } from '../utils/formatters';
import {
  formatAnswer,
  renderMatchingTable as renderMatchingTableUtil,
  renderBirthOrderList as renderBirthOrderListUtil,
  renderContemporariesGroups as renderContemporariesGroupsUtil,
  renderGuessPersonDetails as renderGuessPersonDetailsUtil,
} from '../utils/answerRenderers';

interface QuizResultsProps {
  result: QuizResult;
  onRestart: () => void;
  onBackToMenu: () => void;
  ratingPoints?: number;
  questions?: QuizQuestion[];
  config?: QuizSetupConfig;
  onPersonInfoClick?: (person: QuizPerson) => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onRestart,
  onBackToMenu,
  ratingPoints,
  questions,
  config,
  onPersonInfoClick,
}) => {
  const navigate = useNavigate();
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  const toggleAnswer = (questionId: string) => {
    setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionText = (questionId: string): string => {
    const question = questions?.find(q => q.id === questionId);
    return question?.question || 'Вопрос';
  };

  const getCorrectAnswer = (questionId: string): string => {
    const question = questions?.find(q => q.id === questionId);
    if (!question) return 'Неизвестно';
    return formatAnswer(question.correctAnswer);
  };

  const getQuestion = (questionId: string): QuizQuestion | undefined => {
    return questions?.find(q => q.id === questionId);
  };

  const renderMatchingTable = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    return renderMatchingTableUtil(questionId, question, userAnswer, onPersonInfoClick);
  };

  const renderBirthOrderList = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    return renderBirthOrderListUtil(questionId, question, userAnswer, onPersonInfoClick);
  };

  const renderContemporariesGroups = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    return renderContemporariesGroupsUtil(questionId, question, userAnswer, onPersonInfoClick);
  };

  const renderGuessPersonDetails = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    return renderGuessPersonDetailsUtil(questionId, question, userAnswer, onPersonInfoClick);
  };

  return (
    <div className="quiz-results">
      <div className="quiz-results-header">
        <h2>Результаты игры</h2>
      </div>

      <div className="quiz-results-content">
        <div className="quiz-results-score">
          <div 
            className="quiz-score-circle"
            style={{ borderColor: getScoreColor(result.score) }}
          >
            <span className="quiz-score-number">{result.score}</span>
            <span className="quiz-score-percent">%</span>
          </div>
          <p className="quiz-score-message">{getScoreMessage(result.score)}</p>
        </div>

        <div className="quiz-results-stats">
          <div className="quiz-stat">
            <span className="quiz-stat-label">Правильных ответов:</span>
            <span className="quiz-stat-value">
              {result.correctAnswers} из {result.totalQuestions}
            </span>
          </div>
          <div className="quiz-stat">
            <span className="quiz-stat-label">Время:</span>
            <span className="quiz-stat-value">{formatTime(result.totalTime)}</span>
          </div>
          <div className="quiz-stat">
            <span className="quiz-stat-label">Среднее время на вопрос:</span>
            <span className="quiz-stat-value">
              {formatTime(result.totalTime / result.totalQuestions)}
            </span>
          </div>
          {ratingPoints !== undefined && (
            <div className="quiz-stat quiz-stat-highlight">
              <span className="quiz-stat-label">Заработано рейтинга:</span>
              <span className="quiz-stat-value">{ratingPoints.toFixed(0)} очков</span>
            </div>
          )}
        </div>

        <div className="quiz-results-actions">
          <button onClick={onRestart} className="quiz-button quiz-button-primary">
            Играть снова
          </button>
          <button
            onClick={() => navigate('/quiz/leaderboard')}
            className="quiz-button quiz-button-primary"
          >
            Посмотреть лидерборд
          </button>
          <button
            onClick={() => navigate('/quiz/history')}
            className="quiz-button quiz-button-primary"
          >
            История прохождений
          </button>
          {questions && config && (
            <ShareQuizButton 
              questions={questions} 
              config={config} 
              creatorResults={{
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
                totalTimeMs: result.totalTime,
                answers: result.answers,
              }}
            />
          )}
          <button onClick={onBackToMenu} className="quiz-button quiz-button-secondary">
            Вернуться в меню
          </button>
        </div>

        <div className="quiz-results-answers">
          <h3>Детали ответов:</h3>
          <div className="quiz-answers-list">
            {result.answers.map((answer, index) => {
              const question = getQuestion(answer.questionId);
              const isExpanded = expandedAnswers.has(answer.questionId);
              
              if (!question) return null;
              
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
                    <span className="quiz-answer-time">{formatTimeCompact(answer.timeSpent)}</span>
                    <span className="quiz-answer-status">
                      {answer.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                    </span>
                    <span className="quiz-answer-toggle">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="quiz-answer-body">
                      <p className="quiz-answer-question">
                        <strong>Вопрос:</strong> {getQuestionText(answer.questionId)}
                      </p>
                      
                      {question.type === 'achievementsMatch' ? (
                        <div className="quiz-answer-section">
                          {renderMatchingTable(answer.questionId, answer.answer)}
                        </div>
                      ) : question.type === 'birthOrder' ? (
                        <div className="quiz-answer-section">
                          {renderBirthOrderList(answer.questionId, answer.answer)}
                        </div>
                      ) : question.type === 'contemporaries' ? (
                        <div className="quiz-answer-section">
                          {renderContemporariesGroups(answer.questionId, answer.answer)}
                        </div>
                      ) : question.type === 'guessPerson' ? (
                        <div className="quiz-answer-section">
                          {renderGuessPersonDetails(answer.questionId, answer.answer)}
                        </div>
                      ) : (
                        <>
                          {/* Показываем информацию о личности для простых вопросов */}
                          {(question.type === 'birthYear' || question.type === 'deathYear' || question.type === 'profession' || question.type === 'country') && (
                            <p className="quiz-answer-person-info">
                              <strong>Личность:</strong> {(question.data as any).person?.name}
                              {onPersonInfoClick && (question.data as any).person && (
                                <button
                                  className="quiz-person-info-button-inline"
                                  onClick={() => onPersonInfoClick((question.data as any).person)}
                                  title="Подробная информация"
                                  aria-label={`Подробная информация о ${(question.data as any).person.name}`}
                                >
                                  ℹ️
                                </button>
                              )}
                            </p>
                          )}
                          
                          {!answer.isCorrect && (
                            <p className="quiz-answer-user">
                              <strong>Ваш ответ:</strong> {formatAnswer(answer.answer)}
                            </p>
                          )}
                          
                          <p className="quiz-answer-correct">
                            <strong>Правильный ответ:</strong> {getCorrectAnswer(answer.questionId)}
                          </p>
                        </>
                      )}
                      
                      {question.explanation && (
                        <p className="quiz-answer-explanation">
                          <strong>Пояснение:</strong> {question.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
