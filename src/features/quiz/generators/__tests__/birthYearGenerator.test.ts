import { generateBirthYearQuestion } from '../birthYearGenerator'
import type { Person } from '../../../../shared/types'

describe('birthYearGenerator', () => {
  const mockPersons: Person[] = [
    {
      id: 'person-1',
      name: 'Тестовая Личность',
      birthYear: 1900,
      deathYear: 1980,
      category: 'Тест',
      country: 'Россия',
      description: 'Тестовое описание',
      achievements: [],
    },
    {
      id: 'person-2',
      name: 'Другая Личность',
      birthYear: 1850,
      deathYear: 1920,
      category: 'Тест',
      country: 'Франция',
      description: 'Другое описание',
      achievements: [],
    },
  ]

  it('should generate a birth year question', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(question).toHaveProperty('id')
    expect(question).toHaveProperty('type', 'birthYear')
    expect(question).toHaveProperty('question')
    expect(question).toHaveProperty('correctAnswer')
    expect(question).toHaveProperty('data')
  })

  it('should include person data', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(question.data.person).toHaveProperty('id')
    expect(question.data.person).toHaveProperty('name')
    expect(question.data.person).toHaveProperty('description')
  })

  it('should have 4 options', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(question.data.options).toHaveLength(4)
  })

  it('should include correct answer in options', () => {
    const question = generateBirthYearQuestion(mockPersons)

    const correctYear = question.data.correctBirthYear
    expect(question.data.options).toContain(correctYear)
  })

  it('should have unique options', () => {
    const question = generateBirthYearQuestion(mockPersons)

    const uniqueOptions = new Set(question.data.options)
    expect(uniqueOptions.size).toBe(4)
  })

  it('should format question text correctly', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(question.question).toContain('В каком году родился')
    expect(question.question).toMatch(/Тестовая Личность|Другая Личность/)
  })

  it('should set correct answer as string', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(typeof question.correctAnswer).toBe('string')
    const correctYear = parseInt(question.correctAnswer)
    expect([1900, 1850]).toContain(correctYear)
  })

  it('should match correctAnswer with data.correctAnswer', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(parseInt(question.correctAnswer)).toBe(question.data.correctAnswer)
  })

  it('should generate consistent id format', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(question.id).toMatch(/^birth-year-person-\d+$/)
  })

  it('should include answerLabel', () => {
    const question = generateBirthYearQuestion(mockPersons)

    expect(question.data.answerLabel).toBe(String(question.data.correctBirthYear))
  })

  it('should handle single person array', () => {
    const singlePerson = [mockPersons[0]]
    const question = generateBirthYearQuestion(singlePerson)

    expect(question.data.person.id).toBe('person-1')
    expect(question.data.correctBirthYear).toBe(1900)
  })
})

