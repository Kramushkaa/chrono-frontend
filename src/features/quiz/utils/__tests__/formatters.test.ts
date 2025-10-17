import {
  formatTime,
  formatTimeCompact,
  formatDate,
  formatDateCompact,
  getScorePercentage,
  getScoreMessage,
  getScoreColor,
} from '../formatters'

describe('quiz formatters', () => {
  describe('formatTime', () => {
    it('should format seconds only', () => {
      expect(formatTime(5000)).toBe('5 сек')
      expect(formatTime(30000)).toBe('30 сек')
      expect(formatTime(59000)).toBe('59 сек')
    })

    it('should format minutes and seconds', () => {
      expect(formatTime(60000)).toBe('1 мин 0 сек')
      expect(formatTime(65000)).toBe('1 мин 5 сек')
      expect(formatTime(125000)).toBe('2 мин 5 сек')
    })

    it('should handle zero', () => {
      expect(formatTime(0)).toBe('0 сек')
    })

    it('should floor fractional seconds', () => {
      expect(formatTime(5999)).toBe('5 сек')
      expect(formatTime(60999)).toBe('1 мин 0 сек')
    })
  })

  describe('formatTimeCompact', () => {
    it('should format seconds in compact form', () => {
      expect(formatTimeCompact(5000)).toBe('5с')
      expect(formatTimeCompact(30000)).toBe('30с')
    })

    it('should format minutes and seconds in compact form', () => {
      expect(formatTimeCompact(60000)).toBe('1м 0с')
      expect(formatTimeCompact(65000)).toBe('1м 5с')
      expect(formatTimeCompact(125000)).toBe('2м 5с')
    })

    it('should handle zero', () => {
      expect(formatTimeCompact(0)).toBe('0с')
    })
  })

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatDate(date)
      
      // Result will vary by timezone, just check it contains key parts
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('should format date string', () => {
      const dateStr = '2025-01-15T14:30:00Z'
      const result = formatDate(dateStr)
      
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })
  })

  describe('formatDateCompact', () => {
    it('should format date in compact form', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatDateCompact(date)
      
      expect(result).toContain('15')
      expect(result).toContain('2025')
      // Should not contain time
      expect(result).not.toContain(':')
    })

    it('should format date string in compact form', () => {
      const dateStr = '2025-01-15T14:30:00Z'
      const result = formatDateCompact(dateStr)
      
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })
  })

  describe('getScorePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getScorePercentage(8, 10)).toBe(80)
      expect(getScorePercentage(5, 10)).toBe(50)
      expect(getScorePercentage(10, 10)).toBe(100)
    })

    it('should round to nearest integer', () => {
      expect(getScorePercentage(7, 10)).toBe(70)
      expect(getScorePercentage(2, 3)).toBe(67) // 66.67 rounded
    })

    it('should handle zero total', () => {
      expect(getScorePercentage(5, 0)).toBe(0)
    })

    it('should handle zero correct', () => {
      expect(getScorePercentage(0, 10)).toBe(0)
    })

    it('should handle perfect score', () => {
      expect(getScorePercentage(10, 10)).toBe(100)
    })
  })

  describe('getScoreMessage', () => {
    it('should return excellent message for 90+', () => {
      expect(getScoreMessage(90)).toBe('Отлично! Вы настоящий знаток истории!')
      expect(getScoreMessage(95)).toBe('Отлично! Вы настоящий знаток истории!')
      expect(getScoreMessage(100)).toBe('Отлично! Вы настоящий знаток истории!')
    })

    it('should return good message for 70-89', () => {
      expect(getScoreMessage(70)).toBe('Хорошо! Неплохие знания!')
      expect(getScoreMessage(80)).toBe('Хорошо! Неплохие знания!')
      expect(getScoreMessage(89)).toBe('Хорошо! Неплохие знания!')
    })

    it('should return fair message for 50-69', () => {
      expect(getScoreMessage(50)).toBe('Неплохо! Есть над чем поработать.')
      expect(getScoreMessage(60)).toBe('Неплохо! Есть над чем поработать.')
      expect(getScoreMessage(69)).toBe('Неплохо! Есть над чем поработать.')
    })

    it('should return try again message for < 50', () => {
      expect(getScoreMessage(0)).toBe('Попробуйте еще раз!')
      expect(getScoreMessage(25)).toBe('Попробуйте еще раз!')
      expect(getScoreMessage(49)).toBe('Попробуйте еще раз!')
    })
  })

  describe('getScoreColor', () => {
    it('should return green for 90+', () => {
      expect(getScoreColor(90)).toBe('#4CAF50')
      expect(getScoreColor(100)).toBe('#4CAF50')
    })

    it('should return light green for 70-89', () => {
      expect(getScoreColor(70)).toBe('#8BC34A')
      expect(getScoreColor(85)).toBe('#8BC34A')
    })

    it('should return yellow for 50-69', () => {
      expect(getScoreColor(50)).toBe('#FFC107')
      expect(getScoreColor(65)).toBe('#FFC107')
    })

    it('should return red for < 50', () => {
      expect(getScoreColor(0)).toBe('#F44336')
      expect(getScoreColor(30)).toBe('#F44336')
      expect(getScoreColor(49)).toBe('#F44336')
    })

    it('should handle boundary values', () => {
      expect(getScoreColor(89)).toBe('#8BC34A')
      expect(getScoreColor(90)).toBe('#4CAF50')
      expect(getScoreColor(69)).toBe('#FFC107')
      expect(getScoreColor(70)).toBe('#8BC34A')
      expect(getScoreColor(49)).toBe('#F44336')
      expect(getScoreColor(50)).toBe('#FFC107')
    })
  })
})

