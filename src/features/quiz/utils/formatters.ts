/**
 * Formatting utilities for quiz components
 */

/**
 * Format time from milliseconds to human-readable string
 */
export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes} мин ${remainingSeconds} сек`;
  }
  return `${seconds} сек`;
};

/**
 * Format time in compact form (for tables/lists)
 */
export const formatTimeCompact = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`;
  }
  return `${remainingSeconds}с`;
};

/**
 * Format date to Russian locale
 */
export const formatDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format date in compact form (without time)
 */
export const formatDateCompact = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Calculate score percentage
 */
export const getScorePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Get score message based on percentage
 */
export const getScoreMessage = (score: number): string => {
  if (score >= 90) return 'Отлично! Вы настоящий знаток истории!';
  if (score >= 70) return 'Хорошо! Неплохие знания!';
  if (score >= 50) return 'Неплохо! Есть над чем поработать.';
  return 'Попробуйте еще раз!';
};

/**
 * Get score color based on percentage
 */
export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#4CAF50';
  if (score >= 70) return '#8BC34A';
  if (score >= 50) return '#FFC107';
  return '#F44336';
};





