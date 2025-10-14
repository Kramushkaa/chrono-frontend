import { getPersonGroup, getGroupColor, sortGroupedData } from '../groupingUtils'
import type { Person, GroupingType } from 'shared/types'

describe('groupingUtils', () => {
  const mockPerson: Person = {
    id: '1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1950,
    category: 'scientist',
    country: 'Russia',
    description: '',
    achievements: [],
  }

  describe('getPersonGroup', () => {
    it('should return category when grouping by category', () => {
      const result = getPersonGroup(mockPerson, 'category')
      expect(result).toBe('scientist')
    })

    it('should return full country when grouping by country', () => {
      const person = { ...mockPerson, country: 'Russia/Germany' }
      const result = getPersonGroup(person, 'country')
      expect(result).toBe('Russia/Germany')
    })

    it('should return "none" when grouping is none', () => {
      const result = getPersonGroup(mockPerson, 'none')
      expect(result).toBe('none')
    })

    it('should handle multiple countries separated by slash', () => {
      const person = { ...mockPerson, country: 'USA / France / Germany' }
      const result = getPersonGroup(person, 'country')
      expect(result).toBe('USA / France / Germany')
    })
  })

  describe('getGroupColor', () => {
    it('should return consistent color for same group', () => {
      const color1 = getGroupColor('scientist')
      const color2 = getGroupColor('scientist')
      expect(color1).toBe(color2)
    })

    it('should return color for group', () => {
      const color1 = getGroupColor('scientist')
      const color2 = getGroupColor('artist')
      // Colors might be the same if both groups map to default
      expect(color1).toBeTruthy()
      expect(color2).toBeTruthy()
    })

    it('should return valid hex color', () => {
      const color = getGroupColor('test-group')
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('sortGroupedData', () => {
    const persons: Person[] = [
      { ...mockPerson, id: '1', birthYear: 1950 },
      { ...mockPerson, id: '2', birthYear: 1900 },
      { ...mockPerson, id: '3', birthYear: 1920 },
    ]

    it('should sort by birth year when no grouping', () => {
      const result = sortGroupedData(persons, 'none')
      
      expect(result[0].birthYear).toBe(1900)
      expect(result[1].birthYear).toBe(1920)
      expect(result[2].birthYear).toBe(1950)
    })

    it('should group and sort when grouping by category', () => {
      const personsWithCategories: Person[] = [
        { ...mockPerson, id: '1', category: 'artist', birthYear: 1950 },
        { ...mockPerson, id: '2', category: 'scientist', birthYear: 1900 },
        { ...mockPerson, id: '3', category: 'scientist', birthYear: 1920 },
      ]

      const result = sortGroupedData(personsWithCategories, 'category')

      // Within same category, should be sorted by birth year
      const scientists = result.filter(p => p.category === 'scientist')
      expect(scientists[0].birthYear).toBe(1900)
      expect(scientists[1].birthYear).toBe(1920)
    })

    it('should handle empty array', () => {
      const result = sortGroupedData([], 'none')
      expect(result).toEqual([])
    })
  })
})
