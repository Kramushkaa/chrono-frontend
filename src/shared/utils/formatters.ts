/**
 * Форматирует год для отображения пользователю
 * Отрицательные годы преобразуются в формат "до н.э."
 * 
 * @param year - год для форматирования
 * @returns отформатированная строка с годом
 * 
 * @example
 * formatYear(2024) // "2024"
 * formatYear(-30) // "30 до н.э."
 * formatYear(null) // "н.в."
 * formatYear(undefined) // "н.в."
 */
export const formatYear = (year: number | null | undefined): string => {
  if (year == null) return 'н.в.';
  if (year < 0) return `${Math.abs(year)} до н.э.`;
  return year.toString();
};

