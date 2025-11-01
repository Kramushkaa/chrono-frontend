import { generateSimpleFallback } from '../fallbackGenerator'
import type { Person } from '../../../../shared/types'

describe('fallbackGenerator', () => {
  const mockPersons: Person[] = [
    {
      id: 'person-1',
      name: 'Тест',
      birthYear: 1900,
      deathYear: 1980,
      category: 'Философ',
      country: 'Россия',
      description: 'Описание',
      achievements: [],
    },
  ]

  it('should generate a question', () => {
    const question = generateSimpleFallback(mockPersons)

    expect(question).toHaveProperty('id')
    expect(question).toHaveProperty('type')
    expect(question).toHaveProperty('question')
    expect(question).toHaveProperty('correctAnswer')
    expect(question).toHaveProperty('data')
  })

  it('should generate one of simple question types', () => {
    const question = generateSimpleFallback(mockPersons)

    const validTypes = ['birthYear', 'deathYear', 'profession', 'country']
    expect(validTypes).toContain(question.type)
  })

  it('should include person data', () => {
    const question = generateSimpleFallback(mockPersons)

    expect(question.data.person).toHaveProperty('id')
    expect(question.data.person).toHaveProperty('name')
  })

  it('should have 4 options (for generated arrays)', () => {
    const question = generateSimpleFallback(mockPersons)

    if ('options' in question.data) {
      expect(question.data.options).toHaveLength(4)
    }
  })

  it('should generate consistent ID format', () => {
    const question = generateSimpleFallback(mockPersons)

    expect(question.id).toMatch(/^(birth-year|death-year|profession|country)-person-1$/)
  })

  it('should handle multiple persons', () => {
    const multiplePersons = [
      ...mockPersons,
      {
        id: 'person-2',
        name: 'Другой',
        birthYear: 1850,
        deathYear: 1920,
        category: 'Художник',
        country: 'Франция',
        description: 'Описание 2',
        achievements: [],
      },
    ]

    const question = generateSimpleFallback(multiplePersons)

    const ids = multiplePersons.map(p => p.id)
    expect(ids).toContain(question.data.person.id)
  })

  it('should handle person without death year', () => {
    const personsWithoutDeath = [
      {
        ...mockPersons[0],
        deathYear: null as any,
      },
    ]

    const question = generateSimpleFallback(personsWithoutDeath)

    // Should still generate a question, possibly using current year as fallback for deathYear
    expect(question).toBeDefined()
  })
})






