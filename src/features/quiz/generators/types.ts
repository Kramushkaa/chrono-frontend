import { Person } from 'shared/types';
import { QuizQuestion } from '../types';

// Общий тип для всех генераторов вопросов
export type QuestionGenerator = (persons: Person[]) => QuizQuestion;

