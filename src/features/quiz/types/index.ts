export interface QuizSetupConfig {
  selectedCountries: string[];
  selectedCategories: string[];
  questionTypes: string[];
  questionCount: number;
  timeRange: { start: number; end: number };
}

export interface QuizQuestion {
  id: string;
  type: 'birthYear' | 'deathYear' | 'profession' | 'country' | 'achievementsMatch' | 'birthOrder' | 'contemporaries' | 'guessPerson';
  question: string;
  options?: string[];
  correctAnswer: string | string[] | string[][];
  explanation?: string;
  data: any; // Данные для конкретного типа вопроса
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[] | string[][];
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

// Универсальные данные для вопросов с выбором одного варианта
export interface SingleChoiceQuestionData {
  person: {
    id: string;
    name: string;
    description: string | null;
    imageUrl?: string | null;
  };
  correctAnswer: string | number;
  options: (string | number)[];
  questionText: string;
  answerLabel?: string; // для отображения правильного ответа в фидбеке
}

// Специфичные данные для вопросов о годе рождения (для обратной совместимости)
export interface BirthYearQuestionData extends SingleChoiceQuestionData {
  correctBirthYear: number;
  correctDeathYear: number | null;
  options: number[];
}

// Данные для вопросов о годе смерти
export interface DeathYearQuestionData extends SingleChoiceQuestionData {
  correctDeathYear: number;
  options: number[];
}

// Данные для вопросов о роде деятельности
export interface ProfessionQuestionData extends SingleChoiceQuestionData {
  correctProfession: string;
  options: string[];
}

// Данные для вопросов о стране рождения
export interface CountryQuestionData extends SingleChoiceQuestionData {
  correctCountry: string;
  options: string[];
}

export interface AchievementsMatchQuestionData {
  persons: Array<{
    id: string;
    name: string;
    imageUrl?: string | null;
  }>;
  achievements: string[];
  correctMatches: { [personId: string]: string };
}

export interface BirthOrderQuestionData {
  persons: Array<{
    id: string;
    name: string;
    birthYear: number;
    deathYear?: number | null;
    category: string;
    imageUrl?: string | null;
  }>;
  correctOrder: string[]; // массив ID в правильном порядке
}

export interface ContemporariesQuestionData {
  persons: Array<{
    id: string;
    name: string;
    birthYear: number;
    deathYear?: number | null;
    category: string;
    imageUrl?: string | null;
  }>;
  correctGroups: string[][]; // массив групп, каждая группа - массив ID современников
}

// Данные для вопросов "Угадай личность"
export interface GuessPersonQuestionData {
  correctPerson: {
    id: string;
    name: string;
    birthYear: number;
    deathYear?: number | null;
    category: string;
    country: string | string[];
    description: string | null;
    imageUrl?: string | null;
  };
  availablePersons: Array<{
    id: string;
    name: string;
  }>;
}
