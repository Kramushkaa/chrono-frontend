import React from 'react';
import { QuizResult } from '../types';

interface QuizResultsProps {
  result: QuizResult;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ result, onRestart, onBackToMenu }) => {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}м ${remainingSeconds}с`;
    }
    return `${remainingSeconds}с`;
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Отлично! Вы настоящий знаток истории!';
    if (score >= 70) return 'Хорошо! Неплохие знания!';
    if (score >= 50) return 'Неплохо! Есть над чем поработать.';
    return 'Попробуйте еще раз!';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#8BC34A';
    if (score >= 50) return '#FFC107';
    return '#F44336';
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
        </div>

        <div className="quiz-results-answers">
          <h3>Детали ответов:</h3>
          <div className="quiz-answers-list">
            {result.answers.map((answer, index) => (
              <div 
                key={answer.questionId} 
                className={`quiz-answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="quiz-answer-header">
                  <span className="quiz-answer-number">Вопрос {index + 1}</span>
                  <span className="quiz-answer-time">{formatTime(answer.timeSpent)}</span>
                  <span className="quiz-answer-status">
                    {answer.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-results-actions">
        <button onClick={onRestart} className="quiz-button quiz-button-primary">
          Играть снова
        </button>
        <button onClick={onBackToMenu} className="quiz-button quiz-button-secondary">
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};
