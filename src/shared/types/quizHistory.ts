import type { QuizQuestionType } from 'shared/dto/quiz-types';

export interface QuizHistoryEntry {
  attemptId: number;
  sessionToken?: string | null;
  quizTitle: string;
  sharedQuizId?: number | null;
  shareCode?: string | null;
  isShared: boolean;
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  ratingPoints: number;
  createdAt: string;
  config?: unknown;
}

export interface QuizHistoryResponse {
  success: boolean;
  data: {
    attempts: QuizHistoryEntry[];
    total: number;
  };
}

export interface QuizAttemptDetailAnswer {
  questionId: string;
  question: string;
  questionType: QuizQuestionType;
  userAnswer: string | string[] | string[][];
  correctAnswer: string | string[] | string[][];
  isCorrect: boolean;
  timeSpent: number;
  explanation?: string;
  data?: unknown;
}

export interface QuizAttemptDetailResponse {
  success: boolean;
  data: {
    attempt: {
      attemptId: number;
      quizTitle: string;
      isShared: boolean;
      shareCode?: string | null;
      createdAt: string;
    };
    results: {
      correctAnswers: number;
      totalQuestions: number;
      totalTimeMs: number;
      ratingPoints: number;
    };
    detailedAnswers: QuizAttemptDetailAnswer[];
  };
}
