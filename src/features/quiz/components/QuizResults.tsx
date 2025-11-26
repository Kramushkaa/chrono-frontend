import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizResult, QuizQuestion, QuizSetupConfig, QuizPerson } from '../types';
import { ShareQuizButton } from './ShareQuizButton';
import { QuizAnswerDetailsList } from './QuizAnswerDetailsList';
import { formatTime, getScoreMessage, getScoreColor } from '../utils/formatters';
import type { DetailedQuestionResult } from 'shared/dto/quiz-types';

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

  // Преобразуем данные QuizResult в формат DetailedQuestionResult
  const detailedResults = useMemo((): DetailedQuestionResult[] => {
    if (!result.answers || !questions) return [];

    return result.answers.map((answer) => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        // Для UI компонента используем fallback, но логируем ошибку
        console.error(
          `Вопрос с ID ${answer.questionId} не найден в списке вопросов. Это может указывать на проблему с данными.`
        );
        return {
          questionId: answer.questionId,
          question: 'Вопрос не найден',
          questionType: 'birthYear' as const, // Fallback только для отображения
          userAnswer: answer.answer,
          correctAnswer: '',
          isCorrect: answer.isCorrect,
          timeSpent: answer.timeSpent,
          explanation: undefined,
        };
      }
      if (!question.type) {
        console.error(
          `Тип вопроса отсутствует для вопроса с ID ${question.id}. Это критическая ошибка данных.`
        );
      }
      return {
        questionId: answer.questionId,
        question: question.question || 'Вопрос',
        questionType: question.type || ('birthYear' as const), // Fallback только для отображения
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer || '',
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        explanation: question.explanation,
      };
    });
  }, [result.answers, questions]);

  const getQuestion = (questionId: string): QuizQuestion | undefined => {
    return questions?.find(q => q.id === questionId);
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

        <QuizAnswerDetailsList
          results={detailedResults}
          getQuestion={getQuestion}
          onPersonInfoClick={onPersonInfoClick}
        />
      </div>
    </div>
  );
};



