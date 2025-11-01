import React, { useState } from 'react';
import { formatTime } from '../utils/formatters';
import {
  renderMatchingTable,
  renderBirthOrderList,
  renderContemporariesGroups,
  renderGuessPersonDetails,
  formatAnswer,
} from '../utils/answerRenderers';
import type { QuizPerson } from '../types';
import type { DetailedQuestionResult } from 'shared/dto/quiz-types';

interface QuizAnswerDetailsListProps {
  results: DetailedQuestionResult[];
  getQuestion: (questionId: string) => any; // Может быть QuizQuestion, QuizQuestionWithoutAnswer или null
  onPersonInfoClick?: (person: QuizPerson) => void;
  showTitle?: boolean;
}

/**
 * Универсальный компонент для отображения детальных результатов квиза
 * Используется в SharedQuizPage, QuizAttemptDetailPage, QuizResults
 */
export const QuizAnswerDetailsList: React.FC<QuizAnswerDetailsListProps> = ({
  results,
  getQuestion,
  onPersonInfoClick,
  showTitle = true,
}) => {
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

  const renderAnswerDetails = (result: DetailedQuestionResult) => {
    const question = getQuestion(result.questionId);

    if (!question) {
      return (
        <div className="quiz-answer-section">
          <p>
            <strong>Ваш ответ:</strong> {formatAnswer(result.userAnswer)}
          </p>
          <p>
            <strong>Правильный ответ:</strong> {formatAnswer(result.correctAnswer)}
          </p>
        </div>
      );
    }

    // Используем утилиты для рендеринга специфичных типов вопросов
    if (question.type === 'achievementsMatch') {
      return (
        <div className="quiz-answer-section">
          {renderMatchingTable(result.questionId, question, result.userAnswer, onPersonInfoClick)}
        </div>
      );
    }

    if (question.type === 'birthOrder') {
      return (
        <div className="quiz-answer-section">
          {renderBirthOrderList(result.questionId, question, result.userAnswer, onPersonInfoClick)}
        </div>
      );
    }

    if (question.type === 'contemporaries') {
      return (
        <div className="quiz-answer-section">
          {renderContemporariesGroups(result.questionId, question, result.userAnswer, onPersonInfoClick)}
        </div>
      );
    }

    if (question.type === 'guessPerson') {
      return (
        <div className="quiz-answer-section">
          {renderGuessPersonDetails(result.questionId, question, result.userAnswer, onPersonInfoClick)}
        </div>
      );
    }

    // Простые вопросы (birthYear, deathYear, profession, country)
    const isSimpleQuestion =
      question.type === 'birthYear' ||
      question.type === 'deathYear' ||
      question.type === 'profession' ||
      question.type === 'country';

    return (
      <>
        {/* Показываем информацию о личности для простых вопросов */}
        {isSimpleQuestion && question && (
          <p className="quiz-answer-person-info">
            <strong>Личность:</strong> {(question.data as any).person?.name}
            {(question.data as any).person && onPersonInfoClick && (
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

        <div className="quiz-answer-section">
          <p>
            <strong>Ваш ответ:</strong> {formatAnswer(result.userAnswer)}
          </p>
          <p>
            <strong>Правильный ответ:</strong> {formatAnswer(result.correctAnswer)}
          </p>
          {result.explanation && (
            <p className="quiz-answer-explanation">
              <strong>Пояснение:</strong> {result.explanation}
            </p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="quiz-results-answers">
      {showTitle && <h3>Детали ответов:</h3>}
      <div className="quiz-answers-list">
        {results.map((result, index) => {
          const isExpanded = expandedAnswers.has(result.questionId);

          return (
            <div
              key={`answer-${index}-${result.questionId}`}
              className={`quiz-answer-item ${result.isCorrect ? 'correct' : 'incorrect'} ${
                isExpanded ? 'expanded' : ''
              }`}
            >
              <div
                className="quiz-answer-header"
                onClick={() => toggleAnswer(result.questionId)}
                style={{ cursor: 'pointer' }}
              >
                <span className="quiz-answer-number">Вопрос {index + 1}</span>
                <span className="quiz-answer-time">{formatTime(result.timeSpent)}</span>
                <span className="quiz-answer-status">
                  {result.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                </span>
                <span className="quiz-answer-toggle">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="quiz-answer-body">
                  <p className="quiz-answer-question">
                    <strong>Вопрос:</strong> {result.question}
                  </p>

                  {renderAnswerDetails(result)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};




