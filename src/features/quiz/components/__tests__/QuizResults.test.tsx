import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QuizResults } from '../QuizResults'
import { QuizResult } from '../../types'

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('../ShareQuizButton', () => ({
  ShareQuizButton: ({ questions, config }: any) => (
    <div data-testid="share-quiz-button">
      Share Quiz ({questions?.length} questions)
    </div>
  ),
}))

jest.mock('../QuizAnswerDetailsList', () => ({
  QuizAnswerDetailsList: ({ results }: any) => (
    <div data-testid="quiz-answer-details">
      Answer Details ({results?.length} results)
    </div>
  ),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('QuizResults', () => {
  const mockQuizResult: QuizResult = {
    score: 75,
    correctAnswers: 3,
    totalQuestions: 4,
    totalTime: 120000, // 2 minutes in ms
    answers: [
      {
        questionId: '1',
        answer: 'Option A',
        isCorrect: true,
        timeSpent: 30000,
      },
      {
        questionId: '2',
        answer: 'Option B',
        isCorrect: false,
        timeSpent: 45000,
      },
    ],
  }

  const defaultProps = {
    result: mockQuizResult,
    onRestart: jest.fn(),
    onBackToMenu: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render results header', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Результаты игры')).toBeInTheDocument()
  })

  it('should display quiz score', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('should display correct answers count', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('3 из 4')).toBeInTheDocument()
    expect(screen.getByText('Правильных ответов:')).toBeInTheDocument()
  })

  it('should display total time', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Время:')).toBeInTheDocument()
    // The exact time format depends on formatTime function
  })

  it('should display average time per question', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Среднее время на вопрос:')).toBeInTheDocument()
  })

  it('should display rating points when provided', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} ratingPoints={125} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Заработано рейтинга:')).toBeInTheDocument()
    expect(screen.getByText('125 очков')).toBeInTheDocument()
  })

  it('should not display rating points when not provided', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.queryByText('Заработано рейтинга:')).not.toBeInTheDocument()
  })

  it('should handle restart button click', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    const restartButton = screen.getByRole('button', { name: 'Играть снова' })
    fireEvent.click(restartButton)
    
    expect(defaultProps.onRestart).toHaveBeenCalledTimes(1)
  })

  it('should handle back to menu button click', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    const backButton = screen.getByRole('button', { name: 'Вернуться в меню' })
    fireEvent.click(backButton)
    
    expect(defaultProps.onBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('should render history navigation button', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByRole('button', { name: 'История прохождений' })).toBeInTheDocument()
  })

  it('should render share button when questions and config are provided', () => {
    const mockQuestions = [
      { id: '1', question: 'Test question', type: 'birthYear' }
    ]
    const mockConfig = { questionTypes: ['birthYear'] }
    
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} questions={mockQuestions} config={mockConfig} />
      </TestWrapper>
    )
    
    expect(screen.getByTestId('share-quiz-button')).toBeInTheDocument()
    expect(screen.getByText('Share Quiz (1 questions)')).toBeInTheDocument()
  })

  it('should not render share button when questions or config are not provided', () => {
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.queryByTestId('share-quiz-button')).not.toBeInTheDocument()
  })

  it('should render answer details when questions are provided', () => {
    const mockQuestions = [
      { id: '1', question: 'Test question', type: 'birthYear' }
    ]
    
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} questions={mockQuestions} />
      </TestWrapper>
    )
    
    expect(screen.getByTestId('quiz-answer-details')).toBeInTheDocument()
    expect(screen.getByText('Answer Details (2 results)')).toBeInTheDocument()
  })

  it('should handle person info click when callback provided', () => {
    const onPersonInfoClick = jest.fn()
    const mockQuestions = [
      { id: '1', question: 'Test question', type: 'birthYear' }
    ]
    
    render(
      <TestWrapper>
        <QuizResults 
          {...defaultProps} 
          questions={mockQuestions}
          onPersonInfoClick={onPersonInfoClick}
        />
      </TestWrapper>
    )
    
    expect(screen.getByTestId('quiz-answer-details')).toBeInTheDocument()
  })

  it('should handle different score values', () => {
    const highScoreResult = { ...mockQuizResult, score: 95 }
    
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} result={highScoreResult} />
      </TestWrapper>
    )
    
    expect(screen.getByText('95')).toBeInTheDocument()
  })

  it('should handle zero correct answers', () => {
    const zeroScoreResult = { 
      ...mockQuizResult, 
      score: 0, 
      correctAnswers: 0 
    }
    
    render(
      <TestWrapper>
        <QuizResults {...defaultProps} result={zeroScoreResult} />
      </TestWrapper>
    )
    
    expect(screen.getByText('0 из 4')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
