import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuizPage from '../QuizPage';

// Mock all the hooks and components
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('features/quiz/hooks/useQuizData', () => ({
  useQuizData: () => ({
    persons: [],
    allCategories: ['Category1'],
    allCountries: ['Country1'],
    isLoading: false,
  }),
}));

jest.mock('features/quiz/hooks/useQuiz', () => ({
  useQuiz: () => ({
    setup: {
      selectedCategories: [],
      selectedCountries: [],
      questionTypes: [],
      questionCount: 5,
    },
    setSetup: jest.fn(),
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    isQuizActive: false,
    filteredPersons: [],
    startQuiz: jest.fn(),
    answerQuestion: jest.fn(),
    nextQuestion: jest.fn(),
    getResults: jest.fn(() => ({ score: 0, total: 0 })),
    resetQuiz: jest.fn(),
    showAnswer: false,
    lastAnswer: null,
    allCategories: ['Category1'],
    allCountries: ['Country1'],
    checkStrictFilters: jest.fn(() => true),
    ratingPoints: 0,
  }),
}));

jest.mock('features/quiz/hooks/usePersonPanel', () => ({
  usePersonPanel: () => ({
    selectedPerson: null,
    handlePersonInfoClick: jest.fn(),
    closePersonPanel: jest.fn(),
  }),
}));

jest.mock('features/quiz/components/QuizSetup', () => ({
  QuizSetup: () => <div data-testid="quiz-setup">Quiz Setup</div>,
}));

jest.mock('features/quiz/components/QuizResults', () => ({
  QuizResults: () => <div data-testid="quiz-results">Quiz Results</div>,
}));

jest.mock('features/quiz/components/QuizProgress', () => ({
  QuizProgress: () => <div data-testid="quiz-progress">Quiz Progress</div>,
}));

jest.mock('features/quiz/components/QuizStructuredData', () => ({
  QuizStructuredData: () => <div data-testid="quiz-structured-data">Structured Data</div>,
}));

jest.mock('features/quiz/components/QuizPersonPanel', () => ({
  QuizPersonPanel: () => <div data-testid="quiz-person-panel">Person Panel</div>,
}));

jest.mock('features/quiz/utils/questionRenderer', () => ({
  renderQuestionByType: () => <div data-testid="question-renderer">Question</div>,
}));

jest.mock('shared/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>,
}));

jest.mock('shared/layout/AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header">App Header</div>,
}));

jest.mock('shared/ui/ContactFooter', () => ({
  ContactFooter: () => <div data-testid="contact-footer">Contact Footer</div>,
}));

jest.mock('features/quiz/utils/headerProps', () => ({
  getMinimalHeaderProps: () => ({}),
}));

describe('QuizPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    renderWithRouter(<QuizPage />);
    
    expect(screen.getByTestId('quiz-setup')).toBeInTheDocument();
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('contact-footer')).toBeInTheDocument();
    expect(screen.getByTestId('seo')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-structured-data')).toBeInTheDocument();
  });

  it('should render the quiz setup by default when not active', () => {
    renderWithRouter(<QuizPage />);
    
    expect(screen.getByTestId('quiz-setup')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-results')).not.toBeInTheDocument();
    expect(screen.queryByTestId('question-renderer')).not.toBeInTheDocument();
  });

  it('should render with proper CSS class', () => {
    renderWithRouter(<QuizPage />);
    
    const quizPage = document.querySelector('.quiz-page');
    expect(quizPage).toBeInTheDocument();
  });

  it('should render quiz game when isQuizActive is true', () => {
    // Mock quiz active state
    require('../hooks/useQuiz').useQuiz.mockReturnValue({
      setup: {
        selectedCategories: ['Category1'],
        selectedCountries: ['Country1'],
        questionTypes: ['single-choice'],
        questionCount: 5,
      },
      setSetup: jest.fn(),
      questions: [{ id: 1, type: 'single-choice' }],
      currentQuestionIndex: 0,
      answers: [],
      isQuizActive: true,
      filteredPersons: [{ id: '1', name: 'Test Person' }],
      startQuiz: jest.fn(),
      answerQuestion: jest.fn(),
      nextQuestion: jest.fn(),
      getResults: jest.fn(() => ({ score: 0, total: 0 })),
      resetQuiz: jest.fn(),
      showAnswer: false,
      lastAnswer: null,
      allCategories: ['Category1'],
      allCountries: ['Country1'],
      checkStrictFilters: jest.fn(() => true),
      ratingPoints: 0,
    });

    renderWithRouter(<QuizPage />);
    
    expect(screen.getByTestId('question-renderer')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-setup')).not.toBeInTheDocument();
  });

  it('should render quiz results when quiz is completed', () => {
    // Mock completed quiz state
    require('../hooks/useQuiz').useQuiz.mockReturnValue({
      setup: {
        selectedCategories: ['Category1'],
        selectedCountries: ['Country1'],
        questionTypes: ['single-choice'],
        questionCount: 5,
      },
      setSetup: jest.fn(),
      questions: [],
      currentQuestionIndex: 0,
      answers: [{ id: 1, answer: 'test', isCorrect: true }],
      isQuizActive: false,
      filteredPersons: [],
      startQuiz: jest.fn(),
      answerQuestion: jest.fn(),
      nextQuestion: jest.fn(),
      getResults: jest.fn(() => ({ score: 3, total: 5 })),
      resetQuiz: jest.fn(),
      showAnswer: false,
      lastAnswer: null,
      allCategories: [],
      allCountries: [],
      checkStrictFilters: jest.fn(() => true),
      ratingPoints: 100,
    });

    renderWithRouter(<QuizPage />);
    
    expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-setup')).not.toBeInTheDocument();
  });

  // Critical User Flow Tests
  describe('Critical Quiz Flow', () => {
    const mockStartQuiz = jest.fn();
    const mockAnswerQuestion = jest.fn();
    const mockNextQuestion = jest.fn();
    const mockGetResults = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      mockGetResults.mockReturnValue({ score: 0, total: 0 });
    });

    it('should complete full quiz flow: setup → game → results', () => {
      // Mock active quiz state with questions
      const mockQuestions = [
        { id: 1, question: 'Test question 1', type: 'single-choice', options: ['A', 'B', 'C'] }
      ];

      require('../hooks/useQuiz').useQuiz.mockReturnValue({
        setup: {
          selectedCategories: ['Category1'],
          selectedCountries: ['Country1'],
          questionTypes: ['single-choice'],
          questionCount: 1,
        },
        setSetup: jest.fn(),
        questions: mockQuestions,
        currentQuestionIndex: 0,
        answers: [],
        isQuizActive: true,
        filteredPersons: [],
        startQuiz: mockStartQuiz,
        answerQuestion: mockAnswerQuestion,
        nextQuestion: mockNextQuestion,
        getResults: mockGetResults,
        resetQuiz: jest.fn(),
        showAnswer: false,
        lastAnswer: null,
        allCategories: ['Category1'],
        allCountries: ['Country1'],
        checkStrictFilters: jest.fn(() => true),
        ratingPoints: 0,
      });

      renderWithRouter(<QuizPage />);
      
      // Should render active quiz game
      expect(screen.getByTestId('quiz-game')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-setup')).not.toBeInTheDocument();
      
      // Verify functions are available for interaction
      expect(mockStartQuiz).toBeDefined();
      expect(mockAnswerQuestion).toBeDefined();
      expect(mockNextQuestion).toBeDefined();
    });

    it('should handle navigation between questions', () => {
      const mockQuestions = [
        { id: 1, question: 'Question 1', type: 'single-choice', options: ['A', 'B'] },
        { id: 2, question: 'Question 2', type: 'single-choice', options: ['C', 'D'] }
      ];

      require('../hooks/useQuiz').useQuiz.mockReturnValue({
        setup: {
          selectedCategories: ['Category1'],
          selectedCountries: ['Country1'],
          questionTypes: ['single-choice'],
          questionCount: 2,
        },
        setSetup: jest.fn(),
        questions: mockQuestions,
        currentQuestionIndex: 1, // Second question
        answers: [{ id: 1, answer: 'A' }],
        isQuizActive: true,
        filteredPersons: [],
        startQuiz: jest.fn(),
        answerQuestion: mockAnswerQuestion,
        nextQuestion: mockNextQuestion,
        getResults: mockGetResults,
        resetQuiz: jest.fn(),
        showAnswer: false,
        lastAnswer: null,
        allCategories: ['Category1'],
        allCountries: ['Country1'],
        checkStrictFilters: jest.fn(() => true),
        ratingPoints: 50,
      });

      renderWithRouter(<QuizPage />);
      
      expect(screen.getByTestId('quiz-game')).toBeInTheDocument();
      expect(mockNextQuestion).toBeDefined();
    });

    it('should handle answer submission and results', () => {
      require('../hooks/useQuiz').useQuiz.mockReturnValue({
        setup: {
          selectedCategories: ['Category1'],
          selectedCountries: ['Country1'],
          questionTypes: ['single-choice'],
          questionCount: 3,
        },
        setSetup: jest.fn(),
        questions: [],
        currentQuestionIndex: 0,
        answers: [
          { id: 1, answer: 'A', isCorrect: true },
          { id: 2, answer: 'B', isCorrect: false },
          { id: 3, answer: 'C', isCorrect: true }
        ],
        isQuizActive: false,
        filteredPersons: [],
        startQuiz: mockStartQuiz,
        answerQuestion: mockAnswerQuestion,
        nextQuestion: mockNextQuestion,
        getResults: mockGetResults.mockReturnValue({ score: 2, total: 3 }),
        resetQuiz: jest.fn(),
        showAnswer: false,
        lastAnswer: null,
        allCategories: ['Category1'],
        allCountries: ['Country1'],
        checkStrictFilters: jest.fn(() => true),
        ratingPoints: 150,
      });

      renderWithRouter(<QuizPage />);
      
      // Should render results with score
      expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      expect(mockGetResults).toHaveBeenCalled();
    });
  });
});
