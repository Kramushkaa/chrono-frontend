import { generateDeathYearQuestion } from '../deathYearGenerator'
import { generateProfessionQuestion } from '../professionGenerator'
import { generateCountryQuestion } from '../countryGenerator'
import type { Person } from '../../../../shared/types'

// Mock fallback generator
vi.mock('../fallbackGenerator', () => ({
  generateSimpleFallback: vi.fn().mockReturnValue({
    id: 'fallback-1',
    type: 'birthYear',
    question: 'Fallback question',
    correctAnswer: '1900',
    data: {},
  }),
}))

describe('Simple Quiz Generators', () => {
  const mockPersons: Person[] = [
    {
      id: 'person-1',
      name: 'Личность 1',
      birthYear: 1900,
      deathYear: 1980,
      category: 'Философ',
      country: 'Россия',
      description: 'Описание 1',
      achievements: [],
    },
    {
      id: 'person-2',
      name: 'Личность 2',
      birthYear: 1850,
      deathYear: 1920,
      category: 'Художник',
      country: 'Франция',
      description: 'Описание 2',
      achievements: [],
    },
    {
      id: 'person-3',
      name: 'Личность 3',
      birthYear: 1920,
      deathYear: 2000,
      category: 'Ученый',
      country: 'США',
      description: 'Описание 3',
      achievements: [],
    },
    {
      id: 'person-4',
      name: 'Личность 4',
      birthYear: 1800,
      deathYear: 1870,
      category: 'Писатель',
      country: 'Германия',
      description: 'Описание 4',
      achievements: [],
    },
  ]

  describe('generateDeathYearQuestion', () => {
    it('should generate death year question', () => {
      const question = generateDeathYearQuestion(mockPersons)

      expect(question.type).toBe('deathYear')
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('question')
      expect(question).toHaveProperty('correctAnswer')
    })

    it('should have 4 options', () => {
      const question = generateDeathYearQuestion(mockPersons)

      expect(question.data.options).toHaveLength(4)
    })

    it('should include correct death year in options', () => {
      const question = generateDeathYearQuestion(mockPersons)

      expect(question.data.options).toContain(question.data.correctDeathYear)
    })

    it('should generate unique options', () => {
      const question = generateDeathYearQuestion(mockPersons)

      const uniqueOptions = new Set(question.data.options)
      expect(uniqueOptions.size).toBe(4)
    })

    it('should format question text', () => {
      const question = generateDeathYearQuestion(mockPersons)

      expect(question.question).toContain('В каком году умер')
    })

    it('should use fallback for person without death year', async () => {
      const { generateSimpleFallback } = await import('../fallbackGenerator')
      
      const personWithoutDeath = [{
        ...mockPersons[0],
        deathYear: null,
      }]

      generateDeathYearQuestion(personWithoutDeath as any)

      expect(vi.mocked(generateSimpleFallback)).toHaveBeenCalled()
    })
  })

  describe('generateProfessionQuestion', () => {
    it('should generate profession question', () => {
      const question = generateProfessionQuestion(mockPersons)

      expect(question.type).toBe('profession')
      expect(question).toHaveProperty('data')
      expect(question.data).toHaveProperty('correctProfession')
    })

    it('should have 4 unique category options', () => {
      const question = generateProfessionQuestion(mockPersons)

      expect(question.data.options).toHaveLength(4)
      const uniqueOptions = new Set(question.data.options)
      expect(uniqueOptions.size).toBe(4)
    })

    it('should include correct profession', () => {
      const question = generateProfessionQuestion(mockPersons)

      expect(question.data.options).toContain(question.data.correctProfession)
    })

    it('should format question text', () => {
      const question = generateProfessionQuestion(mockPersons)

      expect(question.question).toContain('К какой области деятельности относится')
    })

    it('should use fallback when not enough categories', async () => {
      const { generateSimpleFallback } = await import('../fallbackGenerator')
      
      const limitedPersons = [
        { ...mockPersons[0], category: 'Философ' },
        { ...mockPersons[1], category: 'Философ' },
      ]

      generateProfessionQuestion(limitedPersons)

      expect(vi.mocked(generateSimpleFallback)).toHaveBeenCalled()
    })
  })

  describe('generateCountryQuestion', () => {
    it('should generate country question', () => {
      const question = generateCountryQuestion(mockPersons)

      expect(question.type).toBe('country')
      expect(question).toHaveProperty('data')
      expect(question.data).toHaveProperty('correctCountry')
    })

    it('should have 4 unique country options', () => {
      const question = generateCountryQuestion(mockPersons)

      expect(question.data.options).toHaveLength(4)
      const uniqueOptions = new Set(question.data.options)
      expect(uniqueOptions.size).toBe(4)
    })

    it('should include correct country', () => {
      const question = generateCountryQuestion(mockPersons)

      expect(question.data.options).toContain(question.data.correctCountry)
    })

    it('should format question text', () => {
      const question = generateCountryQuestion(mockPersons)

      expect(question.question).toContain('В какой стране родился')
    })

    it('should handle array countries', () => {
      const personsWithArrayCountry = [
        { ...mockPersons[0], country: ['Россия', 'СССР'] as any },
        ...mockPersons.slice(1),
      ]

      const question = generateCountryQuestion(personsWithArrayCountry)

      expect(typeof question.data.correctCountry).toBe('string')
    })

    it('should use fallback when not enough countries', async () => {
      const { generateSimpleFallback } = await import('../fallbackGenerator')
      
      const limitedPersons = [
        { ...mockPersons[0], country: 'Россия' },
        { ...mockPersons[1], country: 'Россия' },
      ]

      generateCountryQuestion(limitedPersons)

      expect(vi.mocked(generateSimpleFallback)).toHaveBeenCalled()
    })
  })
})






