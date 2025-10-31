import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContemporariesQuestion } from '../ContemporariesQuestion'
import { ContemporariesQuestionData, QuizAnswer } from '../../../types'

// Mock all the hooks
jest.mock('shared/hooks/useMobile', () => ({
  useMobile: () => false,
}))

jest.mock('../../../hooks/useContemporariesGroups', () => ({
  useContemporariesGroups: () => ({
    groups: [['person1', 'person2'], ['person3']],
    createGroup: jest.fn(),
    addToGroup: jest.fn(),
    removeGroup: jest.fn(),
  }),
}))

jest.mock('../../../hooks/useContemporariesDragDrop', () => ({
  useContemporariesDragDrop: () => ({
    draggedOverGroup: -1,
    draggedItem: null,
    draggedOverCreateZone: false,
    handleDragOverGroup: jest.fn(),
    handleDragEnterGroup: jest.fn(),
    handleDragLeaveGroup: jest.fn(),
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleTouchStart: jest.fn(),
    handleTouchMove: jest.fn(),
    handleDragOverCreateZone: jest.fn(),
    handleDragEnterCreateZone: jest.fn(),
    handleDragLeaveCreateZone: jest.fn(),
    handleDrop: jest.fn(),
    handleDropToCreateGroup: jest.fn(),
    handleTouchEnd: jest.fn(),
  }),
}))

jest.mock('../../../hooks/useContemporariesFeedback', () => ({
  useContemporariesFeedback: () => ({
    getPersonStatus: jest.fn(),
  }),
}))

jest.mock('../../ContemporariesGroupZone', () => ({
  ContemporariesGroupZone: ({ group, groupIndex, ...props }: any) => (
    <div data-testid={`group-${groupIndex}`} {...props}>
      Group {groupIndex + 1} with {group.length} persons
    </div>
  ),
}))

const mockPersons = [
  {
    id: 'person1',
    name: 'Первый Человек',
    birthYear: 1800,
    deathYear: 1850,
    category: 'Правители',
    imageUrl: 'https://example.com/person1.jpg',
  },
  {
    id: 'person2',
    name: 'Второй Человек',
    birthYear: 1805,
    deathYear: 1855,
    category: 'Правители',
    imageUrl: 'https://example.com/person2.jpg',
  },
  {
    id: 'person3',
    name: 'Третий Человек',
    birthYear: 1900,
    deathYear: 1950,
    category: 'Ученые',
    imageUrl: 'https://example.com/person3.jpg',
  },
]

const mockQuestionData: ContemporariesQuestionData = {
  persons: mockPersons,
  correctGroups: [['person1', 'person2'], ['person3']],
}

const mockUserAnswer: QuizAnswer = {
  questionId: '1',
  answer: [['person1', 'person2'], ['person3']],
  isCorrect: true,
  timeSpent: 10000,
}

describe('ContemporariesQuestion', () => {
  const defaultProps = {
    data: mockQuestionData,
    onAnswer: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<ContemporariesQuestion {...defaultProps} />)
    
    expect(screen.getByText('Разделите на группы современников:')).toBeInTheDocument()
  })

  it('should render instruction hint for desktop', () => {
    render(<ContemporariesQuestion {...defaultProps} />)
    
    expect(screen.getByText(/Перетащите карточки в группы или создайте новые группы/)).toBeInTheDocument()
  })

  it('should render groups', () => {
    render(<ContemporariesQuestion {...defaultProps} />)
    
    // Should render group zones (mocked to show group info)
    expect(screen.getByTestId('group-0')).toBeInTheDocument()
    expect(screen.getByTestId('group-1')).toBeInTheDocument()
  })

  it('should render submit button when not showing feedback', () => {
    render(<ContemporariesQuestion {...defaultProps} />)
    
    const submitButton = screen.getByText('Проверить ответ')
    expect(submitButton).toBeInTheDocument()
  })

  it('should call onAnswer when submit button is clicked', () => {
    const onAnswer = jest.fn()
    render(<ContemporariesQuestion {...defaultProps} onAnswer={onAnswer} />)
    
    const submitButton = screen.getByText('Проверить ответ')
    fireEvent.click(submitButton)
    
    expect(onAnswer).toHaveBeenCalledWith([['person1', 'person2'], ['person3']])
  })

  it('should show feedback when showFeedback is true', () => {
    render(
      <ContemporariesQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    expect(screen.getByText('Правильно!')).toBeInTheDocument()
    expect(screen.getByText(/Время: 10с/)).toBeInTheDocument()
  })

  it('should show incorrect feedback', () => {
    const incorrectAnswer: QuizAnswer = {
      ...mockUserAnswer,
      isCorrect: false,
    }
    
    render(
      <ContemporariesQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={incorrectAnswer}
      />
    )
    
    expect(screen.getByText('Неправильно')).toBeInTheDocument()
  })

  it('should show correct groups explanation in feedback', () => {
    render(
      <ContemporariesQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    expect(screen.getByText('Правильная группировка:')).toBeInTheDocument()
    expect(screen.getByText('Группа 1:')).toBeInTheDocument()
    expect(screen.getByText('Группа 2:')).toBeInTheDocument()
  })

  it('should render next button in feedback', () => {
    const onNext = jest.fn()
    render(
      <ContemporariesQuestion 
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
      <ContemporariesQuestion 
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

  it('should not show submit button when showing feedback', () => {
    render(
      <ContemporariesQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    expect(screen.queryByText('Проверить ответ')).not.toBeInTheDocument()
  })

  it('should not show instruction hint when showing feedback', () => {
    render(
      <ContemporariesQuestion 
        {...defaultProps}
        showFeedback={true}
        userAnswer={mockUserAnswer}
      />
    )
    
    expect(screen.queryByText(/Перетащите карточки в группы/)).not.toBeInTheDocument()
  })

  it('should have proper CSS classes', () => {
    const { container } = render(<ContemporariesQuestion {...defaultProps} />)
    
    const questionElement = container.querySelector('.contemporaries-question')
    expect(questionElement).toBeInTheDocument()
  })
})
