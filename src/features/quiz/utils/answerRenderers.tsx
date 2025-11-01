import React from 'react';
import type { QuizQuestion, QuizPerson } from '../types';

/**
 * Render matching table for achievementsMatch questions
 */
export const renderMatchingTable = (
  questionId: string,
  question: QuizQuestion | undefined,
  userAnswer: any,
  onPersonInfoClick?: (person: QuizPerson) => void
) => {
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

/**
 * Render birth order list
 */
export const renderBirthOrderList = (
  questionId: string,
  question: QuizQuestion | undefined,
  userAnswer: any,
  onPersonInfoClick?: (person: QuizPerson) => void
) => {
  if (!question || question.type !== 'birthOrder') return null;

  const data = question.data as any;
  const userOrder = userAnswer as string[];
  const correctOrder = question.correctAnswer as string[];
  
  const getPersonById = (personId: string) => {
    return data.persons.find((p: any) => p.id === personId);
  };

  const renderPersonItem = (personId: string) => {
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
            const itemIsCorrect = correctPosition === idx;
            return (
              <li key={`user-${personId}-${idx}`} className={itemIsCorrect ? 'order-correct' : 'order-incorrect'}>
                {renderPersonItem(personId)}
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
              {renderPersonItem(personId)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

/**
 * Render contemporaries groups
 */
export const renderContemporariesGroups = (
  questionId: string,
  question: QuizQuestion | undefined,
  userAnswer: any,
  onPersonInfoClick?: (person: QuizPerson) => void
) => {
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
        {userGroups.map((group, groupIdx) => (
          <div key={`user-group-${groupIdx}`} className="quiz-group">
            <div className="quiz-group-label">Группа {groupIdx + 1}:</div>
            <ul className="quiz-group-list">
              {group.map((personId) => (
                <li key={personId}>{renderPersonItem(personId)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="quiz-groups-column">
        <strong>Правильные группы:</strong>
        {correctGroups.map((group, groupIdx) => (
          <div key={`correct-group-${groupIdx}`} className="quiz-group">
            <div className="quiz-group-label">Группа {groupIdx + 1}:</div>
            <ul className="quiz-group-list">
              {group.map((personId) => (
                <li key={personId}>{renderPersonItem(personId)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Render guess person details
 */
export const renderGuessPersonDetails = (
  questionId: string,
  question: QuizQuestion | undefined,
  userAnswer: any,
  onPersonInfoClick?: (person: QuizPerson) => void
) => {
  if (!question || question.type !== 'guessPerson') return null;

  const data = question.data as any;
  const correctPersonId = question.correctAnswer as string;
  const userPersonId = userAnswer as string;
  
  const correctPerson = data.persons?.find((p: any) => p.id === correctPersonId);
  const userPerson = data.persons?.find((p: any) => p.id === userPersonId);
  
  return (
    <div className="quiz-guess-person-details">
      <div className="quiz-guess-context">
        <strong>Вопрос:</strong>
        <div className="quiz-guess-clues">
          {data.years && <div>📅 {data.years}</div>}
          {data.country && <div>🌍 {data.country}</div>}
          {data.category && <div>🎭 {data.category}</div>}
          {data.description && <div className="quiz-guess-description">{data.description}</div>}
        </div>
      </div>
      <div className="quiz-guess-answers">
        <div className="quiz-guess-answer-item">
          <strong>Ваш ответ:</strong>
          {userPerson ? (
            <>
              <span>{userPerson.name}</span>
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
            </>
          ) : (
            <span>{userAnswer || '—'}</span>
          )}
        </div>
        <div className="quiz-guess-answer-item">
          <strong>Правильный ответ:</strong>
          {correctPerson ? (
            <>
              <span>{correctPerson.name}</span>
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
            </>
          ) : (
            <span>{question.correctAnswer}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Format answer value as string
 */
export const formatAnswer = (answer: any): string => {
  if (Array.isArray(answer)) {
    if (answer.length === 0) return 'Не дан ответ';
    
    if (Array.isArray(answer[0])) {
      return answer.map((group: string[], idx: number) => 
        `Группа ${idx + 1}: ${group.join(', ')}`
      ).join(' | ');
    }
    
    return answer.join(', ');
  }
  return String(answer || 'Не дан ответ');
};





