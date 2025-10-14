import {
  isPerson,
  isPeriod,
  isAchievement,
  isPersonArray,
  isPeriodArray,
  isAchievementArray,
  asPersonOrNull,
  asPeriodOrNull,
  asAchievementOrNull,
} from '../typeGuards'
import type { Person, Period, Achievement } from '../../types'

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

    it('should return false for invalid period', () => {
      expect(isPeriod({})).toBe(false)
      expect(isPeriod(null)).toBe(false)
      expect(isPeriod(undefined)).toBe(false)
      expect(isPeriod('string')).toBe(false)
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
})
