import type { QuizAttemptDetailAnswer as LocalQuizAttemptDetailAnswer, QuizAttemptDetailResponse as LocalQuizAttemptDetailResponse, QuizHistoryEntry as LocalQuizHistoryEntry, QuizHistoryResponse as LocalQuizHistoryResponse } from './quizHistory';

declare module 'shared/dto/quiz-types' {
  export type QuizHistoryEntry = LocalQuizHistoryEntry;
  export type QuizHistoryResponse = LocalQuizHistoryResponse;
  export type QuizAttemptDetailAnswer = LocalQuizAttemptDetailAnswer;
  export type QuizAttemptDetailResponse = LocalQuizAttemptDetailResponse;
}

