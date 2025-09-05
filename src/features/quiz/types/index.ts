export interface QuizSetupConfig {
  selectedCountries: string[];
  selectedCategories: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'birthYear' | 'achievementsMatch' | 'birthOrder';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  data: any; // Данные для конкретного типа вопроса
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // в миллисекундах
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  score: number;
  answers: QuizAnswer[];
}

export interface BirthYearQuestionData {
  person: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  };
  correctBirthYear: number;
  correctDeathYear: number;
  options: number[];
}

export interface AchievementsMatchQuestionData {
  persons: Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>;
  achievements: string[];
  correctMatches: { [personId: string]: string };
}

export interface BirthOrderQuestionData {
  persons: Array<{
    id: string;
    name: string;
    birthYear: number;
    deathYear?: number;
    category: string;
    imageUrl?: string;
  }>;
  correctOrder: string[]; // массив ID в правильном порядке
}
