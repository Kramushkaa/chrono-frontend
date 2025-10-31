import React from 'react'
import { render, screen } from '@testing-library/react'
import { BirthOrderQuestion } from '../BirthOrderQuestion'
import { BirthOrderQuestionData, QuizAnswer } from '../../../types'

// Mock useMobile hook
jest.mock('shared/hooks/useMobile', () => ({
  useMobile: () => false,
}))

const mockQuestionData: BirthOrderQuestionData = {
  persons: [
    {
      id: '1',
      name: 'Иван Грозный',
      birthYear: 1530,
      deathYear: 1584,
      category: 'Правители',
      imageUrl: 'https://example.com/ivan.jpg',
    },
    {
      id: '2',
      name: 'Петр I',
      birthYear: 1672,
      deathYear: 1725,
      category: 'Правители',
      imageUrl: 'https://example.com/peter.jpg',
    },
    {
      id: '3',
      name: 'Екатерина II',
      birthYear: 1729,
      deathYear: 1796,
      category: 'Правители',
      imageUrl: 'https://example.com/catherine.jpg',
    },
  ],
  correctOrder: ['1', '2', '3'], // правильный порядок по рождению
}

const mockUserAnswer: QuizAnswer = {
  questionId: '1',
  answer: ['1', '2', '3'],
  isCorrect: true,
  timeSpent: 20000,
}

describe('BirthOrderQuestion', () => {
  const defaultProps = {
    data: mockQuestionData,
    onAnswer: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Math.random to make tests deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render without crashing', () => {
    render(<BirthOrderQuestion {...defaultProps} />)
    
    expect(screen.getByText(/расставьте по году рождения/i)).toBeInTheDocument()
  })

  it('should render all persons', () => {
    render(<BirthOrderQuestion {...defaultProps} />)
    
    expect(screen.getByText('Иван Грозный')).toBeInTheDocument()
    expect(screen.getByText('Петр I')).toBeInTheDocument()
    expect(screen.getByText('Екатерина II')).toBeInTheDocument()
  })

  it('should render person images when available', () => {
    render(<BirthOrderQuestion {...defaultProps} />)
    
    const images = document.querySelectorAll('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('should render instruction text', () => {
    render(<BirthOrderQuestion {...defaultProps} />)
    
    expect(screen.getByText(/перетащите личности/i)).toBeInTheDocument()
  })

  it('should show feedback when showFeedback is true', () => {
    render(
      <BirthOrderQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    expect(screen.getByText('Правильно!')).toBeInTheDocument()
  })

  it('should show incorrect feedback', () => {
    const incorrectAnswer: QuizAnswer = {
      ...mockUserAnswer,
      answer: ['2', '1', '3'],
      isCorrect: false,
    }
    
    render(
      <BirthOrderQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={incorrectAnswer}
      />
    )
    
    expect(screen.getByText('Неправильно')).toBeInTheDocument()
  })

  it('should render next button in feedback', () => {
    const onNext = jest.fn()
    render(
      <BirthOrderQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
        onNext={onNext}
      />
    )
    
    const nextButton = screen.getByText('Далее')
    expect(nextButton).toBeInTheDocument()
  })

  it('should handle persons without images', () => {
    const dataWithoutImages = {
      ...mockQuestionData,
      persons: mockQuestionData.persons.map(person => ({
        ...person,
        imageUrl: null,
      })),
    }
    
    render(<BirthOrderQuestion {...defaultProps} data={dataWithoutImages} />)
    
    expect(screen.getByText('Иван Грозный')).toBeInTheDocument()
    expect(screen.getByText('Петр I')).toBeInTheDocument()
    expect(screen.getByText('Екатерина II')).toBeInTheDocument()
  })
})
