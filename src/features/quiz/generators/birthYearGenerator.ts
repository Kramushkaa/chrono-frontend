import { Person } from 'shared/types';
import { QuizQuestion, BirthYearQuestionData } from '../types';

export const generateBirthYearQuestion = (persons: Person[]): QuizQuestion => {
  const person = persons[Math.floor(Math.random() * persons.length)];
  const birthYear = person.birthYear;
  const deathYear = person.deathYear;
  
  // Генерируем неправильные варианты
  const options = [birthYear];
  while (options.length < 4) {
    const randomYear = birthYear + Math.floor(Math.random() * 300) - 200;
    if (!options.includes(randomYear)) {
      options.push(randomYear);
    }
  }
  
  // Перемешиваем варианты
  const shuffledOptions = options.sort(() => Math.random() - 0.5);
  
  const data: BirthYearQuestionData = {
    person: {
      id: person.id,
      name: person.name,
      description: person.description,
      imageUrl: person.imageUrl
    },
    correctBirthYear: birthYear,
    correctDeathYear: deathYear,
    options: shuffledOptions,
    correctAnswer: birthYear,
    questionText: `В каком году родился ${person.name}?`,
    answerLabel: `${birthYear}`
  };

  return {
    id: `birth-year-${person.id}`,
    type: 'birthYear',
    question: `В каком году родился ${person.name}?`,
    correctAnswer: birthYear.toString(),
    data
  };
};

