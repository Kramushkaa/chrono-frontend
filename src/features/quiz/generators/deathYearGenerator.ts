import { Person } from 'shared/types';
import { QuizQuestion, DeathYearQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateDeathYearQuestion = (persons: Person[]): QuizQuestion => {
  const person = persons[Math.floor(Math.random() * persons.length)];
  const deathYear = person.deathYear;
  
  if (!deathYear) {
    // Если нет года смерти, генерируем вопрос о годе рождения
    return generateSimpleFallback(persons);
  }
  
  // Генерируем неправильные варианты
  const options = [deathYear];
  while (options.length < 4) {
    const randomYear = deathYear + Math.floor(Math.random() * 100) - 50;
    if (!options.includes(randomYear)) {
      options.push(randomYear);
    }
  }
  
  // Перемешиваем варианты
  const shuffledOptions = options.sort(() => Math.random() - 0.5);
  
  const data: DeathYearQuestionData = {
    person: {
      id: person.id,
      name: person.name,
      description: person.description,
      imageUrl: person.imageUrl
    },
    correctDeathYear: deathYear,
    options: shuffledOptions,
    correctAnswer: deathYear,
    questionText: `В каком году умер ${person.name}?`,
    answerLabel: `${deathYear}`
  };

  return {
    id: `death-year-${person.id}`,
    type: 'deathYear',
    question: `В каком году умер ${person.name}?`,
    correctAnswer: deathYear.toString(),
    data
  };
};

