import { generateBirthOrderQuestion } from '../birthOrderGenerator'
import { generateGuessPersonQuestion } from '../guessPersonGenerator'
import type { Person } from '../../../../shared/types'

// Mock fallback generator
jest.mock('../fallbackGenerator', () => ({
  generateSimpleFallback: jest.fn().mockReturnValue({
    id: 'fallback-1',
    type: 'birthYear',
    question: 'Fallback question',
    correctAnswer: '1900',
    data: {},
  }),
}))

describe('Complex Quiz Generators', () => {
  // Need at least 10 persons for guessPerson generator
  const mockPersons: Person[] = Array.from({ length: 12 }, (_, i) => ({
    id: `person-${i + 1}`,
    name: `Личность ${i + 1}`,
    birthYear: 1800 + i * 20,
    deathYear: 1850 + i * 20,
    category: ['Философ', 'Художник', 'Ученый', 'Писатель'][i % 4],
    country: ['Россия', 'Франция', 'США', 'Германия'][i % 4],
    description: `Описание ${i + 1}`,
    achievements: [],
    status: 'approved',
  }))

  beforeEach(() => {
    // Clear fallback mock before each test
    const { generateSimpleFallback } = require('../fallbackGenerator')
    generateSimpleFallback.mockClear()
  })

  describe('generateBirthOrderQuestion', () => {
    it('should generate birth order question', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      expect(question.type).toBe('birthOrder')
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('data')
    })

    it('should select multiple persons', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      expect(question.data.persons.length).toBeGreaterThanOrEqual(2)
    })

    it('should have correct order', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      expect(Array.isArray(question.data.correctOrder)).toBe(true)
      expect(question.data.correctOrder.length).toBe(question.data.persons.length)
    })

    it('should sort persons by birth year in correct order', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      const { persons, correctOrder } = question.data
      
      // Verify correctOrder is actually sorted
      for (let i = 0; i < correctOrder.length - 1; i++) {
        const person1 = persons.find(p => p.id === correctOrder[i])!
        const person2 = persons.find(p => p.id === correctOrder[i + 1])!
        
        expect(person1.birthYear).toBeLessThanOrEqual(person2.birthYear)
      }
    })

    it('should use fallback when not enough unique birth years', () => {
      const { generateSimpleFallback } = require('../fallbackGenerator')
      
      const singleYearPersons = [
        { ...mockPersons[0], birthYear: 1900 },
        { ...mockPersons[1], birthYear: 1900 },
      ]

      generateBirthOrderQuestion(singleYearPersons)

      expect(generateSimpleFallback).toHaveBeenCalled()
    })

    it('should include person metadata', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      question.data.persons.forEach(person => {
        expect(person).toHaveProperty('id')
        expect(person).toHaveProperty('name')
        expect(person).toHaveProperty('birthYear')
        expect(person).toHaveProperty('category')
      })
    })

    it('should format question text', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      expect(question.question).toContain('Расставьте личности по году рождения')
    })

    it('should set correct answer as array of IDs', () => {
      const question = generateBirthOrderQuestion(mockPersons)

      expect(Array.isArray(question.correctAnswer)).toBe(true)
      expect(question.correctAnswer.length).toBeGreaterThan(0)
    })
  })

  describe('generateGuessPersonQuestion', () => {
    it('should generate guess person question', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      expect(question.type).toBe('guessPerson')
      expect(question).toHaveProperty('data')
    })

    it('should include correct person', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      expect(question.data.correctPerson).toHaveProperty('id')
      expect(question.data.correctPerson).toHaveProperty('name')
      expect(question.data.correctPerson).toHaveProperty('description')
    })

    it('should include list of available persons', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      expect(Array.isArray(question.data.availablePersons)).toBe(true)
      expect(question.data.availablePersons.length).toBeGreaterThan(0)
    })

    it('should set correct answer to person id', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      expect(question.correctAnswer).toBe(question.data.correctPerson.id)
    })

    it('should only use approved persons', () => {
      const mixedPersons = [
        ...mockPersons,
        {
          id: 'person-draft',
          name: 'Draft Person',
          birthYear: 1950,
          deathYear: 2020,
          category: 'Test',
          country: 'Test',
          description: 'Draft',
          achievements: [],
          status: 'draft',
        },
      ]

      const question = generateGuessPersonQuestion(mixedPersons as any)

      // correctPerson should be from approved persons (not the draft one)
      expect(question.data.correctPerson.id).toMatch(/^person-\d+$/)
      expect(question.data.correctPerson.id).not.toBe('person-draft')
    })

    it('should use fallback when not enough approved persons', () => {
      const { generateSimpleFallback } = require('../fallbackGenerator')
      
      const fewPersons = mockPersons.slice(0, 5) // Less than 10

      generateGuessPersonQuestion(fewPersons)

      expect(generateSimpleFallback).toHaveBeenCalled()
    })

    it('should format question text', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      expect(question.question).toBe('Угадайте, о ком идёт речь:')
    })

    it('should generate consistent id format', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      expect(question.id).toContain('guess-person')
    })

    it('should include all required person fields', () => {
      const question = generateGuessPersonQuestion(mockPersons)

      const { correctPerson } = question.data
      expect(correctPerson).toHaveProperty('birthYear')
      expect(correctPerson).toHaveProperty('deathYear')
      expect(correctPerson).toHaveProperty('category')
      expect(correctPerson).toHaveProperty('country')
    })

    it('should handle persons without status (approved by default)', () => {
      const personsNoStatus = mockPersons.map(p => {
        const { status, ...rest } = p
        return rest
      })

      const question = generateGuessPersonQuestion(personsNoStatus as any)

      expect(question.data.correctPerson).toBeDefined()
    })
  })
})

