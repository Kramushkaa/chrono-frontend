import React from 'react'
import { render, screen } from '@testing-library/react'
import { AchievementsMatchQuestion } from '../AchievementsMatchQuestion'
import { AchievementsMatchQuestionData, QuizAnswer } from '../../../types'

// Mock useMobile hook
jest.mock('shared/hooks/useMobile', () => ({
  useMobile: () => false,
}))

const mockQuestionData: AchievementsMatchQuestionData = {
  persons: [
    {
      id: '1',
      name: 'Иван Грозный',
      imageUrl: 'https://example.com/ivan.jpg',
    },
    {
      id: '2',
      name: 'Петр I',
      imageUrl: 'https://example.com/peter.jpg',
    },
  ],
  achievements: [
    'Основал Санкт-Петербург',
    'Создал регулярную армию',
    'Провел церковную реформу',
    'Завоевал Астрахань',
  ],
  correctMatches: {
    '1': 'Провел церковную реформу',
    '2': 'Основал Санкт-Петербург',
  },
}

const mockUserAnswer: QuizAnswer = {
  questionId: '1',
  answer: ['Основал Санкт-Петербург', 'Провел церковную реформу'],
  isCorrect: true,
  timeSpent: 25000,
}

describe('AchievementsMatchQuestion', () => {
  const defaultProps = {
    data: mockQuestionData,
    onAnswer: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<AchievementsMatchQuestion {...defaultProps} />)
    
    expect(screen.getByText(/сопоставьте достижения/i)).toBeInTheDocument()
  })

  it('should render all persons', () => {
    render(<AchievementsMatchQuestion {...defaultProps} />)
    
    expect(screen.getByText('Иван Грозный')).toBeInTheDocument()
    expect(screen.getByText('Петр I')).toBeInTheDocument()
  })

  it('should render all achievements', () => {
    render(<AchievementsMatchQuestion {...defaultProps} />)
    
    expect(screen.getByText('Основал Санкт-Петербург')).toBeInTheDocument()
    expect(screen.getByText('Создал регулярную армию')).toBeInTheDocument()
    expect(screen.getByText('Провел церковную реформу')).toBeInTheDocument()
    expect(screen.getByText('Завоевал Астрахань')).toBeInTheDocument()
  })

  it('should render person images when available', () => {
    render(<AchievementsMatchQuestion {...defaultProps} />)
    
    const images = document.querySelectorAll('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('should show feedback when showFeedback is true', () => {
    render(
      <AchievementsMatchQuestion 
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
      answer: ['Провел церковную реформу', 'Основал Санкт-Петербург'],
      isCorrect: false,
    }
    
    render(
      <AchievementsMatchQuestion 
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
      <AchievementsMatchQuestion 
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
      <AchievementsMatchQuestion 
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

  it('should handle persons without images', () => {
    const dataWithoutImages = {
      ...mockQuestionData,
      persons: mockQuestionData.persons.map(person => ({
        ...person,
        imageUrl: null,
      })),
    }
    
    render(<AchievementsMatchQuestion {...defaultProps} data={dataWithoutImages} />)
    
    expect(screen.getByText('Иван Грозный')).toBeInTheDocument()
    expect(screen.getByText('Петр I')).toBeInTheDocument()
  })

  it('should render drag and drop instruction', () => {
    render(<AchievementsMatchQuestion {...defaultProps} />)
    
    expect(screen.getByText(/перетащите достижения/i)).toBeInTheDocument()
  })
})
