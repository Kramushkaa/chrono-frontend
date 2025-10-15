import React, { useState } from 'react';
import { SingleChoiceQuestionData, QuizAnswer, QuizPerson } from '../../types';
import { hideYearsInText } from '../../utils/textUtils';

interface SingleChoiceQuestionProps {
  data: SingleChoiceQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: QuizPerson) => void;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false,
  onPersonInfoClick
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleAnswer = (option: string | number) => {
    if (showFeedback) return; // Не позволяем отвечать, если показываем обратную связь
    const optionStr = option.toString();
    setSelectedAnswer(optionStr);
    onAnswer(optionStr);
  };

  const getOptionClass = (option: string | number) => {
    let className = 'quiz-option';
    const optionStr = option.toString();
    
    if (showFeedback && userAnswer) {
      const isUserAnswer = userAnswer.answer === optionStr;
      const isCorrect = optionStr === data.correctAnswer.toString();
      
      if (isUserAnswer && isCorrect) {
        className += ' correct';
      } else if (isUserAnswer && !isCorrect) {
        className += ' incorrect';
      } else if (isCorrect) {
        className += ' correct-answer';
      }
    } else if (selectedAnswer === optionStr) {
      className += ' selected';
    }
    
    return className;
  };

  return (
    <div className="quiz-question single-choice-question">
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
            <div className="quiz-question-person-header">
              <h3>{data.person.name}</h3>
              {showFeedback && onPersonInfoClick && (
                <button
                  className="quiz-person-info-button"
                  onClick={() => onPersonInfoClick(data.person)}
                  title="Подробная информация"
                  aria-label={`Подробная информация о ${data.person.name}`}
                >
                  i
                </button>
              )}
            </div>
            {data.person.description && (
              <p>
                {showFeedback 
                  ? data.person.description 
                  : hideYearsInText(data.person.description)
                }
              </p>
            )}
          </div>
        </div>
        
        {!showFeedback && (
          <div className="quiz-question-options">
            <h4>{data.questionText}</h4>
            <div className="quiz-options-grid">
              {data.options.map((option, index) => (
                <button
                  key={`${option}-${index}`}
                  onClick={() => handleAnswer(option)}
                  className={getOptionClass(option)}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

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
              <p><strong>Ваш ответ:</strong> {userAnswer.answer}</p>
              <p><strong>Правильный ответ:</strong> {data.answerLabel || data.correctAnswer}</p>
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
