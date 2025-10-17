import { generateAchievementsMatchQuestion } from '../achievementsMatchGenerator'
import { generateContemporariesQuestion } from '../contemporariesGenerator'
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

describe('Advanced Quiz Generators', () => {
  beforeEach(() => {
    const { generateSimpleFallback } = require('../fallbackGenerator')
    generateSimpleFallback.mockClear()
  })

  describe('generateAchievementsMatchQuestion', () => {
    const mockPersonsWithAchievements: Person[] = [
      {
        id: 'person-1',
        name: 'Личность 1',
        birthYear: 1900,
        deathYear: 1980,
        category: 'Философ',
        country: 'Россия',
        description: 'Описание',
        achievements: ['Достижение 1', 'Достижение 2'],
        status: 'approved',
      },
      {
        id: 'person-2',
        name: 'Личность 2',
        birthYear: 1850,
        deathYear: 1920,
        category: 'Художник',
        country: 'Франция',
        description: 'Описание',
        achievements: ['Достижение 3', 'Достижение 4'],
        status: 'approved',
      },
      {
        id: 'person-3',
        name: 'Личность 3',
        birthYear: 1920,
        deathYear: 2000,
        category: 'Ученый',
        country: 'США',
        description: 'Описание',
        achievements: ['Достижение 5'],
        status: 'approved',
      },
    ]

    it('should generate achievements match question', () => {
      const question = generateAchievementsMatchQuestion(mockPersonsWithAchievements)

      expect(question.type).toBe('achievementsMatch')
      expect(question).toHaveProperty('data')
    })

    it('should include persons and achievements', () => {
      const question = generateAchievementsMatchQuestion(mockPersonsWithAchievements)

      expect(Array.isArray(question.data.persons)).toBe(true)
      expect(Array.isArray(question.data.achievements)).toBe(true)
      expect(question.data.persons.length).toBeGreaterThan(0)
    })

    it('should have correct matches mapping', () => {
      const question = generateAchievementsMatchQuestion(mockPersonsWithAchievements)

      expect(question.data.correctMatches).toBeDefined()
      expect(typeof question.data.correctMatches).toBe('object')
    })

    it('should match achievements to persons correctly', () => {
      const question = generateAchievementsMatchQuestion(mockPersonsWithAchievements)

      const { persons, achievements, correctMatches } = question.data

      // Each person should have a matching achievement
      persons.forEach(person => {
        expect(correctMatches[person.id]).toBeDefined()
        expect(achievements).toContain(correctMatches[person.id])
      })
    })

    it('should have correct answer as array of achievements', () => {
      const question = generateAchievementsMatchQuestion(mockPersonsWithAchievements)

      expect(Array.isArray(question.correctAnswer)).toBe(true)
    })

    it('should use fallback when no achievements available', () => {
      const { generateSimpleFallback } = require('../fallbackGenerator')
      
      const personsNoAchievements = mockPersonsWithAchievements.map(p => ({
        ...p,
        achievements: [],
      }))

      generateAchievementsMatchQuestion(personsNoAchievements)

      expect(generateSimpleFallback).toHaveBeenCalled()
    })

    it('should format question text', () => {
      const question = generateAchievementsMatchQuestion(mockPersonsWithAchievements)

      expect(question.question).toBe('Сопоставьте достижения с личностями:')
    })
  })

  describe('generateContemporariesQuestion', () => {
    const mockPersonsForContemporaries: Person[] = [
      {
        id: 'person-1',
        name: 'Ранний 1',
        birthYear: 1800,
        deathYear: 1850,
        category: 'Философ',
        country: 'Россия',
        description: 'Описание',
        achievements: [],
        status: 'approved',
      },
      {
        id: 'person-2',
        name: 'Ранний 2',
        birthYear: 1810,
        deathYear: 1860,
        category: 'Художник',
        country: 'Франция',
        description: 'Описание',
        achievements: [],
        status: 'approved',
      },
      {
        id: 'person-3',
        name: 'Поздний 1',
        birthYear: 1900,
        deathYear: 1950,
        category: 'Ученый',
        country: 'США',
        description: 'Описание',
        achievements: [],
        status: 'approved',
      },
      {
        id: 'person-4',
        name: 'Поздний 2',
        birthYear: 1910,
        deathYear: 1960,
        category: 'Писатель',
        country: 'Германия',
        description: 'Описание',
        achievements: [],
        status: 'approved',
      },
    ]

    it('should generate contemporaries question', () => {
      const question = generateContemporariesQuestion(mockPersonsForContemporaries)

      expect(question.type).toBe('contemporaries')
      expect(question).toHaveProperty('data')
    })

    it('should use fallback when not enough persons', () => {
      const { generateSimpleFallback } = require('../fallbackGenerator')
      
      const fewPersons = mockPersonsForContemporaries.slice(0, 3)

      generateContemporariesQuestion(fewPersons)

      expect(generateSimpleFallback).toHaveBeenCalled()
    })

    it('should have persons data', () => {
      const question = generateContemporariesQuestion(mockPersonsForContemporaries)

      expect(Array.isArray(question.data.persons)).toBe(true)
      expect(question.data.persons.length).toBeGreaterThan(0)
    })

    it('should have correct groups', () => {
      const question = generateContemporariesQuestion(mockPersonsForContemporaries)

      expect(Array.isArray(question.data.correctGroups)).toBe(true)
    })

    it('should format question text', () => {
      const question = generateContemporariesQuestion(mockPersonsForContemporaries)

      expect(question.question).toBe('Разделите на группы современников')
    })

    it('should have correct answer as array of arrays', () => {
      const question = generateContemporariesQuestion(mockPersonsForContemporaries)

      expect(Array.isArray(question.correctAnswer)).toBe(true)
      if (question.correctAnswer.length > 0) {
        expect(Array.isArray(question.correctAnswer[0])).toBe(true)
      }
    })

    it('should include person metadata', () => {
      const question = generateContemporariesQuestion(mockPersonsForContemporaries)

      question.data.persons.forEach(person => {
        expect(person).toHaveProperty('id')
        expect(person).toHaveProperty('name')
        expect(person).toHaveProperty('birthYear')
        expect(person).toHaveProperty('deathYear')
      })
    })
  })
})

