import React from 'react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  isQuizActive: boolean;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  isQuizActive
}) => {
  if (!isQuizActive) return null;

  const progress = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="quiz-progress" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.8rem',
      background: 'rgba(139, 69, 19, 0.2)',
      border: '1px solid rgba(139, 69, 19, 0.4)',
      borderRadius: '6px',
      color: '#f4e4c1',
      fontSize: '0.9rem',
      fontWeight: '600'
    }}>
      <span className="quiz-progress-text">
        Вопрос {currentQuestion} из {totalQuestions}
      </span>
      <div className="quiz-progress-bar" style={{
        width: '60px',
        height: '6px',
        background: 'rgba(44, 24, 16, 0.6)',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div 
          className="quiz-progress-fill"
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #cd853f, #8b4513)',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};
