import { useState, useEffect, useCallback } from 'react';
import {
  getGlobalLeaderboard,
  getUserStats,
} from '../../../shared/api';
import type {
  GlobalLeaderboardEntry,
  LeaderboardPageInfo,
  QuizAttemptDTO,
} from '../../../shared/dto/quiz-types';
import type { GetGlobalLeaderboardParams } from '../../../shared/api/quiz';

interface LeaderboardState {
  topPlayers: GlobalLeaderboardEntry[];
  userEntry?: GlobalLeaderboardEntry & { isCurrentUser?: boolean };
  totalPlayers: number;
  page: LeaderboardPageInfo;
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

const DEFAULT_LIMIT = 30;

export const useLeaderboard = () => {
  const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>({
    topPlayers: [],
    userEntry: undefined,
    totalPlayers: 0,
    page: {
      limit: DEFAULT_LIMIT,
      offset: 0,
      hasMore: false,
    },
    loading: true,
    error: null,
  });

  const [pageRequest, setPageRequest] = useState<Required<GetGlobalLeaderboardParams>>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const loadLeaderboard = useCallback(async (params: { limit: number; offset: number }) => {
    try {
      setLeaderboardState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await getGlobalLeaderboard(params);

      if (response.success) {
        const pageInfo: LeaderboardPageInfo = response.data.page ?? {
          limit: params.limit,
          offset: params.offset,
          hasMore: params.offset + params.limit < response.data.totalPlayers,
        };

        setLeaderboardState({
          topPlayers: response.data.topPlayers,
          userEntry: response.data.userEntry,
          totalPlayers: response.data.totalPlayers,
          page: pageInfo,
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
    loadLeaderboard(pageRequest);
  }, [loadLeaderboard, pageRequest]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      setPageRequest((prev) => {
        const normalizedIndex = Math.max(0, pageIndex);
        const totalPages = prev.limit
          ? Math.max(1, Math.ceil(leaderboardState.totalPlayers / prev.limit))
          : 1;
        const boundedIndex = Math.min(normalizedIndex, totalPages - 1);
        const nextOffset = boundedIndex * prev.limit;

        if (nextOffset === prev.offset) {
          return prev;
        }

        return {
          ...prev,
          offset: nextOffset,
        };
      });
    },
    [leaderboardState.totalPlayers]
  );

  const goToNextPage = useCallback(() => {
    if (!leaderboardState.page.hasMore || leaderboardState.loading) {
      return;
    }
    setPageRequest((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  }, [leaderboardState.loading, leaderboardState.page.hasMore]);

  const goToPrevPage = useCallback(() => {
    if (leaderboardState.loading) {
      return;
    }

    setPageRequest((prev) => {
      if (prev.offset === 0) {
        return prev;
      }

      return {
        ...prev,
        offset: Math.max(prev.offset - prev.limit, 0),
      };
    });
  }, [leaderboardState.loading]);

  const currentPage = leaderboardState.page.limit
    ? Math.floor(leaderboardState.page.offset / leaderboardState.page.limit)
    : 0;
  const totalPages = leaderboardState.page.limit
    ? Math.max(1, Math.ceil(leaderboardState.totalPlayers / leaderboardState.page.limit))
    : 1;
  const canGoPrev = currentPage > 0;
  const canGoNext = leaderboardState.page.hasMore;

  return {
    ...leaderboardState,
    currentPage,
    totalPages,
    canGoPrev,
    canGoNext,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refresh: () => loadLeaderboard(pageRequest),
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




