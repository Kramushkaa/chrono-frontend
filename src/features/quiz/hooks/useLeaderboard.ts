import { useState, useEffect, useCallback } from 'react';
import {
  getGlobalLeaderboard,
  getUserStats,
} from '../../../shared/api';
import type {
  GlobalLeaderboardEntry,
  QuizAttemptDTO,
} from '../../../shared/dto/quiz-types';

interface LeaderboardState {
  topPlayers: GlobalLeaderboardEntry[];
  userEntry?: GlobalLeaderboardEntry;
  totalPlayers: number;
  loading: boolean;
  error: string | null;
}

interface UserStatsState {
  totalGames: number;
  totalRating: number;
  averageRating: number;
  bestRating: number;
  averageScore: number;
  rank?: number;
  recentAttempts: QuizAttemptDTO[];
  loading: boolean;
  error: string | null;
}

export const useLeaderboard = () => {
  const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>({
    topPlayers: [],
    userEntry: undefined,
    totalPlayers: 0,
    loading: true,
    error: null,
  });

  const loadLeaderboard = useCallback(async () => {
    try {
      setLeaderboardState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await getGlobalLeaderboard();

      if (response.success) {
        setLeaderboardState({
          topPlayers: response.data.topPlayers,
          userEntry: response.data.userEntry,
          totalPlayers: response.data.totalPlayers,
          loading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to load leaderboard');
      }
    } catch (error) {
      setLeaderboardState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
      }));
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    ...leaderboardState,
    refresh: loadLeaderboard,
  };
};

export const useUserStats = () => {
  const [statsState, setStatsState] = useState<UserStatsState>({
    totalGames: 0,
    totalRating: 0,
    averageRating: 0,
    bestRating: 0,
    averageScore: 0,
    rank: undefined,
    recentAttempts: [],
    loading: true,
    error: null,
  });

  const loadStats = useCallback(async () => {
    try {
      setStatsState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await getUserStats();

      if (response.success) {
        setStatsState({
          ...response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to load user stats');
      }
    } catch (error) {
      setStatsState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load user stats',
      }));
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    ...statsState,
    refresh: loadStats,
  };
};

