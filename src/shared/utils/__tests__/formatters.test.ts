import { formatYear } from '../formatters';

describe('formatYear', () => {
  it('should format positive years as strings', () => {
    expect(formatYear(2024)).toBe('2024');
    expect(formatYear(1)).toBe('1');
    expect(formatYear(1500)).toBe('1500');
  });

  it('should format negative years with "до н.э."', () => {
    expect(formatYear(-30)).toBe('30 до н.э.');
    expect(formatYear(-500)).toBe('500 до н.э.');
    expect(formatYear(-1)).toBe('1 до н.э.');
  });

  it('should handle null and undefined as "н.в."', () => {
    expect(formatYear(null)).toBe('н.в.');
    expect(formatYear(undefined)).toBe('н.в.');
  });

  it('should handle year 0 as "0"', () => {
    expect(formatYear(0)).toBe('0');
  });
});

