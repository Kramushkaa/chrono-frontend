import React, { useState } from 'react';
import { BirthYearQuestionData, QuizAnswer } from '../../types';

interface BirthYearQuestionProps {
  data: BirthYearQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

export const BirthYearQuestion: React.FC<BirthYearQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleAnswer = (year: number) => {
    if (showFeedback) return; // Не позволяем отвечать, если показываем обратную связь
    setSelectedAnswer(year.toString());
    onAnswer(year.toString());
  };

  const getOptionClass = (year: number) => {
    let className = 'quiz-option';
    
    if (showFeedback && userAnswer) {
      const yearStr = year.toString();
      const isUserAnswer = userAnswer.answer === yearStr;
      const isCorrect = year === data.correctBirthYear;
      
      if (isUserAnswer && isCorrect) {
        className += ' correct';
      } else if (isUserAnswer && !isCorrect) {
        className += ' incorrect';
      } else if (isCorrect) {
        className += ' correct-answer';
      }
    } else if (selectedAnswer === year.toString()) {
      className += ' selected';
    }
    
    return className;
  };

  return (
    <div className="quiz-question birth-year-question">
      <div className="quiz-question-content">
        <div className="quiz-question-person">
          {data.person.imageUrl && (
            <img 
              src={data.person.imageUrl} 
              alt={data.person.name}
              className="quiz-question-image"
            />
          )}
          <div className="quiz-question-person-info">
            <h3>{data.person.name}</h3>
            <p>{data.person.description}</p>
          </div>
        </div>
        
        <div className="quiz-question-options">
          <h4>В каком году родился {data.person.name}?</h4>
          <div className="quiz-options-grid">
            {data.options.map((year, index) => (
              <button
                key={year}
                onClick={() => handleAnswer(year)}
                className={getOptionClass(year)}
                disabled={showFeedback}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {showFeedback && userAnswer && (
          <div className="question-feedback">
            <div className={`feedback-status ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="feedback-icon">
                {userAnswer.isCorrect ? '✓' : '✗'}
              </div>
              <div className="feedback-text">
                {userAnswer.isCorrect ? 'Правильно!' : 'Неправильно'}
              </div>
            </div>
            
            <div className="feedback-details">
              <p><strong>Правильный ответ:</strong> {data.correctBirthYear}</p>
              <p><strong>Время:</strong> {Math.round(userAnswer.timeSpent / 1000)}с</p>
            </div>

            {onNext && (
              <div className="feedback-actions">
                <button onClick={onNext} className="feedback-next-button">
                  {isLastQuestion ? 'Завершить игру' : 'Далее'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
