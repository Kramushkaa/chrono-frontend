import { Person } from 'shared/types';
import { QuizQuestion, GuessPersonQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateGuessPersonQuestion = (persons: Person[]): QuizQuestion => {
  // Фильтруем только одобренные личности (со статусом approved)
  const approvedPersons = persons.filter(p => p.status === 'approved' || !p.status);
  
  if (approvedPersons.length < 10) {
    // Если одобренных личностей слишком мало, генерируем fallback вопрос
    return generateSimpleFallback(persons);
  }

  // Выбираем случайную личность для вопроса
  const correctPerson = approvedPersons[Math.floor(Math.random() * approvedPersons.length)];
  
  const data: GuessPersonQuestionData = {
    correctPerson: {
      id: correctPerson.id,
      name: correctPerson.name,
      birthYear: correctPerson.birthYear,
      deathYear: correctPerson.deathYear,
      category: correctPerson.category,
      country: correctPerson.country,
      description: correctPerson.description,
      imageUrl: correctPerson.imageUrl
    },
    availablePersons: approvedPersons.map(p => ({
      id: p.id,
      name: p.name
    }))
  };

  return {
    id: `guess-person-${correctPerson.id}`,
    type: 'guessPerson',
    question: 'Угадайте, о ком идёт речь:',
    correctAnswer: correctPerson.id,
    data
  };
};




