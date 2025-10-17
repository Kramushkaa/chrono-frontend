import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { GlobalLeaderboardEntry } from '../../../shared/dto/quiz-types';

export const GlobalLeaderboard: React.FC = () => {
  const { topPlayers, userEntry, totalPlayers, loading, error, refresh } = useLeaderboard();
  const [showHelp, setShowHelp] = useState(false);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-error">
          <p>Ошибка загрузки: {error}</p>
          <button onClick={refresh} className="quiz-button quiz-button-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const renderEntry = (entry: GlobalLeaderboardEntry, isCurrentUser = false) => (
    <div
      key={entry.userId || entry.rank}
      className={`leaderboard-entry ${isCurrentUser ? 'leaderboard-entry-current' : ''}`}
    >
      <div className="leaderboard-rank">{entry.rank}</div>
      <div className="leaderboard-username">{entry.username}</div>
      <div className="leaderboard-stats">
        <span className="leaderboard-rating">{entry.totalRating.toFixed(0)} очков</span>
        <span className="leaderboard-games">{entry.gamesPlayed} игр</span>
        <span className="leaderboard-avg">{entry.averageScore.toFixed(1)}% средний</span>
      </div>
    </div>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Глобальный лидерборд</h2>
        <p className="leaderboard-subtitle">Всего игроков: {totalPlayers}</p>
        <button
          className="leaderboard-help-button"
          onClick={() => setShowHelp(true)}
          title="Как рассчитывается рейтинг?"
          aria-label="Как рассчитывается рейтинг?"
        >
          ?
        </button>
      </div>

      <div className="leaderboard-content">
        {/* Top 100 players */}
        <div className="leaderboard-list">
          <div className="leaderboard-list-header">
            <div className="leaderboard-rank-header">#</div>
            <div className="leaderboard-username-header">Игрок</div>
            <div className="leaderboard-stats-header">Статистика</div>
          </div>

          {topPlayers.map((entry) => renderEntry(entry))}

          {topPlayers.length === 0 && (
            <div className="leaderboard-empty">
              <p>Пока нет результатов. Будьте первым!</p>
            </div>
          )}
        </div>

        {/* User entry if not in top 100 */}
        {userEntry && !topPlayers.find((p) => p.userId === userEntry.userId) && (
          <div className="leaderboard-user-section">
            <h3>Ваша позиция</h3>
            {renderEntry(userEntry, true)}
          </div>
        )}
      </div>

      <div className="leaderboard-info">
        <h3>Как рассчитывается рейтинг?</h3>
        <p>
          Рейтинг = Базовый балл × Множитель сложности × Бонус за время
        </p>
        <ul>
          <li>Базовый балл: (Правильные ответы / Всего вопросов) × 100</li>
          <li>Множитель сложности: зависит от количества и типов вопросов</li>
          <li>Бонус за время: до +50% если все ответы правильные и быстрые</li>
        </ul>
      </div>

      {/* Модальное окно с объяснением на мобильных */}
      {showHelp && (
        <div className="leaderboard-help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="leaderboard-help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="leaderboard-help-modal-header">
              <h3>Как рассчитывается рейтинг?</h3>
              <button
                className="leaderboard-help-modal-close"
                onClick={() => setShowHelp(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <p>
              Рейтинг = Базовый балл × Множитель сложности × Бонус за время
            </p>
            <ul>
              <li>Базовый балл: (Правильные ответы / Всего вопросов) × 100</li>
              <li>Множитель сложности: зависит от количества и типов вопросов</li>
              <li>Бонус за время: до +50% если все ответы правильные и быстрые</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

