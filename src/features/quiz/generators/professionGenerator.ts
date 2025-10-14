import { Person } from 'shared/types';
import { QuizQuestion, ProfessionQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateProfessionQuestion = (persons: Person[]): QuizQuestion => {
  const person = persons[Math.floor(Math.random() * persons.length)];
  const correctProfession = person.category;
  
  // Получаем все доступные категории
  const allCategoriesSet = new Set(persons.map(p => p.category));
  const allCategoriesArray = Array.from(allCategoriesSet);
  
  if (allCategoriesArray.length < 4) {
    // Если категорий недостаточно, генерируем вопрос другого типа
    return generateSimpleFallback(persons);
  }
  
  // Генерируем неправильные варианты
  const options = [correctProfession];
  while (options.length < 4) {
    const randomCategory = allCategoriesArray[Math.floor(Math.random() * allCategoriesArray.length)];
    if (!options.includes(randomCategory)) {
      options.push(randomCategory);
    }
  }
  
  // Перемешиваем варианты
  const shuffledOptions = options.sort(() => Math.random() - 0.5);
  
  const data: ProfessionQuestionData = {
    person: {
      id: person.id,
      name: person.name,
      description: person.description,
      imageUrl: person.imageUrl
    },
    correctProfession,
    options: shuffledOptions,
    correctAnswer: correctProfession,
    questionText: `К какой области деятельности относится ${person.name}?`,
    answerLabel: correctProfession
  };

  return {
    id: `profession-${person.id}`,
    type: 'profession',
    question: `К какой области деятельности относится ${person.name}?`,
    correctAnswer: correctProfession,
    data
  };
};

