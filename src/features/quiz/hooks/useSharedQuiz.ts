import { useState, useCallback } from 'react';
import {
  createSharedQuiz as createSharedQuizAPI,
  getSharedQuiz as getSharedQuizAPI,
  startSharedQuiz as startSharedQuizAPI,
  checkSharedQuizAnswer as checkSharedQuizAnswerAPI,
  finishSharedQuiz as finishSharedQuizAPI,
  getSharedQuizLeaderboard as getSharedQuizLeaderboardAPI,
} from '../../../shared/api';
import type {
  QuizQuestion,
  QuizSetupConfig,
  SharedQuizDTO,
  SharedQuizLeaderboardEntry,
  DetailedQuestionResult,
} from '../../../shared/dto/quiz-types';

interface SharedQuizState {
  quiz: SharedQuizDTO | null;
  sessionToken: string | null;
  loading: boolean;
  error: string | null;
}

interface LeaderboardState {
  quizTitle: string;
  entries: SharedQuizLeaderboardEntry[];
  userEntry?: SharedQuizLeaderboardEntry;
  totalAttempts: number;
  loading: boolean;
  error: string | null;
}

export const useSharedQuiz = () => {
  const [sharedQuizState, setSharedQuizState] = useState<SharedQuizState>({
    quiz: null,
    sessionToken: null,
    loading: false,
    error: null,
  });

  const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>({
    quizTitle: '',
    entries: [],
    userEntry: undefined,
    totalAttempts: 0,
    loading: false,
    error: null,
  });

  /**
   * Create a shared quiz
   */
  const createSharedQuiz = useCallback(
    async (
      title: string,
      description: string | undefined,
      config: QuizSetupConfig,
      questions: QuizQuestion[],
      creatorResults?: {
        correctAnswers: number;
        totalQuestions: number;
        totalTimeMs: number;
        answers: Array<{ questionId: string; answer: any; isCorrect: boolean; timeSpent: number }>;
      }
    ): Promise<{ shareCode: string; shareUrl: string } | null> => {
      try {
        setSharedQuizState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await createSharedQuizAPI({
          title,
          description,
          config,
          questions,
          creatorAttempt: creatorResults,
        });

        if (response.success) {
          setSharedQuizState((prev) => ({ ...prev, loading: false }));
          return {
            shareCode: response.data.shareCode,
            shareUrl: response.data.shareUrl,
          };
        }

        throw new Error('Failed to create shared quiz');
      } catch (error) {
        setSharedQuizState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to create shared quiz',
        }));
        return null;
      }
    },
    []
  );

  /**
   * Load shared quiz by share code
   */
  const loadSharedQuiz = useCallback(async (shareCode: string): Promise<boolean> => {
    try {
      setSharedQuizState((prev) => ({ ...prev, loading: true, error: null }));

      const quiz = await getSharedQuizAPI(shareCode);
      setSharedQuizState({
        quiz,
        sessionToken: null,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setSharedQuizState({
        quiz: null,
        sessionToken: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load quiz',
      });
      return false;
    }
  }, []);

  /**
   * Start quiz session
   */
  const startSession = useCallback(
    async (shareCode: string): Promise<boolean> => {
      try {
        const response = await startSharedQuizAPI(shareCode);

        if (response.success) {
          setSharedQuizState((prev) => ({
            ...prev,
            sessionToken: response.data.sessionToken,
          }));
          return true;
        }

        throw new Error('Failed to start session');
      } catch (error) {
        setSharedQuizState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to start session',
        }));
        return false;
      }
    },
    []
  );

  /**
   * Check answer for a question
   */
  const checkAnswer = useCallback(
    async (
      shareCode: string,
      questionId: string,
      answer: string | string[] | string[][],
      timeSpent: number
    ): Promise<{ isCorrect: boolean } | null> => {
      try {
        if (!sharedQuizState.sessionToken) {
          throw new Error('No active session');
        }

        const response = await checkSharedQuizAnswerAPI(shareCode, {
          sessionToken: sharedQuizState.sessionToken,
          questionId,
          answer,
          timeSpent,
        });

        if (response.success) {
          return response.data;
        }

        throw new Error('Failed to check answer');
      } catch (error) {
        setSharedQuizState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to check answer',
        }));
        return null;
      }
    },
    [sharedQuizState.sessionToken]
  );

  /**
   * Finish quiz and get results
   */
  const finishQuiz = useCallback(
    async (
      shareCode: string
    ): Promise<{
      correctAnswers: number;
      totalQuestions: number;
      totalTimeMs: number;
      detailedResults: DetailedQuestionResult[];
    } | null> => {
      try {
        if (!sharedQuizState.sessionToken) {
          throw new Error('No active session');
        }

        const response = await finishSharedQuizAPI(shareCode, {
          sessionToken: sharedQuizState.sessionToken,
        });

        if (response.success) {
          // Clear session after finishing
          setSharedQuizState((prev) => ({ ...prev, sessionToken: null }));
          return response.data;
        }

        throw new Error('Failed to finish quiz');
      } catch (error) {
        setSharedQuizState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to finish quiz',
        }));
        return null;
      }
    },
    [sharedQuizState.sessionToken]
  );

  /**
   * Load leaderboard for shared quiz
   */
  const loadLeaderboard = useCallback(async (shareCode: string): Promise<boolean> => {
    try {
      setLeaderboardState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await getSharedQuizLeaderboardAPI(shareCode);

      if (response.success) {
        setLeaderboardState({
          quizTitle: response.data.quizTitle,
          entries: response.data.entries,
          userEntry: response.data.userEntry,
          totalAttempts: response.data.totalAttempts,
          loading: false,
          error: null,
        });
        return true;
      }

      throw new Error('Failed to load leaderboard');
    } catch (error) {
      setLeaderboardState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
      }));
      return false;
    }
  }, []);

  return {
    // Shared quiz state
    quiz: sharedQuizState.quiz,
    sessionToken: sharedQuizState.sessionToken,
    loading: sharedQuizState.loading,
    error: sharedQuizState.error,

    // Leaderboard state
    leaderboard: leaderboardState,

    // Actions
    createSharedQuiz,
    loadSharedQuiz,
    startSession,
    checkAnswer,
    finishQuiz,
    loadLeaderboard,
  };
};

