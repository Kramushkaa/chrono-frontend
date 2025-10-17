import React from 'react';

interface QuizLoadingProps {
  message?: string;
}

export const QuizLoading: React.FC<QuizLoadingProps> = ({ message = 'Загрузка...' }) => {
  return (
    <div className="quiz-loading">
      <p>{message}</p>
    </div>
  );
};

interface QuizErrorProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const QuizError: React.FC<QuizErrorProps> = ({ 
  message, 
  onRetry, 
  retryLabel = 'Попробовать снова' 
}) => {
  return (
    <div className="quiz-error">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="quiz-button">
          {retryLabel}
        </button>
      )}
    </div>
  );
};

interface QuizEmptyProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const QuizEmpty: React.FC<QuizEmptyProps> = ({ message, actionLabel, onAction }) => {
  return (
    <div className="quiz-empty">
      <p>{message}</p>
      {onAction && actionLabel && (
        <button onClick={onAction} className="quiz-button">
          {actionLabel}
        </button>
      )}
    </div>
  );
};


