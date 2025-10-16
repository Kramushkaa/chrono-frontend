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
} from '../dto/quiz-types';

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

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(): Promise<GlobalLeaderboardResponse> {
  const response = await apiFetch('/api/quiz/leaderboard');

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

