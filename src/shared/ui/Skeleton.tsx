import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  /** Тип скелетона */
  variant?: 'text' | 'circle' | 'rectangle';
  /** Высота элемента */
  height?: number | string;
  /** Ширина элемента */
  width?: number | string;
  /** Дополнительный CSS класс */
  className?: string;
  /** Скорость анимации */
  speed?: 'slow' | 'normal' | 'fast';
  /** Количество строк для text варианта */
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  height,
  width,
  className = '',
  speed = 'normal',
  lines = 1,
}) => {
  const baseClass = 'skeleton';
  const variantClass = `skeleton--${variant}`;
  const speedClass = speed !== 'normal' ? `skeleton--${speed}` : '';
  const combinedClass = [baseClass, variantClass, speedClass, className]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    height: height || (variant === 'circle' ? '40px' : variant === 'rectangle' ? '120px' : '16px'),
    width: width || (variant === 'circle' ? '40px' : '100%'),
  };

  if (lines > 1 && variant === 'text') {
    return (
      <div className="skeleton-container">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={combinedClass}
            style={{
              ...style,
              width: index === lines - 1 ? '60%' : '100%', // Последняя строка короче
              marginBottom: index < lines - 1 ? '8px' : '0',
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={combinedClass} style={style} />;
};

export default Skeleton;



