import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { GlobalLeaderboardEntry } from '../../../shared/dto/quiz-types';

export const GlobalLeaderboard: React.FC = () => {
  const {
    topPlayers,
    userEntry,
    totalPlayers,
    loading,
    error,
    refresh,
    currentPage,
    totalPages,
    canGoPrev,
    canGoNext,
    goToNextPage,
    goToPrevPage,
  } = useLeaderboard();
  const [showHelp, setShowHelp] = useState(false);
  const isUserOnCurrentPage =
    Boolean(userEntry) && topPlayers.some((entry) => entry.userId === userEntry?.userId);

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
          <button
            onClick={refresh}
            className="quiz-button quiz-button-primary"
            data-testid="leaderboard-error-retry"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const renderEntry = (
    entry: GlobalLeaderboardEntry,
    options: { isCurrentUser?: boolean; label?: string } = {}
  ) => (
    <div
      key={entry.userId || entry.rank}
      className={`leaderboard-entry ${options.isCurrentUser ? 'leaderboard-entry-current' : ''}`}
      data-testid="leaderboard-entry"
    >
      <div className="leaderboard-rank">{entry.rank}</div>
      <div className="leaderboard-username">
        {entry.username}
        {options.label && <span className="leaderboard-entry-label">{options.label}</span>}
      </div>
      <div className="leaderboard-stats">
        <span className="leaderboard-rating">{entry.totalRating.toFixed(0)} очков</span>
        <span className="leaderboard-games">{entry.gamesPlayed} игр</span>
        <span className="leaderboard-avg">{entry.averageScore.toFixed(1)}% средний</span>
      </div>
    </div>
  );

  return (
    <>
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

            {topPlayers.map((entry) =>
              renderEntry(entry, {
                isCurrentUser: Boolean(userEntry && entry.userId === userEntry.userId),
                label: userEntry && entry.userId === userEntry.userId ? 'Ваше место' : undefined,
              })
            )}

            {userEntry && !isUserOnCurrentPage && (
              <>
                <div className="leaderboard-entry-divider" aria-hidden="true">
                  <span>...</span>
                </div>
                {renderEntry(userEntry, { isCurrentUser: true, label: 'Ваше место' })}
              </>
            )}

            {topPlayers.length === 0 && (
              <div className="leaderboard-empty">
                <p>Пока нет результатов. Будьте первым!</p>
              </div>
            )}
          </div>
        </div>

        <div className="leaderboard-pagination">
          <button
            className="quiz-button quiz-button-secondary leaderboard-pagination-button"
            data-testid="leaderboard-pagination-prev"
            onClick={goToPrevPage}
            disabled={!canGoPrev || loading}
            type="button"
          >
            ← Назад
          </button>
          <span className="leaderboard-pagination-info" data-testid="leaderboard-page-indicator">
            Страница {Math.min(currentPage + 1, totalPages)} из {totalPages}
            <span className="leaderboard-pagination-count">
              · Игроков: {totalPlayers.toLocaleString()}
            </span>
          </span>
          <button
            className="quiz-button quiz-button-secondary leaderboard-pagination-button"
            data-testid="leaderboard-pagination-next"
            onClick={goToNextPage}
            disabled={!canGoNext || loading}
            type="button"
          >
            Вперёд →
          </button>
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
      </div>

      {/* Модальное окно вынесено за пределы leaderboard-container */}
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
            <div className="leaderboard-help-modal-footer">
              <button
                className="leaderboard-help-modal-ok"
                onClick={() => setShowHelp(false)}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};




