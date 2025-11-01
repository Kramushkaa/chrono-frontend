import React, { useEffect } from 'react';
import { useSharedQuiz } from '../hooks/useSharedQuiz';
import { formatDate } from '../utils/formatters';
import type { SharedQuizLeaderboardEntry } from '../../../shared/dto/quiz-types';

interface SharedQuizLeaderboardProps {
  shareCode: string;
}

export const SharedQuizLeaderboard: React.FC<SharedQuizLeaderboardProps> = ({ shareCode }) => {
  const { leaderboard, loadLeaderboard } = useSharedQuiz();

  useEffect(() => {
    loadLeaderboard(shareCode);
  }, [shareCode, loadLeaderboard]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}м ${remainingSeconds}с`;
    }
    return `${remainingSeconds}с`;
  };

  if (leaderboard.loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">Загрузка...</div>
      </div>
    );
  }

  if (leaderboard.error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-error">
          <p>Ошибка загрузки: {leaderboard.error}</p>
          <button
            onClick={() => loadLeaderboard(shareCode)}
            className="quiz-button quiz-button-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const renderEntry = (entry: SharedQuizLeaderboardEntry, isCurrentUser = false) => (
    <div
      key={entry.userId || entry.rank}
      className={`leaderboard-entry ${isCurrentUser ? 'leaderboard-entry-current' : ''}`}
    >
      <div className="leaderboard-rank">{entry.rank}</div>
      <div className="leaderboard-username">{entry.username}</div>
      <div className="leaderboard-date">{formatDate(entry.completedAt)}</div>
      <div className="leaderboard-stats">
        <span className="leaderboard-score">
          {entry.correctAnswers}/{entry.totalQuestions}
        </span>
        <span className="leaderboard-time">{formatTime(entry.totalTimeMs)}</span>
      </div>
    </div>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>{leaderboard.quizTitle}</h2>
        <p className="leaderboard-subtitle">
          Всего попыток: {leaderboard.totalAttempts}
        </p>
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-list">
          <div className="leaderboard-list-header">
            <div className="leaderboard-rank-header">#</div>
            <div className="leaderboard-username-header">Игрок</div>
            <div className="leaderboard-date-header">Дата прохождения</div>
            <div className="leaderboard-stats-header">Результат</div>
          </div>

          {leaderboard.entries.map((entry) => renderEntry(entry))}

          {leaderboard.entries.length === 0 && (
            <div className="leaderboard-empty">
              <p>Пока никто не прошёл этот квиз. Будьте первым!</p>
            </div>
          )}
        </div>

        {/* User entry if not in top results */}
        {leaderboard.userEntry &&
          !leaderboard.entries.find((e) => e.userId === leaderboard.userEntry!.userId) && (
            <div className="leaderboard-user-section">
              <h3>Ваш результат</h3>
              {renderEntry(leaderboard.userEntry, true)}
            </div>
          )}
      </div>
    </div>
  );
};




