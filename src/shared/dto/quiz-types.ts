// Quiz-related types (matching backend)
// These types are duplicated from backend shared-dto to avoid cross-project imports

export type QuizQuestionType = 
  | 'birthYear' 
  | 'deathYear' 
  | 'profession' 
  | 'country' 
  | 'achievementsMatch' 
  | 'birthOrder' 
  | 'contemporaries' 
  | 'guessPerson';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[] | string[][];
  explanation?: string;
  data: unknown;
}

export interface QuizSetupConfig {
  selectedCountries: string[];
  selectedCategories: string[];
  questionTypes: string[];
  questionCount: number;
  timeRange: { start: number; end: number };
}

// API Request/Response Types
export interface SaveQuizAttemptRequest {
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  config: QuizSetupConfig;
  questionTypes: QuizQuestionType[];
  answers?: Array<{
    questionId: string;
    answer: any;
    isCorrect: boolean;
    timeSpent: number;
    questionType: QuizQuestionType;
  }>;
  questions?: QuizQuestion[];
}

export interface SaveQuizAttemptResponse {
  success: boolean;
  data: {
    attemptId: number;
    ratingPoints: number;
  };
}

export interface CreateSharedQuizRequest {
  title: string;
  description?: string;
  config: QuizSetupConfig;
  questions: QuizQuestion[];
  creatorAttempt?: {
    correctAnswers: number;
    totalQuestions: number;
    totalTimeMs: number;
    answers: Array<{ questionId: string; answer: any; isCorrect: boolean; timeSpent: number }>;
  };
}

export interface CreateSharedQuizResponse {
  success: boolean;
  data: {
    id: number;
    shareCode: string;
    shareUrl: string;
  };
}

export interface SharedQuizDTO {
  id: number;
  title: string;
  description?: string;
  creatorUsername: string;
  config: QuizSetupConfig;
  questions: QuizQuestionWithoutAnswer[];
  createdAt: string;
}

export interface QuizQuestionWithoutAnswer {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  explanation?: string;
  data: unknown;
}

export interface StartSharedQuizRequest {
  shareCode: string;
}

export interface StartSharedQuizResponse {
  success: boolean;
  data: {
    sessionToken: string;
    expiresAt: string;
  };
}

export interface CheckAnswerRequest {
  sessionToken: string;
  questionId: string;
  answer: string | string[] | string[][];
  timeSpent: number;
}

export interface CheckAnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
  };
}

export interface FinishSharedQuizRequest {
  sessionToken: string;
}

export interface FinishSharedQuizResponse {
  success: boolean;
  data: {
    attemptId: number;
    correctAnswers: number;
    totalQuestions: number;
    totalTimeMs: number;
    detailedResults: DetailedQuestionResult[];
    leaderboardPosition?: number;
  };
}

export interface DetailedQuestionResult {
  questionId: string;
  question: string;
  isCorrect: boolean;
  userAnswer: string | string[] | string[][];
  correctAnswer: string | string[] | string[][];
  explanation?: string;
  timeSpent: number;
}

// Leaderboard Types
export interface GlobalLeaderboardEntry {
  rank: number;
  userId?: number;
  username: string;
  totalRating: number;
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
}

export interface GlobalLeaderboardResponse {
  success: boolean;
  data: {
    topPlayers: GlobalLeaderboardEntry[];
    userEntry?: GlobalLeaderboardEntry & { isCurrentUser: true };
    totalPlayers: number;
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    totalGames: number;
    totalRating: number;
    averageRating: number;
    bestRating: number;
    averageScore: number;
    rank?: number;
    recentAttempts: QuizAttemptDTO[];
  };
}

export interface QuizAttemptDTO {
  id: number;
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  ratingPoints: number;
  config?: QuizSetupConfig;
  sharedQuizTitle?: string;
  createdAt: string;
}

export interface SharedQuizLeaderboardEntry {
  rank: number;
  userId?: number;
  username: string;
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  completedAt: string;
}

export interface SharedQuizLeaderboardResponse {
  success: boolean;
  data: {
    quizTitle: string;
    entries: SharedQuizLeaderboardEntry[];
    userEntry?: SharedQuizLeaderboardEntry & { isCurrentUser: true };
    totalAttempts: number;
  };
}

// Quiz History (all types)
export interface QuizHistoryEntry {
  attemptId: number;
  sessionToken?: string;
  quizTitle: string;
  sharedQuizId?: number;
  shareCode?: string;
  isShared: boolean;
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  ratingPoints: number;
  createdAt: string;
  config?: QuizSetupConfig;
}

export interface QuizHistoryResponse {
  success: boolean;
  data: {
    attempts: QuizHistoryEntry[];
    total: number;
  };
}

export interface QuizAttemptDetailResponse {
  success: boolean;
  data: {
    attempt: {
      attemptId: number;
      quizTitle: string;
      isShared: boolean;
      shareCode?: string;
      createdAt: string;
    };
    results: {
      correctAnswers: number;
      totalQuestions: number;
      totalTimeMs: number;
      ratingPoints: number;
    };
    detailedAnswers: Array<{
      questionId: string;
      question: string;
      questionType: QuizQuestionType;
      userAnswer: string | string[] | string[][];
      correctAnswer: string | string[] | string[][];
      isCorrect: boolean;
      timeSpent: number;
      explanation?: string;
    }>;
  };
}

// Legacy: for shared quiz sessions
export interface QuizSessionDetailResponse {
  success: boolean;
  data: {
    session: {
      sessionToken: string;
      quizTitle: string;
      startedAt: string;
      finishedAt: string;
    };
    results: {
      correctAnswers: number;
      totalQuestions: number;
      totalTimeMs: number;
    };
    detailedAnswers: Array<{
      questionId: string;
      question: string;
      questionType: QuizQuestionType;
      userAnswer: string | string[] | string[][];
      correctAnswer: string | string[] | string[][];
      isCorrect: boolean;
      timeSpent: number;
      explanation?: string;
    }>;
  };
}




