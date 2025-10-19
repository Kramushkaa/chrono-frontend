import React from 'react'
import { render, screen } from '@testing-library/react'
import { GuessPersonQuestion } from '../GuessPersonQuestion'
import { GuessPersonQuestionData, QuizAnswer } from '../../../types'

const mockQuestionData: GuessPersonQuestionData = {
  correctPerson: {
    id: '1',
    name: 'Александр Пушкин',
    birthYear: 1799,
    deathYear: 1837,
    category: 'Писатели',
    country: 'Россия',
    description: 'Великий русский поэт и писатель',
    imageUrl: 'https://example.com/pushkin.jpg',
  },
  availablePersons: [
    { id: '1', name: 'Александр Пушкин' },
    { id: '2', name: 'Лев Толстой' },
    { id: '3', name: 'Федор Достоевский' },
    { id: '4', name: 'Антон Чехов' },
  ],
}

const mockUserAnswer: QuizAnswer = {
  questionId: '1',
  answer: '1',
  isCorrect: true,
  timeSpent: 15000,
}

describe('GuessPersonQuestion', () => {
  const defaultProps = {
    data: mockQuestionData,
    onAnswer: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<GuessPersonQuestion {...defaultProps} />)
    
    expect(screen.getByText(/угадай личность/i)).toBeInTheDocument()
  })

  it('should render input field for guessing', () => {
    render(<GuessPersonQuestion {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should render person description clues', () => {
    render(<GuessPersonQuestion {...defaultProps} />)
    
    expect(screen.getByText(/Великий русский поэт и писатель/)).toBeInTheDocument()
  })

  it('should render available persons for selection when showing feedback', () => {
    render(
      <GuessPersonQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    // Should show the correct person and other options
    expect(screen.getByText('Александр Пушкин')).toBeInTheDocument()
  })

  it('should show feedback when showFeedback is true', () => {
    render(
      <GuessPersonQuestion 
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
      answer: '2',
      isCorrect: false,
    }
    
    render(
      <GuessPersonQuestion 
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
      <GuessPersonQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
        onNext={onNext}
      />
    )
    
    const nextButton = screen.getByText('Далее')
    expect(nextButton).toBeInTheDocument()
  })

  it('should show finish button for last question', () => {
    const onNext = jest.fn()
    render(
      <GuessPersonQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
        onNext={onNext}
        isLastQuestion={true}
      />
    )
    
    const finishButton = screen.getByText('Завершить игру')
    expect(finishButton).toBeInTheDocument()
  })

  it('should handle person without image', () => {
    const dataWithoutImage = {
      ...mockQuestionData,
      correctPerson: {
        ...mockQuestionData.correctPerson,
        imageUrl: null,
      },
    }
    
    render(
      <GuessPersonQuestion 
        {...defaultProps} 
        data={dataWithoutImage}
      />
    )
    
    expect(screen.getByText(/угадай личность/i)).toBeInTheDocument()
  })

  it('should handle person without description', () => {
    const dataWithoutDescription = {
      ...mockQuestionData,
      correctPerson: {
        ...mockQuestionData.correctPerson,
        description: null,
      },
    }
    
    render(
      <GuessPersonQuestion 
        {...defaultProps} 
        data={dataWithoutDescription}
      />
    )
    
    expect(screen.getByText(/угадай личность/i)).toBeInTheDocument()
  })
})
