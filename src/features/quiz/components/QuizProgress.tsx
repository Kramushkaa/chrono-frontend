import React, { useEffect, useState } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isQuizActive) return null;

  const progress = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="quiz-progress" style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.35rem' : '0.5rem',
      padding: isMobile ? '0.25rem 0.5rem' : '0.4rem 0.8rem',
      background: 'rgba(139, 69, 19, 0.2)',
      border: '1px solid rgba(139, 69, 19, 0.4)',
      borderRadius: '6px',
      color: '#f4e4c1',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: 600
    }}>
      <span className="quiz-progress-text">
        {isMobile ? `${currentQuestion}/${totalQuestions}` : `Вопрос ${currentQuestion} из ${totalQuestions}`}
      </span>
      <div className="quiz-progress-bar" style={{
        width: isMobile ? '44px' : '60px',
        height: isMobile ? '4px' : '6px',
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
