import { validateLifePeriodsClient, LifePeriodDraft } from '../validation'

describe('validateLifePeriodsClient', () => {
  describe('empty periods validation', () => {
    it('should return ok if periods are empty and not required', () => {
      const result = validateLifePeriodsClient([], undefined, undefined, false)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual([])
    })

    it('should fail if periods are empty and required', () => {
      const result = validateLifePeriodsClient([], undefined, undefined, true)
      expect(result.ok).toBe(false)
      expect(result.message).toBe('Необходимо указать хотя бы один период жизни')
      expect(result.periodErrors).toEqual([])
    })
  })

  describe('incomplete period data validation', () => {
    it('should fail if countryId is missing', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '', start: 1900, end: 1950 }]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(false)
      expect(result.periodErrors).toHaveLength(1)
      expect(result.periodErrors?.[0]).toBe('Не указана страна')
    })

    it('should fail if start year is empty', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: '', end: 1950 }]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(false)
      expect(result.periodErrors).toHaveLength(1)
      expect(result.periodErrors?.[0]).toContain('Заполните годы')
    })

    it('should fail if end year is empty', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1900, end: '' }]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(false)
      expect(result.periodErrors).toHaveLength(1)
      expect(result.periodErrors?.[0]).toContain('Заполните годы')
    })
  })

  describe('year range validation', () => {
    it('should fail if start year is greater than end year', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1950, end: 1900 }]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[0]).toContain('Год начала не может быть больше года окончания')
    })

    it('should pass if start and end years are equal', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1900, end: 1900 }]
      const result = validateLifePeriodsClient(periods, 1900, 1900)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual([''])
    })
  })

  describe('birth/death year constraints', () => {
    it('should fail if period starts before birth year', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1890, end: 1920 }]
      const result = validateLifePeriodsClient(periods, 1900)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[0]).toContain('раньше года рождения')
    })

    it('should fail if period ends after death year', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1900, end: 1980 }]
      const result = validateLifePeriodsClient(periods, undefined, 1950)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[0]).toContain('позже года смерти')
    })
  })

  describe('life coverage validation', () => {
    it('should fail if first period starts after birth year', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1910, end: 1950 }]
      const result = validateLifePeriodsClient(periods, 1900, 1950)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[0]).toContain('Первый период начинается позже года рождения')
    })

    it('should fail if last period ends before death year', () => {
      const periods: LifePeriodDraft[] = [{ countryId: '1', start: 1900, end: 1940 }]
      const result = validateLifePeriodsClient(periods, 1900, 1950)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[0]).toContain('Последний период заканчивается раньше года смерти')
    })

    it('should pass if periods cover entire life span', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '1', start: 1900, end: 1920 },
        { countryId: '2', start: 1920, end: 1950 }
      ]
      const result = validateLifePeriodsClient(periods, 1900, 1950)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual(['', ''])
    })
  })

  describe('period gaps and overlaps', () => {
    it('should fail if there is a gap between periods', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '1', start: 1900, end: 1920 },
        { countryId: '2', start: 1922, end: 1950 }
      ]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[1]).toContain('Разрыв с предыдущим периодом')
    })

    it('should fail if periods overlap', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '1', start: 1900, end: 1930 },
        { countryId: '2', start: 1925, end: 1950 }
      ]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(false)
      expect(result.periodErrors?.[1]).toContain('Пересекается с предыдущим периодом')
    })

    it('should pass if periods share a boundary', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '1', start: 1900, end: 1920 },
        { countryId: '2', start: 1920, end: 1950 }
      ]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual(['', ''])
    })
  })

  describe('multiple periods sorting', () => {
    it('should sort periods before validation', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '2', start: 1920, end: 1950 },
        { countryId: '1', start: 1900, end: 1920 }
      ]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual(['', ''])
    })
  })

  describe('complex scenarios', () => {
    it('should pass valid three-period life span', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '1', start: 1900, end: 1920 },
        { countryId: '2', start: 1920, end: 1940 },
        { countryId: '3', start: 1940, end: 1960 }
      ]
      const result = validateLifePeriodsClient(periods, 1900, 1960)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual(['', '', ''])
    })

    it('should handle periods without birth/death years', () => {
      const periods: LifePeriodDraft[] = [
        { countryId: '1', start: 1900, end: 1950 }
      ]
      const result = validateLifePeriodsClient(periods)
      expect(result.ok).toBe(true)
      expect(result.periodErrors).toEqual([''])
    })
  })
})






