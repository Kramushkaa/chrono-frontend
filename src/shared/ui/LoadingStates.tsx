import React from 'react';
import './LoadingStates.css';

interface LoadingSpinnerProps {
  /** Сообщение для показа */
  message?: string;
  /** Размер спиннера */
  size?: 'small' | 'medium' | 'large';
  /** Дополнительный CSS класс */
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'medium',
  className = ''
}) => {
  const combinedClass = [
    'loading-spinner',
    `loading-spinner--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClass} role="status" aria-live="polite">
      <div className="loading-spinner__inner" />
      {message && (
        <div className="loading-spinner__message">{message}</div>
      )}
    </div>
  );
};

interface LoadingStatesProps {
  /** Тип загрузки для автоматического сообщения */
  type?: 'persons' | 'quiz' | 'saving' | 'deleting' | 'loading';
  /** Кастомное сообщение */
  message?: string;
  /** Размер */
  size?: 'small' | 'medium' | 'large';
  /** Дополнительный CSS класс */
  className?: string;
}

const getDefaultMessage = (type: LoadingStatesProps['type']): string => {
  switch (type) {
    case 'persons':
      return 'Загрузка личностей...';
    case 'quiz':
      return 'Генерация вопросов...';
    case 'saving':
      return 'Сохранение изменений...';
    case 'deleting':
      return 'Удаление...';
    default:
      return 'Загрузка...';
  }
};

export const LoadingStates: React.FC<LoadingStatesProps> = ({
  type = 'loading',
  message,
  size = 'medium',
  className = ''
}) => {
  const displayMessage = message || getDefaultMessage(type);

  return (
    <LoadingSpinner
      message={displayMessage}
      size={size}
      className={className}
    />
  );
};

export default LoadingSpinner;
