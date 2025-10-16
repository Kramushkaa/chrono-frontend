import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizResult, QuizQuestion, QuizSetupConfig, QuizPerson } from '../types';
import { ShareQuizButton } from './ShareQuizButton';
import { formatTime, formatTimeCompact, getScoreMessage, getScoreColor } from '../utils/formatters';
import { formatAnswer } from '../utils/answerRenderers';

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
    if (!question || question.type !== 'achievementsMatch') return null;

    const data = question.data as any;
    const userAnswerArray = userAnswer as string[];
    const correctAnswerArray = question.correctAnswer as string[];
    
    return (
      <div className="quiz-matching-table">
        <table>
          <thead>
            <tr>
              <th>Личность</th>
              <th>Ваш ответ</th>
              <th>Правильный ответ</th>
            </tr>
          </thead>
          <tbody>
            {data.persons.map((person: any, index: number) => {
              const userAns = userAnswerArray[index] || '—';
              const correctAns = correctAnswerArray[index] || '—';
              const isCorrect = userAns === correctAns;
              
              return (
                <tr key={`${questionId}-${person.id}-${index}`} className={isCorrect ? 'match-correct' : 'match-incorrect'}>
                  <td className="person-name">
                    {person.name}
                    {onPersonInfoClick && (
                      <button
                        className="quiz-person-info-button-inline"
                        onClick={() => onPersonInfoClick(person)}
                        title="Подробная информация"
                        aria-label={`Подробная информация о ${person.name}`}
                      >
                        ℹ️
                      </button>
                    )}
                  </td>
                  <td className="achievement-text user-answer">{userAns}</td>
                  <td className="achievement-text correct-answer">{correctAns}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBirthOrderList = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    if (!question || question.type !== 'birthOrder') return null;

    const data = question.data as any;
    const userOrder = userAnswer as string[];
    const correctOrder = question.correctAnswer as string[];
    
    const getPersonById = (personId: string) => {
      return data.persons.find((p: any) => p.id === personId);
    };

    const renderPersonItem = (personId: string, className: string) => {
      const person = getPersonById(personId);
      if (!person) return personId;
      
      return (
        <>
          {person.name} ({person.birthYear})
          {onPersonInfoClick && (
            <button
              className="quiz-person-info-button-inline"
              onClick={() => onPersonInfoClick(person)}
              title="Подробная информация"
              aria-label={`Подробная информация о ${person.name}`}
            >
              ℹ️
            </button>
          )}
        </>
      );
    };

    return (
      <div className="quiz-order-comparison">
        <div className="quiz-order-column">
          <strong>Ваш порядок:</strong>
          <ol className="quiz-order-list">
            {userOrder.map((personId, idx) => {
              const correctPosition = correctOrder.indexOf(personId);
              const isCorrect = correctPosition === idx;
              return (
                <li key={`user-${personId}-${idx}`} className={isCorrect ? 'order-correct' : 'order-incorrect'}>
                  {renderPersonItem(personId, isCorrect ? 'order-correct' : 'order-incorrect')}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="quiz-order-column">
          <strong>Правильный порядок:</strong>
          <ol className="quiz-order-list correct-order">
            {correctOrder.map((personId, idx) => (
              <li key={`correct-${personId}-${idx}`}>
                {renderPersonItem(personId, 'correct-order')}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  };

  const renderContemporariesGroups = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    if (!question || question.type !== 'contemporaries') return null;

    const data = question.data as any;
    const userGroups = userAnswer as string[][];
    const correctGroups = question.correctAnswer as string[][];
    
    const getPersonById = (personId: string) => {
      return data.persons.find((p: any) => p.id === personId);
    };

    const renderPersonItem = (personId: string) => {
      const person = getPersonById(personId);
      if (!person) return personId;
      
      return (
        <>
          {person.name} ({person.birthYear}-{person.deathYear || 'н.в.'})
          {onPersonInfoClick && (
            <button
              className="quiz-person-info-button-inline"
              onClick={() => onPersonInfoClick(person)}
              title="Подробная информация"
              aria-label={`Подробная информация о ${person.name}`}
            >
              ℹ️
            </button>
          )}
        </>
      );
    };

    return (
      <div className="quiz-groups-comparison">
        <div className="quiz-groups-column">
          <strong>Ваши группы:</strong>
          <div className="quiz-groups-list">
            {userGroups.map((group, groupIdx) => (
              <div key={`user-group-${groupIdx}`} className="quiz-group-box">
                <div className="quiz-group-header">Группа {groupIdx + 1}</div>
                <ul className="quiz-group-members">
                  {group.map((personId, personIdx) => (
                    <li key={`user-${personId}-${personIdx}`}>{renderPersonItem(personId)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="quiz-groups-column">
          <strong>Правильные группы:</strong>
          <div className="quiz-groups-list">
            {correctGroups.map((group, groupIdx) => (
              <div key={`correct-group-${groupIdx}`} className="quiz-group-box correct-group">
                <div className="quiz-group-header">Группа {groupIdx + 1}</div>
                <ul className="quiz-group-members">
                  {group.map((personId, personIdx) => (
                    <li key={`correct-${personId}-${personIdx}`}>{renderPersonItem(personId)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGuessPersonDetails = (questionId: string, userAnswer: any) => {
    const question = getQuestion(questionId);
    if (!question || question.type !== 'guessPerson') return null;

    const data = question.data as any;
    const correctPerson = data.correctPerson;
    const userPersonId = userAnswer as string;
    const userPerson = data.availablePersons.find((p: any) => p.id === userPersonId);
    const isCorrect = userPersonId === correctPerson.id;

    return (
      <div className="quiz-guess-person-details">
        <div className="quiz-guess-clues">
          <strong>Информация о загадываемой личности:</strong>
          <div className="quiz-clue-list">
            <div className="quiz-clue-item">
              <span className="clue-label">Годы жизни:</span>
              <span className="clue-value">
                {correctPerson.birthYear} — {correctPerson.deathYear || 'н.в.'}
              </span>
            </div>
            <div className="quiz-clue-item">
              <span className="clue-label">Страна:</span>
              <span className="clue-value">
                {Array.isArray(correctPerson.country) 
                  ? correctPerson.country.join(', ') 
                  : correctPerson.country}
              </span>
            </div>
            <div className="quiz-clue-item">
              <span className="clue-label">Род деятельности:</span>
              <span className="clue-value">{correctPerson.category}</span>
            </div>
            {correctPerson.description && (
              <div className="quiz-clue-item">
                <span className="clue-label">Описание:</span>
                <span className="clue-value">{correctPerson.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="quiz-guess-answers">
          {!isCorrect && userPerson && (
            <p className="quiz-answer-user">
              <strong>Ваш ответ:</strong> {userPerson.name}
              {onPersonInfoClick && (
                <button
                  className="quiz-person-info-button-inline"
                  onClick={() => onPersonInfoClick(userPerson)}
                  title="Подробная информация"
                  aria-label={`Подробная информация о ${userPerson.name}`}
                >
                  ℹ️
                </button>
              )}
            </p>
          )}
          
          <p className="quiz-answer-correct">
            <strong>Правильный ответ:</strong> {correctPerson.name}
            {onPersonInfoClick && (
              <button
                className="quiz-person-info-button-inline"
                onClick={() => onPersonInfoClick(correctPerson)}
                title="Подробная информация"
                aria-label={`Подробная информация о ${correctPerson.name}`}
              >
                ℹ️
              </button>
            )}
          </p>
        </div>
      </div>
    );
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
