import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SingleChoiceQuestion } from '../SingleChoiceQuestion'
import { SingleChoiceQuestionData, QuizAnswer, QuizPerson } from '../../../types'

// Mock the textUtils
jest.mock('../../../utils/textUtils', () => ({
  hideYearsInText: jest.fn((text: string) => text.replace(/\d{4}/g, 'XXXX')),
}))

const mockPerson: QuizPerson = {
  id: '1',
  name: 'Тест Персона',
  description: 'Описание персоны 1860 года',
  imageUrl: 'https://example.com/image.jpg',
}

const mockQuestionData: SingleChoiceQuestionData = {
  person: mockPerson,
  questionText: 'В каком году родился?',
  options: ['1850', '1860', '1870', '1880'],
  correctAnswer: '1860',
  answerLabel: '1860 год',
}

const mockUserAnswer: QuizAnswer = {
  questionId: '1',
  answer: '1860',
  isCorrect: true,
  timeSpent: 5000,
}

describe('SingleChoiceQuestion', () => {
  const defaultProps = {
    data: mockQuestionData,
    onAnswer: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<SingleChoiceQuestion {...defaultProps} />)
    
    expect(screen.getByText('Тест Персона')).toBeInTheDocument()
    expect(screen.getByText('В каком году родился?')).toBeInTheDocument()
  })

  it('should render person image when provided', () => {
    render(<SingleChoiceQuestion {...defaultProps} />)
    
    const image = screen.getByAltText('Тест Персона')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should render all answer options', () => {
    render(<SingleChoiceQuestion {...defaultProps} />)
    
    expect(screen.getByText('1850')).toBeInTheDocument()
    expect(screen.getByText('1860')).toBeInTheDocument()
    expect(screen.getByText('1870')).toBeInTheDocument()
    expect(screen.getByText('1880')).toBeInTheDocument()
  })

  it('should call onAnswer when option is clicked', () => {
    const onAnswer = jest.fn()
    render(<SingleChoiceQuestion {...defaultProps} onAnswer={onAnswer} />)
    
    const optionButton = screen.getByText('1860')
    fireEvent.click(optionButton)
    
    expect(onAnswer).toHaveBeenCalledWith('1860')
  })

  it('should not allow answering when showFeedback is true', () => {
    const onAnswer = jest.fn()
    render(
      <SingleChoiceQuestion 
        {...defaultProps} 
        onAnswer={onAnswer}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    // Options should not be visible when showing feedback
    expect(screen.queryByText('1850')).not.toBeInTheDocument()
    
    // If they were visible, clicking should not trigger onAnswer
    const optionButtons = document.querySelectorAll('.quiz-option')
    optionButtons.forEach(button => {
      fireEvent.click(button)
    })
    
    expect(onAnswer).not.toHaveBeenCalled()
  })

  it('should show feedback when showFeedback is true', () => {
    render(
      <SingleChoiceQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    expect(screen.getByText('Правильно!')).toBeInTheDocument()
    expect(screen.getByText('Ваш ответ: 1860')).toBeInTheDocument()
    expect(screen.getByText('Правильный ответ: 1860 год')).toBeInTheDocument()
  })

  it('should show incorrect feedback', () => {
    const incorrectAnswer: QuizAnswer = {
      ...mockUserAnswer,
      answer: '1850',
      isCorrect: false,
    }
    
    render(
      <SingleChoiceQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={incorrectAnswer}
      />
    )
    
    expect(screen.getByText('Неправильно')).toBeInTheDocument()
    expect(screen.getByText('Ваш ответ: 1850')).toBeInTheDocument()
  })

  it('should render next button in feedback', () => {
    const onNext = jest.fn()
    render(
      <SingleChoiceQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
        onNext={onNext}
      />
    )
    
    const nextButton = screen.getByText('Далее')
    expect(nextButton).toBeInTheDocument()
    
    fireEvent.click(nextButton)
    expect(onNext).toHaveBeenCalled()
  })

  it('should show finish button for last question', () => {
    const onNext = jest.fn()
    render(
      <SingleChoiceQuestion 
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

  it('should render person info button when showFeedback is true', () => {
    const onPersonInfoClick = jest.fn()
    render(
      <SingleChoiceQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
        onPersonInfoClick={onPersonInfoClick}
      />
    )
    
    const infoButton = screen.getByTitle('Подробная информация')
    expect(infoButton).toBeInTheDocument()
    
    fireEvent.click(infoButton)
    expect(onPersonInfoClick).toHaveBeenCalledWith(mockPerson)
  })

  it('should hide years in description when not showing feedback', () => {
    render(<SingleChoiceQuestion {...defaultProps} />)
    
    // The description should have years hidden
    expect(screen.getByText(/Описание персоны XXXX года/)).toBeInTheDocument()
  })

  it('should show full description when showing feedback', () => {
    render(
      <SingleChoiceQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    // The description should show with years when showing feedback
    expect(screen.getByText(/Описание персоны 1860 года/)).toBeInTheDocument()
  })

  it('should handle person without image', () => {
    const dataWithoutImage = {
      ...mockQuestionData,
      person: {
        ...mockPerson,
        imageUrl: null,
      },
    }
    
    render(<SingleChoiceQuestion {...defaultProps} data={dataWithoutImage} />)
    
    expect(screen.queryByAltText('Тест Персона')).not.toBeInTheDocument()
    expect(screen.getByText('Тест Персона')).toBeInTheDocument()
  })

  it('should handle person without description', () => {
    const dataWithoutDescription = {
      ...mockQuestionData,
      person: {
        ...mockPerson,
        description: null,
      },
    }
    
    render(<SingleChoiceQuestion {...defaultProps} data={dataWithoutDescription} />)
    
    expect(screen.getByText('Тест Персона')).toBeInTheDocument()
    expect(screen.queryByText(/Описание персоны/)).not.toBeInTheDocument()
  })
})
