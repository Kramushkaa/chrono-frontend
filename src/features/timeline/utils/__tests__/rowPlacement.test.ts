import { calculateRowPlacement } from '../rowPlacement'
import type { Person, GroupingType } from 'shared/types'

describe('calculateRowPlacement', () => {
  const mockPersons: Person[] = [
    {
      id: '1',
      name: 'Person 1',
      birthYear: 1900,
      deathYear: 1950,
      category: 'scientist',
      country: 'Russia',
      description: '',
      achievements: [],
    },
    {
      id: '2',
      name: 'Person 2',
      birthYear: 1920,
      deathYear: 1980,
      category: 'scientist',
      country: 'USA',
      description: '',
      achievements: [],
    },
    {
      id: '3',
      name: 'Person 3',
      birthYear: 1960,
      deathYear: 2000,
      category: 'artist',
      country: 'France',
      description: '',
      achievements: [],
    },
  ]

  it('should place non-overlapping persons in one row (no grouping)', () => {
    const persons = [
      { ...mockPersons[0], birthYear: 1900, deathYear: 1940 },
      { ...mockPersons[1], birthYear: 1970, deathYear: 2000 },
    ]

    const result = calculateRowPlacement(persons, 'none', [], [])

    // Non-overlapping persons (with >20yr gap due to BUFFER) should be in the same row
    expect(result.length).toBe(1)
    expect(result[0]).toHaveLength(2)
  })

  it('should place overlapping persons in different rows (no grouping)', () => {
    const persons = [
      { ...mockPersons[0], birthYear: 1900, deathYear: 1950 },
      { ...mockPersons[1], birthYear: 1920, deathYear: 1980 }, // Overlaps with Person 1
    ]

    const result = calculateRowPlacement(persons, 'none', [], [])

    // Overlapping persons should be in different rows
    expect(result.length).toBe(2)
    expect(result[0]).toHaveLength(1)
    expect(result[1]).toHaveLength(1)
  })

  it('should group by category', () => {
    const allCategories = ['scientist', 'artist']
    const result = calculateRowPlacement(mockPersons, 'category', allCategories, [])

    // Should have rows for each category
    expect(result.length).toBeGreaterThan(0)
    
    // Find rows with scientists
    const scientistRows = result.filter(row => 
      row.length > 0 && row[0].category === 'scientist'
    )
    expect(scientistRows.length).toBeGreaterThan(0)
  })

  it('should group by country', () => {
    const allCountries = ['Russia', 'USA', 'France']
    const result = calculateRowPlacement(mockPersons, 'country', [], allCountries)

    // Should have rows for each country
    expect(result.length).toBeGreaterThan(0)
  })

  it('should add empty rows between groups', () => {
    const allCategories = ['scientist', 'artist']
    const result = calculateRowPlacement(mockPersons, 'category', allCategories, [])

    // Should have at least one empty row (divider)
    const emptyRows = result.filter(row => row.length === 0)
    expect(emptyRows.length).toBeGreaterThan(0)
  })

  it('should handle empty persons array', () => {
    const result = calculateRowPlacement([], 'none', [], [])

    expect(result).toEqual([])
  })

  it('should respect BUFFER to prevent overlaps', () => {
    const persons = [
      { ...mockPersons[0], birthYear: 1900, deathYear: 1950 },
      { ...mockPersons[1], birthYear: 1951, deathYear: 2000 }, // Just 1 year gap
    ]

    const result = calculateRowPlacement(persons, 'none', [], [])

    // Should be in different rows due to BUFFER (20 years)
    expect(result.length).toBe(2)
  })
})
