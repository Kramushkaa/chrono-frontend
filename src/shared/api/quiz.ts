import { apiFetch } from './core';
import type {
  SaveQuizAttemptRequest,
  SaveQuizAttemptResponse,
  CreateSharedQuizRequest,
  CreateSharedQuizResponse,
  SharedQuizDTO,
  StartSharedQuizResponse,
  CheckAnswerRequest,
  CheckAnswerResponse,
  FinishSharedQuizRequest,
  FinishSharedQuizResponse,
  GlobalLeaderboardResponse,
  UserStatsResponse,
  SharedQuizLeaderboardResponse,
  QuizHistoryResponse,
  QuizAttemptDetailResponse,
  QuizSessionDetailResponse,
} from 'shared/dto/quiz-types';

// ============================================================================
// Regular Quiz API
// ============================================================================

/**
 * Save regular quiz attempt result
 */
export async function saveQuizAttempt(
  data: SaveQuizAttemptRequest
): Promise<SaveQuizAttemptResponse> {
  const response = await apiFetch('/api/quiz/save-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save quiz attempt');
  }

  return response.json();
}

// ============================================================================
// Shared Quiz API
// ============================================================================

/**
 * Create a shared quiz
 */
export async function createSharedQuiz(
  data: CreateSharedQuizRequest
): Promise<CreateSharedQuizResponse> {
  const response = await apiFetch('/api/quiz/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create shared quiz');
  }

  return response.json();
}

/**
 * Get shared quiz by share code (without correct answers)
 */
export async function getSharedQuiz(shareCode: string): Promise<SharedQuizDTO> {
  const response = await apiFetch(`/api/quiz/shared/${shareCode}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load shared quiz');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Start shared quiz session
 */
export async function startSharedQuiz(shareCode: string): Promise<StartSharedQuizResponse> {
  const response = await apiFetch(`/api/quiz/shared/${shareCode}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to start quiz session');
  }

  return response.json();
}

/**
 * Check answer for a shared quiz question
 */
export async function checkSharedQuizAnswer(
  shareCode: string,
  data: CheckAnswerRequest
): Promise<CheckAnswerResponse> {
  const response = await apiFetch(`/api/quiz/shared/${shareCode}/check-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to check answer');
  }

  return response.json();
}

/**
 * Finish shared quiz and get full results
 */
export async function finishSharedQuiz(
  shareCode: string,
  data: FinishSharedQuizRequest
): Promise<FinishSharedQuizResponse> {
  const response = await apiFetch(`/api/quiz/shared/${shareCode}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to finish quiz');
  }

  return response.json();
}

// ============================================================================
// Leaderboard API
// ============================================================================

export interface GetGlobalLeaderboardParams {
  limit?: number;
  offset?: number;
}

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(
  params: GetGlobalLeaderboardParams = {}
): Promise<GlobalLeaderboardResponse> {
  const searchParams = new URLSearchParams();
  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }
  if (typeof params.offset === 'number') {
    searchParams.set('offset', String(params.offset));
  }

  const query = searchParams.toString();
  const response = await apiFetch(
    query ? `/api/quiz/leaderboard?${query}` : '/api/quiz/leaderboard'
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load global leaderboard');
  }

  return response.json();
}

/**
 * Get current user stats
 */
export async function getUserStats(): Promise<UserStatsResponse> {
  const response = await apiFetch('/api/quiz/leaderboard/me');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load user stats');
  }

  return response.json();
}

/**
 * Get shared quiz leaderboard
 */
export async function getSharedQuizLeaderboard(
  shareCode: string
): Promise<SharedQuizLeaderboardResponse> {
  const response = await apiFetch(`/api/quiz/shared/${shareCode}/leaderboard`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load quiz leaderboard');
  }

  return response.json();
}

// ============================================================================
// Quiz History API
// ============================================================================

/**
 * Get user's quiz history (all types)
 */
export async function getQuizHistory(limit?: number): Promise<QuizHistoryResponse> {
  const url = limit ? `/api/quiz/history?limit=${limit}` : '/api/quiz/history';
  const response = await apiFetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load quiz history');
  }

  return response.json();
}

/**
 * Get detailed quiz attempt history
 */
export async function getQuizAttemptDetail(
  attemptId: number
): Promise<QuizAttemptDetailResponse> {
  const response = await apiFetch(`/api/quiz/history/attempt/${attemptId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load attempt details');
  }

  return response.json();
}

/**
 * Get detailed quiz session history (legacy, for shared quizzes)
 */
export async function getQuizSessionDetail(
  sessionToken: string
): Promise<QuizSessionDetailResponse> {
  const response = await apiFetch(`/api/quiz/history/${sessionToken}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load session details');
  }

  return response.json();
}




