import { Person } from 'shared/types';
import { QuizQuestion, BirthOrderQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateBirthOrderQuestion = (persons: Person[]): QuizQuestion => {
  // Группируем людей по годам рождения для быстрого поиска
  const personsByBirthYear = new Map<number, Person[]>();
  persons.forEach(person => {
    if (!personsByBirthYear.has(person.birthYear)) {
      personsByBirthYear.set(person.birthYear, []);
    }
    personsByBirthYear.get(person.birthYear)!.push(person);
  });

  // Получаем все уникальные годы рождения
  const uniqueBirthYears = Array.from(personsByBirthYear.keys()).sort(() => Math.random() - 0.5);
  
  // Выбираем 4 уникальных года рождения
  const selectedBirthYears = uniqueBirthYears.slice(0, 4);
  
  // Если уникальных годов меньше 4, берем столько, сколько есть
  if (selectedBirthYears.length < 2) {
    // Если уникальных годов меньше 2, генерируем вопрос другого типа
    return generateSimpleFallback(persons);
  }

  // Выбираем по одному человеку из каждого выбранного года
  const selectedPersons: Person[] = [];
  selectedBirthYears.forEach(year => {
    const personsInYear = personsByBirthYear.get(year)!;
    const randomPerson = personsInYear[Math.floor(Math.random() * personsInYear.length)];
    selectedPersons.push(randomPerson);
  });
  
  const correctOrder = selectedPersons
    .sort((a, b) => a.birthYear - b.birthYear)
    .map(p => p.id);

  const data: BirthOrderQuestionData = {
    persons: selectedPersons.map(p => ({
      id: p.id,
      name: p.name,
      birthYear: p.birthYear,
      deathYear: p.deathYear,
      category: p.category,
      imageUrl: p.imageUrl
    })),
    correctOrder
  };

  return {
    id: `birth-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'birthOrder',
    question: 'Расставьте личности по году рождения (от самого раннего к самому позднему):',
    correctAnswer: correctOrder,
    data
  };
};

