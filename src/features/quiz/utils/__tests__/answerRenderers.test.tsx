import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  renderMatchingTable,
  renderBirthOrderList,
  renderContemporariesGroups,
  renderGuessPersonDetails,
  formatAnswer,
} from '../answerRenderers'
import type { QuizQuestion, QuizPerson } from '../../types'

describe('answerRenderers', () => {
  const mockPerson: QuizPerson = {
    id: 'person-1',
    name: 'Тестовая Личность',
    birthYear: 1900,
    deathYear: 1980,
    category: 'Философ',
    imageUrl: '/test.jpg',
  }

  describe('renderMatchingTable', () => {
    const mockQuestion: QuizQuestion = {
      id: 'q1',
      type: 'achievementsMatch',
      question: 'Сопоставьте достижения',
      correctAnswer: ['Достижение 1', 'Достижение 2'],
      data: {
        persons: [mockPerson, { ...mockPerson, id: 'person-2', name: 'Личность 2' }],
        achievements: ['Достижение 1', 'Достижение 2'],
        correctMatches: {},
      },
    }

    it('should render matching table', () => {
      const result = renderMatchingTable('q1', mockQuestion, ['Достижение 1', 'Достижение 2'])
      render(<div>{result}</div>)

      expect(screen.getByText('Личность')).toBeInTheDocument()
      expect(screen.getByText('Ваш ответ')).toBeInTheDocument()
      expect(screen.getByText('Правильный ответ')).toBeInTheDocument()
    })

    it('should show correct/incorrect indicators', () => {
      const result = renderMatchingTable('q1', mockQuestion, ['Достижение 1', 'Wrong'])
      const { container } = render(<div>{result}</div>)

      expect(container.querySelector('.match-correct')).toBeInTheDocument()
      expect(container.querySelector('.match-incorrect')).toBeInTheDocument()
    })

    it('should render person info button when callback provided', () => {
      const mockCallback = vi.fn()
      const result = renderMatchingTable('q1', mockQuestion, ['Достижение 1', 'Достижение 2'], mockCallback)
      render(<div>{result}</div>)

      const buttons = screen.getAllByLabelText(/Подробная информация/)
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should call onPersonInfoClick when info button clicked', async () => {
      const user = userEvent.setup()
      const mockCallback = vi.fn()
      const result = renderMatchingTable('q1', mockQuestion, ['Достижение 1', 'Достижение 2'], mockCallback)
      render(<div>{result}</div>)

      const button = screen.getAllByLabelText(/Подробная информация/)[0]
      await user.click(button)

      expect(mockCallback).toHaveBeenCalledWith(mockPerson)
    })

    it('should return null for wrong question type', () => {
      const wrongQuestion = { ...mockQuestion, type: 'birthYear' as const }
      const result = renderMatchingTable('q1', wrongQuestion, [])

      expect(result).toBeNull()
    })

    it('should return null for undefined question', () => {
      const result = renderMatchingTable('q1', undefined, [])

      expect(result).toBeNull()
    })

    it('should handle empty user answer', () => {
      const result = renderMatchingTable('q1', mockQuestion, [])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('—')
    })
  })

  describe('renderBirthOrderList', () => {
    const mockQuestion: QuizQuestion = {
      id: 'q2',
      type: 'birthOrder',
      question: 'Расставьте по порядку',
      correctAnswer: ['person-1', 'person-2'],
      data: {
        persons: [mockPerson, { ...mockPerson, id: 'person-2', name: 'Личность 2', birthYear: 1920 }],
        correctOrder: ['person-1', 'person-2'],
      },
    }

    it('should render birth order lists', () => {
      const result = renderBirthOrderList('q2', mockQuestion, ['person-1', 'person-2'])
      render(<div>{result}</div>)

      expect(screen.getByText('Ваш порядок:')).toBeInTheDocument()
      expect(screen.getByText('Правильный порядок:')).toBeInTheDocument()
    })

    it('should render person names and birth years', () => {
      const result = renderBirthOrderList('q2', mockQuestion, ['person-1', 'person-2'])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('Тестовая Личность')
      expect(container.textContent).toContain('(1900)')
    })

    it('should mark correct positions', () => {
      const result = renderBirthOrderList('q2', mockQuestion, ['person-1', 'person-2'])
      const { container } = render(<div>{result}</div>)

      expect(container.querySelectorAll('.order-correct').length).toBeGreaterThan(0)
    })

    it('should mark incorrect positions', () => {
      const result = renderBirthOrderList('q2', mockQuestion, ['person-2', 'person-1'])
      const { container } = render(<div>{result}</div>)

      expect(container.querySelectorAll('.order-incorrect').length).toBeGreaterThan(0)
    })

    it('should render person info buttons when callback provided', () => {
      const mockCallback = vi.fn()
      const result = renderBirthOrderList('q2', mockQuestion, ['person-1', 'person-2'], mockCallback)
      render(<div>{result}</div>)

      expect(screen.getAllByLabelText(/Подробная информация/).length).toBeGreaterThan(0)
    })

    it('should return null for wrong question type', () => {
      const wrongQuestion = { ...mockQuestion, type: 'achievementsMatch' as const }
      const result = renderBirthOrderList('q2', wrongQuestion, [])

      expect(result).toBeNull()
    })

    it('should handle missing person in data', () => {
      const result = renderBirthOrderList('q2', mockQuestion, ['person-999'])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('person-999')
    })
  })

  describe('renderContemporariesGroups', () => {
    const mockQuestion: QuizQuestion = {
      id: 'q3',
      type: 'contemporaries',
      question: 'Разделите на группы',
      correctAnswer: [['person-1'], ['person-2']],
      data: {
        persons: [
          mockPerson,
          { ...mockPerson, id: 'person-2', name: 'Личность 2', birthYear: 1920, deathYear: 2000 },
        ],
        correctGroups: [['person-1'], ['person-2']],
      },
    }

    it('should render contemporaries groups', () => {
      const result = renderContemporariesGroups('q3', mockQuestion, [['person-1'], ['person-2']])
      render(<div>{result}</div>)

      expect(screen.getByText('Ваши группы:')).toBeInTheDocument()
      expect(screen.getByText('Правильные группы:')).toBeInTheDocument()
    })

    it('should render person names with years', () => {
      const result = renderContemporariesGroups('q3', mockQuestion, [['person-1'], ['person-2']])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('Тестовая Личность')
      expect(container.textContent).toContain('(1900-1980)')
    })

    it('should handle person without death year', () => {
      const personAlive = { ...mockPerson, id: 'person-3', deathYear: undefined }
      const question = {
        ...mockQuestion,
        data: { ...mockQuestion.data, persons: [personAlive] },
      }
      const result = renderContemporariesGroups('q3', question, [['person-3']])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('н.в.')
    })

    it('should render group labels', () => {
      const result = renderContemporariesGroups('q3', mockQuestion, [['person-1'], ['person-2']])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('Группа 1:')
      expect(container.textContent).toContain('Группа 2:')
    })

    it('should render person info buttons when callback provided', () => {
      const mockCallback = vi.fn()
      const result = renderContemporariesGroups('q3', mockQuestion, [['person-1'], ['person-2']], mockCallback)
      render(<div>{result}</div>)

      expect(screen.getAllByLabelText(/Подробная информация/).length).toBeGreaterThan(0)
    })

    it('should return null for wrong question type', () => {
      const wrongQuestion = { ...mockQuestion, type: 'birthOrder' as const }
      const result = renderContemporariesGroups('q3', wrongQuestion, [])

      expect(result).toBeNull()
    })

    it('should handle missing person in data', () => {
      const result = renderContemporariesGroups('q3', mockQuestion, [['person-999']])
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('person-999')
    })
  })

  describe('renderGuessPersonDetails', () => {
    const mockQuestion: QuizQuestion = {
      id: 'q4',
      type: 'guessPerson',
      question: 'Угадайте личность',
      correctAnswer: 'person-1',
      data: {
        correctPerson: mockPerson,
        persons: [mockPerson, { ...mockPerson, id: 'person-2', name: 'Личность 2' }],
        years: '1900-1980',
        country: 'Россия',
        category: 'Философ',
        description: 'Известная личность',
      },
    }

    it('should render guess person details', () => {
      const result = renderGuessPersonDetails('q4', mockQuestion, 'person-1')
      render(<div>{result}</div>)

      expect(screen.getByText('Вопрос:')).toBeInTheDocument()
      expect(screen.getByText('Ваш ответ:')).toBeInTheDocument()
      expect(screen.getByText('Правильный ответ:')).toBeInTheDocument()
    })

    it('should render clues with emojis', () => {
      const result = renderGuessPersonDetails('q4', mockQuestion, 'person-1')
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('📅 1900-1980')
      expect(container.textContent).toContain('🌍 Россия')
      expect(container.textContent).toContain('🎭 Философ')
    })

    it('should render description', () => {
      const result = renderGuessPersonDetails('q4', mockQuestion, 'person-1')
      render(<div>{result}</div>)

      expect(screen.getByText('Известная личность')).toBeInTheDocument()
    })

    it('should render person info buttons when callback provided', () => {
      const mockCallback = vi.fn()
      const result = renderGuessPersonDetails('q4', mockQuestion, 'person-1', mockCallback)
      render(<div>{result}</div>)

      expect(screen.getAllByLabelText(/Подробная информация/).length).toBeGreaterThan(0)
    })

    it('should call onPersonInfoClick when info button clicked', async () => {
      const user = userEvent.setup()
      const mockCallback = vi.fn()
      const result = renderGuessPersonDetails('q4', mockQuestion, 'person-1', mockCallback)
      render(<div>{result}</div>)

      const button = screen.getAllByLabelText(/Подробная информация/)[0]
      await user.click(button)

      expect(mockCallback).toHaveBeenCalled()
    })

    it('should return null for wrong question type', () => {
      const wrongQuestion = { ...mockQuestion, type: 'contemporaries' as const }
      const result = renderGuessPersonDetails('q4', wrongQuestion, 'person-1')

      expect(result).toBeNull()
    })

    it('should handle missing user person', () => {
      const result = renderGuessPersonDetails('q4', mockQuestion, 'person-999')
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('person-999')
    })

    it('should handle missing correct person in persons array', () => {
      const questionNoCorrect = {
        ...mockQuestion,
        data: { ...mockQuestion.data, persons: [{ ...mockPerson, id: 'person-2' }] },
      }
      const result = renderGuessPersonDetails('q4', questionNoCorrect, 'person-2')
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('person-1') // fallback to correctAnswer
    })

    it('should handle empty user answer', () => {
      const result = renderGuessPersonDetails('q4', mockQuestion, '')
      const { container } = render(<div>{result}</div>)

      expect(container.textContent).toContain('—')
    })
  })

  describe('formatAnswer', () => {
    it('should format string answer', () => {
      expect(formatAnswer('Simple answer')).toBe('Simple answer')
    })

    it('should format number answer', () => {
      expect(formatAnswer(1900)).toBe('1900')
    })

    it('should format array of strings', () => {
      expect(formatAnswer(['Answer 1', 'Answer 2'])).toBe('Answer 1, Answer 2')
    })

    it('should format empty array', () => {
      expect(formatAnswer([])).toBe('Не дан ответ')
    })

    it('should format array of arrays (groups)', () => {
      const groups = [['person-1', 'person-2'], ['person-3']]
      const result = formatAnswer(groups)

      expect(result).toContain('Группа 1: person-1, person-2')
      expect(result).toContain('Группа 2: person-3')
      expect(result).toContain('|')
    })

    it('should handle null answer', () => {
      expect(formatAnswer(null)).toBe('Не дан ответ')
    })

    it('should handle undefined answer', () => {
      expect(formatAnswer(undefined)).toBe('Не дан ответ')
    })

    it('should handle empty string answer', () => {
      expect(formatAnswer('')).toBe('Не дан ответ')
    })

    it('should handle single element array', () => {
      expect(formatAnswer(['Single'])).toBe('Single')
    })
  })
})





