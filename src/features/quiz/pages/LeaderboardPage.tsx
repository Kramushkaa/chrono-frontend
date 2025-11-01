import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from 'shared/ui/SEO';
import { AppHeader } from 'shared/layout/AppHeader';
import { ContactFooter } from 'shared/ui/ContactFooter';
import { GlobalLeaderboard } from '../components/GlobalLeaderboard';
import { getMinimalHeaderProps } from '../utils/headerProps';
import '../styles/quiz.css';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app">
      <SEO
        title="Глобальный лидерборд | Хронониндзя"
        description="Глобальный лидерборд квизов - соревнуйтесь с другими игроками и проверьте свои знания истории!"
      />

      <AppHeader {...getMinimalHeaderProps({ 
        extraLeftButton: { label: '← К викторинам', onClick: () => navigate('/quiz') }
      })} />

      <main className="quiz-content">
        <div className="quiz-page">
          <GlobalLeaderboard />

          <div className="leaderboard-actions">
            <button
              onClick={() => navigate('/quiz')}
              className="quiz-button quiz-button-primary"
            >
              Играть в квиз
            </button>
            <button
              onClick={() => navigate('/')}
              className="quiz-button quiz-button-secondary"
            >
              На главную
            </button>
          </div>
        </div>
      </main>

      <ContactFooter />
    </div>
  );
};

export default LeaderboardPage;




