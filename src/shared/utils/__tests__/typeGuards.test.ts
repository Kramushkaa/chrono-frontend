import {
  isPerson,
  isPeriod,
  isRulerPeriod,
  isAchievement,
  isEntityStatus,
  isPeriodType,
  assertPerson,
  assertPeriod,
  assertAchievement,
  isPersonArray,
  isPeriodArray,
  isAchievementArray,
  asPersonOrNull,
  asPeriodOrNull,
  asAchievementOrNull,
} from '../typeGuards'
import type { Person, Period, Achievement, RulerPeriod } from '../typeGuards'

describe('typeGuards', () => {
  const mockPerson: Person = {
    id: '1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1950,
    category: 'scientist',
    country: 'Russia',
    description: 'Test description',
  }

  const mockPeriod: Period = {
    startYear: 1920,
    endYear: 1930,
    type: 'life',
    countryId: '1',
    countryName: 'Russia',
    comment: 'Test period',
  }

  const mockAchievement: Achievement = {
    id: 1,
    year: 1925,
    description: 'Test achievement',
    wikipedia_url: null,
    image_url: null,
  }

  describe('isPerson', () => {
    it('should return true for valid person', () => {
      expect(isPerson(mockPerson)).toBe(true)
    })

    it('should return false for invalid person', () => {
      expect(isPerson({})).toBe(false)
      expect(isPerson(null)).toBe(false)
      expect(isPerson(undefined)).toBe(false)
      expect(isPerson('string')).toBe(false)
    })

    it('should return false for person missing required fields', () => {
      expect(isPerson({ id: '1' })).toBe(false)
      expect(isPerson({ name: 'Test' })).toBe(false)
    })
  })

  describe('isPeriod', () => {
    it('should return true for valid period', () => {
      expect(isPeriod(mockPeriod)).toBe(true)
    })

    it('should return true for period with null endYear', () => {
      const periodWithNullEnd = {
        startYear: 1920,
        endYear: null,
        type: 'life',
      }
      expect(isPeriod(periodWithNullEnd)).toBe(true)
    })

    it('should return false for invalid period', () => {
      expect(isPeriod({})).toBe(false)
      expect(isPeriod(null)).toBe(false)
      expect(isPeriod(undefined)).toBe(false)
      expect(isPeriod('string')).toBe(false)
    })

    it('should return false for period with invalid endYear', () => {
      expect(isPeriod({ startYear: 1920, endYear: 'invalid', type: 'life' })).toBe(false)
    })
  })

  describe('isRulerPeriod', () => {
    const mockRulerPeriod: RulerPeriod = {
      startYear: 1900,
      endYear: 1950,
      countryId: 1,
      countryName: 'Russia',
    }

    it('should return true for valid ruler period', () => {
      expect(isRulerPeriod(mockRulerPeriod)).toBe(true)
    })

    it('should return true for minimal ruler period', () => {
      expect(isRulerPeriod({ startYear: 1900, endYear: 1950 })).toBe(true)
    })

    it('should return false for invalid ruler period', () => {
      expect(isRulerPeriod({})).toBe(false)
      expect(isRulerPeriod(null)).toBe(false)
      expect(isRulerPeriod({ startYear: 1900 })).toBe(false)
      expect(isRulerPeriod({ endYear: 1950 })).toBe(false)
    })
  })

  describe('isAchievement', () => {
    it('should return true for valid achievement', () => {
      expect(isAchievement(mockAchievement)).toBe(true)
    })

    it('should return false for invalid achievement', () => {
      expect(isAchievement({})).toBe(false)
      expect(isAchievement(null)).toBe(false)
      expect(isAchievement(undefined)).toBe(false)
      expect(isAchievement('string')).toBe(false)
    })
  })

  describe('isPersonArray', () => {
    it('should return true for array of persons', () => {
      expect(isPersonArray([mockPerson])).toBe(true)
      expect(isPersonArray([])).toBe(true)
    })

    it('should return false for non-array or mixed array', () => {
      expect(isPersonArray(mockPerson)).toBe(false)
      expect(isPersonArray([mockPerson, {}])).toBe(false)
      expect(isPersonArray(null)).toBe(false)
    })
  })

  describe('isPeriodArray', () => {
    it('should return true for array of periods', () => {
      expect(isPeriodArray([mockPeriod])).toBe(true)
      expect(isPeriodArray([])).toBe(true)
    })

    it('should return false for non-array or mixed array', () => {
      expect(isPeriodArray(mockPeriod)).toBe(false)
      expect(isPeriodArray([mockPeriod, {}])).toBe(false)
      expect(isPeriodArray(null)).toBe(false)
    })
  })

  describe('isAchievementArray', () => {
    it('should return true for array of achievements', () => {
      expect(isAchievementArray([mockAchievement])).toBe(true)
      expect(isAchievementArray([])).toBe(true)
    })

    it('should return false for non-array or mixed array', () => {
      expect(isAchievementArray(mockAchievement)).toBe(false)
      expect(isAchievementArray([mockAchievement, {}])).toBe(false)
      expect(isAchievementArray(null)).toBe(false)
    })
  })

  describe('asPersonOrNull', () => {
    it('should return person for valid person', () => {
      expect(asPersonOrNull(mockPerson)).toBe(mockPerson)
    })

    it('should return null for invalid person', () => {
      expect(asPersonOrNull({})).toBe(null)
      expect(asPersonOrNull(null)).toBe(null)
    })
  })

  describe('asPeriodOrNull', () => {
    it('should return period for valid period', () => {
      expect(asPeriodOrNull(mockPeriod)).toBe(mockPeriod)
    })

    it('should return null for invalid period', () => {
      expect(asPeriodOrNull({})).toBe(null)
      expect(asPeriodOrNull(null)).toBe(null)
    })
  })

  describe('asAchievementOrNull', () => {
    it('should return achievement for valid achievement', () => {
      expect(asAchievementOrNull(mockAchievement)).toBe(mockAchievement)
    })

    it('should return null for invalid achievement', () => {
      expect(asAchievementOrNull({})).toBe(null)
      expect(asAchievementOrNull(null)).toBe(null)
    })
  })

  describe('isEntityStatus', () => {
    it('should return true for valid entity statuses', () => {
      expect(isEntityStatus('draft')).toBe(true)
      expect(isEntityStatus('pending')).toBe(true)
      expect(isEntityStatus('approved')).toBe(true)
      expect(isEntityStatus('rejected')).toBe(true)
    })

    it('should return false for invalid entity status', () => {
      expect(isEntityStatus('invalid')).toBe(false)
      expect(isEntityStatus('')).toBe(false)
      expect(isEntityStatus(null)).toBe(false)
      expect(isEntityStatus(undefined)).toBe(false)
      expect(isEntityStatus(123)).toBe(false)
    })
  })

  describe('isPeriodType', () => {
    it('should return true for valid period types', () => {
      expect(isPeriodType('life')).toBe(true)
      expect(isPeriodType('ruler')).toBe(true)
      expect(isPeriodType('other')).toBe(true)
    })

    it('should return false for invalid period type', () => {
      expect(isPeriodType('invalid')).toBe(false)
      expect(isPeriodType('')).toBe(false)
      expect(isPeriodType(null)).toBe(false)
      expect(isPeriodType(undefined)).toBe(false)
      expect(isPeriodType(123)).toBe(false)
    })
  })

  describe('assertPerson', () => {
    it('should not throw for valid person', () => {
      expect(() => assertPerson(mockPerson)).not.toThrow()
    })

    it('should throw for invalid person', () => {
      expect(() => assertPerson({})).toThrow('Invalid Person object')
      expect(() => assertPerson(null)).toThrow('Invalid Person object')
      expect(() => assertPerson({ id: '1' })).toThrow('Invalid Person object')
    })
  })

  describe('assertPeriod', () => {
    it('should not throw for valid period', () => {
      expect(() => assertPeriod(mockPeriod)).not.toThrow()
    })

    it('should throw for invalid period', () => {
      expect(() => assertPeriod({})).toThrow('Invalid Period object')
      expect(() => assertPeriod(null)).toThrow('Invalid Period object')
      expect(() => assertPeriod({ startYear: 1900 })).toThrow('Invalid Period object')
    })
  })

  describe('assertAchievement', () => {
    it('should not throw for valid achievement', () => {
      expect(() => assertAchievement(mockAchievement)).not.toThrow()
    })

    it('should throw for invalid achievement', () => {
      expect(() => assertAchievement({})).toThrow('Invalid Achievement object')
      expect(() => assertAchievement(null)).toThrow('Invalid Achievement object')
      expect(() => assertAchievement({ id: 1 })).toThrow('Invalid Achievement object')
    })
  })
})





