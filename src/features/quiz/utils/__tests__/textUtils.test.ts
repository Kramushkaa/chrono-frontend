import { hideYearsInText, hasYearsInText } from '../textUtils';

describe('textUtils', () => {
  describe('hideYearsInText', () => {
    it('should hide single year in text', () => {
      const text = 'Родился в 1923 году в Москве';
      const result = hideYearsInText(text);
      expect(result).toBe('Родился в **** году в Москве');
    });

    it('should hide multiple years in text', () => {
      const text = 'Родился в 1923 году, умер в 1991 году';
      const result = hideYearsInText(text);
      expect(result).toBe('Родился в **** году, умер в **** году');
    });

    it('should hide single roman token in text (century)', () => {
      const text = 'Жил в XIX веке';
      const result = hideYearsInText(text);
      expect(result).toBe('Жил в ** веке');
    });

    it('should hide multiple roman tokens in text (centuries)', () => {
      const text = 'Родился в XVIII веке, умер в XIX веке';
      const result = hideYearsInText(text);
      expect(result).toBe('Родился в ** веке, умер в ** веке');
    });

    it('should hide both years and centuries in text', () => {
      const text = 'Родился в 1923 году, жил в XX веке';
      const result = hideYearsInText(text);
      expect(result).toBe('Родился в **** году, жил в ** веке');
    });

    it('should handle different roman tokens', () => {
      const text = 'I век, II век, III век, IV век, V век, X век, XV век, XX век, XXI век';
      const result = hideYearsInText(text);
      expect(result).toBe('** век, ** век, ** век, ** век, ** век, ** век, ** век, ** век, ** век');
    });

    it('should not hide 3-digit numbers', () => {
      const text = 'Родился в 123 году';
      const result = hideYearsInText(text);
      expect(result).toBe('Родился в 123 году');
    });

    it('should not hide 5-digit numbers', () => {
      const text = 'Родился в 12345 году';
      const result = hideYearsInText(text);
      expect(result).toBe('Родился в 12345 году');
    });

    it('should hide standalone roman tokens even without "век"', () => {
      const text = 'Римская цифра I, II, III';
      const result = hideYearsInText(text);
      expect(result).toBe('Римская цифра **, **, **');
    });

    it('should handle text without years or centuries', () => {
      const text = 'Известный ученый и писатель';
      const result = hideYearsInText(text);
      expect(result).toBe('Известный ученый и писатель');
    });

    it('should handle empty text', () => {
      const text = '';
      const result = hideYearsInText(text);
      expect(result).toBe('');
    });

    it('should handle years at the beginning and end of text', () => {
      const text = '1923-1991 годы жизни';
      const result = hideYearsInText(text);
      expect(result).toBe('****-**** годы жизни');
    });
  });

  describe('hasYearsInText', () => {
    it('should return true for text with years', () => {
      const text = 'Родился в 1923 году';
      expect(hasYearsInText(text)).toBe(true);
    });

    it('should return true for text with roman tokens', () => {
      const text = 'Жил в XIX веке';
      expect(hasYearsInText(text)).toBe(true);
    });

    it('should return true for text with both years and centuries', () => {
      const text = 'Родился в 1923 году, жил в XX веке';
      expect(hasYearsInText(text)).toBe(true);
    });

    it('should return false for text without years or centuries', () => {
      const text = 'Известный ученый';
      expect(hasYearsInText(text)).toBe(false);
    });

    it('should return false for 3-digit numbers', () => {
      const text = 'Родился в 123 году';
      expect(hasYearsInText(text)).toBe(false);
    });

    it('should return false for 5-digit numbers', () => {
      const text = 'Родился в 12345 году';
      expect(hasYearsInText(text)).toBe(false);
    });

    it('should return true for standalone roman tokens even without "век"', () => {
      const text = 'Римская цифра I, II, III';
      expect(hasYearsInText(text)).toBe(true);
    });
  });
});





