import { adaptToItemCard } from '../itemAdapters'

describe('itemAdapters', () => {
  describe('adaptToItemCard - person', () => {
    it('should adapt person with all fields', () => {
      const person = {
        id: 'person-1',
        name: 'Test Person',
        country: 'Russia',
        birthYear: 1900,
        deathYear: 1980,
        category: 'Philosopher',
      }

      const result = adaptToItemCard(person, 'person')

      expect(result).toEqual({
        id: 'person-1',
        title: 'Test Person',
        subtitle: 'Russia',
        startYear: 1900,
        endYear: 1980,
        type: 'Philosopher',
        person,
      })
    })

    it('should handle person with alternative field names', () => {
      const person = {
        id: 'person-2',
        name: 'Test',
        country_name: 'France',
        birth_year: 1850,
        death_year: 1920,
        category: 'Artist',
      }

      const result = adaptToItemCard(person, 'person')

      expect(result.subtitle).toBe('France')
      expect(result.startYear).toBe(1850)
      expect(result.endYear).toBe(1920)
    })

    it('should handle person with countryName', () => {
      const person = {
        id: 'person-3',
        name: 'Test',
        countryName: 'Germany',
        birthYear: 1800,
        deathYear: 1870,
      }

      const result = adaptToItemCard(person, 'person')

      expect(result.subtitle).toBe('Germany')
    })

    it('should handle missing fields', () => {
      const person = { id: 'person-4' }

      const result = adaptToItemCard(person, 'person')

      expect(result.title).toBe('—')
      expect(result.subtitle).toBe('')
      expect(result.type).toBe('')
    })
  })

  describe('adaptToItemCard - achievement', () => {
    it('should adapt achievement with title', () => {
      const achievement = {
        id: 1,
        title: 'Achievement Title',
        year: 1950,
        description: 'Description',
      }

      const result = adaptToItemCard(achievement, 'achievement')

      expect(result).toEqual({
        id: 1,
        title: 'Achievement Title',
        year: 1950,
        description: 'Description',
        achievement,
      })
    })

    it('should fallback to person_name', () => {
      const achievement = {
        id: 2,
        person_name: 'Person Name',
        year: 1960,
      }

      const result = adaptToItemCard(achievement, 'achievement')

      expect(result.title).toBe('Person Name')
    })

    it('should fallback to country_name', () => {
      const achievement = {
        id: 3,
        country_name: 'Country',
        year: 1970,
      }

      const result = adaptToItemCard(achievement, 'achievement')

      expect(result.title).toBe('Country')
    })

    it('should handle missing title', () => {
      const achievement = { id: 4, year: 1980 }

      const result = adaptToItemCard(achievement, 'achievement')

      expect(result.title).toBe('—')
    })
  })

  describe('adaptToItemCard - period', () => {
    it('should adapt period with all fields', () => {
      const period = {
        id: 1,
        person_name: 'Person',
        country_name: 'Country',
        period_type: 'ruler',
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.title).toBe('Person • Country')
      expect(result.type).toBe('Правление')
      expect(result.startYear).toBe(1900)
      expect(result.endYear).toBe(1950)
      expect(result.period).toBe(period)
    })

    it('should handle life period type', () => {
      const period = {
        period_type: 'life',
        start_year: 1800,
        end_year: 1850,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.type).toBe('Жизнь')
    })

    it('should handle alternative field names', () => {
      const period = {
        personName: 'Alt Person',
        countryName: 'Alt Country',
        periodType: 'ruler',
        startYear: 2000,
        endYear: 2020,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.title).toBe('Alt Person • Alt Country')
      expect(result.startYear).toBe(2000)
      expect(result.endYear).toBe(2020)
    })

    it('should handle missing person name', () => {
      const period = {
        country_name: 'Country Only',
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.title).toBe('Country Only')
    })

    it('should handle missing country name', () => {
      const period = {
        person_name: 'Person Only',
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.title).toBe('Person Only')
    })

    it('should handle missing all names', () => {
      const period = {
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.title).toBe('—')
    })

    it('should generate id when missing', () => {
      const period = {
        person_name: 'Person',
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.id).toBe('Person-1900-1950')
    })

    it('should handle unknown period type', () => {
      const period = {
        period_type: 'custom',
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.type).toBe('custom')
    })

    it('should handle missing period type', () => {
      const period = {
        start_year: 1900,
        end_year: 1950,
      }

      const result = adaptToItemCard(period, 'period')

      expect(result.type).toBe('—')
    })
  })
})

