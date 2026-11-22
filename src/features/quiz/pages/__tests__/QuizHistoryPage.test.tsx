import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuizHistoryPage } from '../QuizHistoryPage';

// Mock all dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('shared/api/quiz', () => ({
  getQuizHistory: vi.fn().mockResolvedValue({
    data: {
      attempts: [],
    },
  }),
}));

vi.mock('shared/layout/AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header">App Header</div>,
}));

vi.mock('features/quiz/utils/headerProps', () => ({
  getMinimalHeaderProps: () => ({}),
}));

vi.mock('shared/ui/ContactFooter', () => ({
  ContactFooter: () => <div data-testid="contact-footer">Contact Footer</div>,
}));

vi.mock('features/quiz/components/QuizStateMessages', () => ({
  QuizLoading: ({ message }: { message: string }) => (
    <div data-testid="quiz-loading">{message}</div>
  ),
  QuizError: ({ message }: { message: string }) => (
    <div data-testid="quiz-error">{message}</div>
  ),
  QuizEmpty: ({ message }: { message: string }) => (
    <div data-testid="quiz-empty">{message}</div>
  ),
}));

vi.mock('features/quiz/utils/formatters', () => ({
  formatTime: vi.fn(),
  formatDate: vi.fn(),
  getScorePercentage: vi.fn(),
}));

describe('QuizHistoryPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    renderWithRouter(<QuizHistoryPage />);
    
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('contact-footer')).toBeInTheDocument();
    expect(screen.getByText('История прохождений')).toBeInTheDocument();
  });

  it('should show loading state initially', async () => {
    renderWithRouter(<QuizHistoryPage />);
    
    // The loading state should be visible initially
    expect(screen.getByTestId('quiz-loading')).toBeInTheDocument();
    expect(screen.getByText('Загрузка истории...')).toBeInTheDocument();
  });

  it('should render with proper CSS classes', () => {
    renderWithRouter(<QuizHistoryPage />);
    
    const quizPage = document.querySelector('.quiz-page');
    expect(quizPage).toBeInTheDocument();
    
    const quizContent = document.querySelector('.quiz-content');
    expect(quizContent).toBeInTheDocument();
  });
});




