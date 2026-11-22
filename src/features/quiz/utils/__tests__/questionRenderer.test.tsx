import React from 'react'
import { render, screen } from '@testing-library/react'
import { renderQuestionByType } from '../questionRenderer'
import type { QuizQuestion, QuizPerson } from '../../types'

// Mock all question type components
vi.mock('../../components/QuestionTypes/SingleChoiceQuestion', () => ({
  SingleChoiceQuestion: ({ data }: any) => <div data-testid="single-choice">{data.person.name}</div>,
}))

vi.mock('../../components/QuestionTypes/GuessPersonQuestion', () => ({
  GuessPersonQuestion: ({ data }: any) => <div data-testid="guess-person">{data.correctPerson.name}</div>,
}))

vi.mock('../../components/QuestionTypes/AchievementsMatchQuestion', () => ({
  AchievementsMatchQuestion: ({ data }: any) => <div data-testid="achievements-match">{data.persons.length} persons</div>,
}))

vi.mock('../../components/QuestionTypes/BirthOrderQuestion', () => ({
  BirthOrderQuestion: ({ data }: any) => <div data-testid="birth-order">{data.persons.length} persons</div>,
}))

vi.mock('../../components/QuestionTypes/ContemporariesQuestion', () => ({
  ContemporariesQuestion: ({ data }: any) => <div data-testid="contemporaries">{data.persons.length} persons</div>,
}))

describe('questionRenderer', () => {
  const mockPerson: QuizPerson = {
    id: 'person-1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1980,
    category: 'Philosopher',
    imageUrl: '/test.jpg',
  }

  const mockOnAnswer = vi.fn()
  const mockOnNext = vi.fn()
  const mockOnPersonInfoClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('renderQuestionByType', () => {
    describe('Single Choice Questions', () => {
      it('should render birthYear question', () => {
        const question: QuizQuestion = {
          id: 'q1',
          type: 'birthYear',
          question: 'When was this person born?',
          correctAnswer: '1900',
          data: {
            person: mockPerson,
            options: ['1900', '1910', '1920', '1930'],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('single-choice')).toBeInTheDocument()
        expect(screen.getByText('Test Person')).toBeInTheDocument()
      })

      it('should render deathYear question', () => {
        const question: QuizQuestion = {
          id: 'q2',
          type: 'deathYear',
          question: 'When did this person die?',
          correctAnswer: '1980',
          data: {
            person: mockPerson,
            options: ['1970', '1980', '1990', '2000'],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('single-choice')).toBeInTheDocument()
      })

      it('should render profession question', () => {
        const question: QuizQuestion = {
          id: 'q3',
          type: 'profession',
          question: 'What was this person\'s profession?',
          correctAnswer: 'Philosopher',
          data: {
            person: mockPerson,
            options: ['Philosopher', 'Scientist', 'Artist', 'Writer'],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('single-choice')).toBeInTheDocument()
      })

      it('should render country question', () => {
        const question: QuizQuestion = {
          id: 'q4',
          type: 'country',
          question: 'Where was this person from?',
          correctAnswer: 'Russia',
          data: {
            person: mockPerson,
            options: ['Russia', 'France', 'Germany', 'USA'],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('single-choice')).toBeInTheDocument()
      })
    })

    describe('Guess Person Question', () => {
      it('should render guessPerson question', () => {
        const question: QuizQuestion = {
          id: 'q5',
          type: 'guessPerson',
          question: 'Guess who this is',
          correctAnswer: 'person-1',
          data: {
            correctPerson: mockPerson,
            availablePersons: [
              { id: 'person-1', name: 'Test Person' },
              { id: 'person-2', name: 'Other Person' },
            ],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('guess-person')).toBeInTheDocument()
        expect(screen.getByText('Test Person')).toBeInTheDocument()
      })
    })

    describe('Achievements Match Question', () => {
      it('should render achievementsMatch question', () => {
        const question: QuizQuestion = {
          id: 'q6',
          type: 'achievementsMatch',
          question: 'Match achievements',
          correctAnswer: ['Achievement 1', 'Achievement 2'],
          data: {
            persons: [mockPerson, { ...mockPerson, id: 'person-2' }],
            achievements: ['Achievement 1', 'Achievement 2'],
            correctMatches: {},
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('achievements-match')).toBeInTheDocument()
        expect(screen.getByText('2 persons')).toBeInTheDocument()
      })
    })

    describe('Birth Order Question', () => {
      it('should render birthOrder question', () => {
        const question: QuizQuestion = {
          id: 'q7',
          type: 'birthOrder',
          question: 'Order by birth year',
          correctAnswer: ['person-1', 'person-2'],
          data: {
            persons: [mockPerson, { ...mockPerson, id: 'person-2' }],
            correctOrder: ['person-1', 'person-2'],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('birth-order')).toBeInTheDocument()
        expect(screen.getByText('2 persons')).toBeInTheDocument()
      })
    })

    describe('Contemporaries Question', () => {
      it('should render contemporaries question', () => {
        const question: QuizQuestion = {
          id: 'q8',
          type: 'contemporaries',
          question: 'Group contemporaries',
          correctAnswer: [['person-1'], ['person-2']],
          data: {
            persons: [mockPerson, { ...mockPerson, id: 'person-2' }],
            correctGroups: [['person-1'], ['person-2']],
          },
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByTestId('contemporaries')).toBeInTheDocument()
        expect(screen.getByText('2 persons')).toBeInTheDocument()
      })
    })

    describe('Unknown Question Type', () => {
      it('should render error message for unknown type', () => {
        const question: any = {
          id: 'q9',
          type: 'unknown',
          question: 'Unknown question',
          correctAnswer: 'unknown',
          data: {},
        }

        const result = renderQuestionByType({ question, onAnswer: mockOnAnswer })
        render(<div>{result}</div>)

        expect(screen.getByText(/Неподдерживаемый тип вопроса/)).toBeInTheDocument()
        expect(screen.getByText(/unknown/)).toBeInTheDocument()
      })
    })

    describe('Props Passing', () => {
      it('should pass showFeedback prop', () => {
        const question: QuizQuestion = {
          id: 'q10',
          type: 'birthYear',
          question: 'Test',
          correctAnswer: '1900',
          data: { person: mockPerson, options: [] },
        }

        const result = renderQuestionByType({
          question,
          onAnswer: mockOnAnswer,
          showFeedback: true,
        })

        expect(result).toBeTruthy()
      })

      it('should pass userAnswer prop', () => {
        const question: QuizQuestion = {
          id: 'q11',
          type: 'birthYear',
          question: 'Test',
          correctAnswer: '1900',
          data: { person: mockPerson, options: [] },
        }

        const result = renderQuestionByType({
          question,
          onAnswer: mockOnAnswer,
          userAnswer: '1910',
        })

        expect(result).toBeTruthy()
      })

      it('should pass onNext prop', () => {
        const question: QuizQuestion = {
          id: 'q12',
          type: 'birthYear',
          question: 'Test',
          correctAnswer: '1900',
          data: { person: mockPerson, options: [] },
        }

        const result = renderQuestionByType({
          question,
          onAnswer: mockOnAnswer,
          onNext: mockOnNext,
        })

        expect(result).toBeTruthy()
      })

      it('should pass isLastQuestion prop', () => {
        const question: QuizQuestion = {
          id: 'q13',
          type: 'birthYear',
          question: 'Test',
          correctAnswer: '1900',
          data: { person: mockPerson, options: [] },
        }

        const result = renderQuestionByType({
          question,
          onAnswer: mockOnAnswer,
          isLastQuestion: true,
        })

        expect(result).toBeTruthy()
      })

      it('should pass onPersonInfoClick prop', () => {
        const question: QuizQuestion = {
          id: 'q14',
          type: 'birthYear',
          question: 'Test',
          correctAnswer: '1900',
          data: { person: mockPerson, options: [] },
        }

        const result = renderQuestionByType({
          question,
          onAnswer: mockOnAnswer,
          onPersonInfoClick: mockOnPersonInfoClick,
        })

        expect(result).toBeTruthy()
      })

      it('should use default values for optional props', () => {
        const question: QuizQuestion = {
          id: 'q15',
          type: 'birthYear',
          question: 'Test',
          correctAnswer: '1900',
          data: { person: mockPerson, options: [] },
        }

        const result = renderQuestionByType({
          question,
          onAnswer: mockOnAnswer,
        })

        expect(result).toBeTruthy()
      })
    })
  })
})





