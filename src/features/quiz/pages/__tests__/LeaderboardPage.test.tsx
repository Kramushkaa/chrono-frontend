import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeaderboardPage from '../LeaderboardPage';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../components/GlobalLeaderboard', () => ({
  GlobalLeaderboard: () => <div data-testid="global-leaderboard">Global Leaderboard</div>,
}));

jest.mock('shared/ui/SEO', () => ({
  SEO: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="seo">
      <div data-testid="seo-title">{title}</div>
      <div data-testid="seo-description">{description}</div>
    </div>
  ),
}));

jest.mock('shared/layout/AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header">App Header</div>,
}));

jest.mock('shared/ui/ContactFooter', () => ({
  ContactFooter: () => <div data-testid="contact-footer">Contact Footer</div>,
}));

jest.mock('../utils/headerProps', () => ({
  getMinimalHeaderProps: () => ({}),
}));

describe('LeaderboardPage', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderWithRouter(<LeaderboardPage />);
    
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('global-leaderboard')).toBeInTheDocument();
    expect(screen.getByTestId('contact-footer')).toBeInTheDocument();
  });

  it('renders with correct SEO', () => {
    renderWithRouter(<LeaderboardPage />);
    
    expect(screen.getByTestId('seo-title')).toHaveTextContent('Глобальный лидерборд | Хронониндзя');
    expect(screen.getByTestId('seo-description')).toHaveTextContent('Глобальный лидерборд квизов - соревнуйтесь с другими игроками и проверьте свои знания истории!');
  });

  it('renders action buttons', () => {
    renderWithRouter(<LeaderboardPage />);
    
    expect(screen.getByText('Играть в квиз')).toBeInTheDocument();
    expect(screen.getByText('На главную')).toBeInTheDocument();
  });

  it('navigates to quiz when "Играть в квиз" button is clicked', () => {
    renderWithRouter(<LeaderboardPage />);
    
    const playButton = screen.getByText('Играть в квиз');
    fireEvent.click(playButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/quiz');
  });

  it('navigates to home when "На главную" button is clicked', () => {
    renderWithRouter(<LeaderboardPage />);
    
    const homeButton = screen.getByText('На главную');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has proper CSS classes', () => {
    renderWithRouter(<LeaderboardPage />);
    
    expect(document.querySelector('.app')).toBeInTheDocument();
    expect(document.querySelector('.quiz-content')).toBeInTheDocument();
    expect(document.querySelector('.quiz-page')).toBeInTheDocument();
    expect(document.querySelector('.leaderboard-actions')).toBeInTheDocument();
  });

  it('has proper button classes', () => {
    renderWithRouter(<LeaderboardPage />);
    
    const playButton = screen.getByText('Играть в квиз');
    const homeButton = screen.getByText('На главную');
    
    expect(playButton).toHaveClass('quiz-button', 'quiz-button-primary');
    expect(homeButton).toHaveClass('quiz-button', 'quiz-button-secondary');
  });
});
