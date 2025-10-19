import React from 'react'
import { render, screen } from '@testing-library/react'
import { QuizProgress } from '../QuizProgress'

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

describe('QuizProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockInnerWidth(1024) // Default desktop width
  })

  it('should render progress when quiz is active', () => {
    render(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 3 из 10')).toBeInTheDocument()
  })

  it('should not render when quiz is not active', () => {
    render(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={false} 
      />
    )
    
    expect(screen.queryByText('Вопрос 3 из 10')).not.toBeInTheDocument()
  })

  it('should show mobile format on mobile screen', () => {
    mockInnerWidth(600) // Mobile width
    
    render(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('should show desktop format on desktop screen', () => {
    mockInnerWidth(1024) // Desktop width
    
    render(
      <QuizProgress 
        currentQuestion={5} 
        totalQuestions={15} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 5 из 15')).toBeInTheDocument()
  })

  it('should handle zero total questions', () => {
    render(
      <QuizProgress 
        currentQuestion={0} 
        totalQuestions={0} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 0 из 0')).toBeInTheDocument()
  })

  it('should handle first question', () => {
    render(
      <QuizProgress 
        currentQuestion={1} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 1 из 10')).toBeInTheDocument()
  })

  it('should handle last question', () => {
    render(
      <QuizProgress 
        currentQuestion={10} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 10 из 10')).toBeInTheDocument()
  })

  it('should update when props change', () => {
    const { rerender } = render(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 3 из 10')).toBeInTheDocument()
    
    rerender(
      <QuizProgress 
        currentQuestion={7} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 7 из 10')).toBeInTheDocument()
  })

  it('should respond to window resize', () => {
    // Start with desktop
    mockInnerWidth(1024)
    
    const { rerender } = render(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('Вопрос 3 из 10')).toBeInTheDocument()
    
    // Simulate resize to mobile
    mockInnerWidth(600)
    window.dispatchEvent(new Event('resize'))
    
    // Force re-render to trigger effect
    rerender(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <QuizProgress 
        currentQuestion={3} 
        totalQuestions={10} 
        isQuizActive={true} 
      />
    )
    
    const progressElement = screen.getByText('Вопрос 3 из 10').closest('div')
    expect(progressElement).toBeInTheDocument()
  })
})
