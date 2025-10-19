import React from 'react';
import './Button.css';

interface ButtonProps {
  /** Тип кнопки */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Размер кнопки */
  size?: 'small' | 'medium' | 'large';
  /** Показать состояние загрузки */
  loading?: boolean;
  /** Отключена ли кнопка */
  disabled?: boolean;
  /** Содержимое кнопки */
  children: React.ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
  /** Обработчик клика */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Тип HTML кнопки */
  type?: 'button' | 'submit' | 'reset';
  /** HTML атрибуты */
  [key: string]: any;
}

const LoadingSpinner: React.FC = () => (
  <div className="button-spinner" role="status" aria-label="Загрузка">
    <div className="button-spinner__inner" />
  </div>
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  const buttonClassName = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    loading ? 'button--loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={isDisabled}
      onClick={handleClick}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && <LoadingSpinner />}
      <span className={loading ? 'button__content--loading' : 'button__content'}>
        {children}
      </span>
    </button>
  );
};

export default Button;
