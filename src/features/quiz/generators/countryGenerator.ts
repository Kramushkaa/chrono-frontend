import { Person } from 'shared/types';
import { QuizQuestion, CountryQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateCountryQuestion = (persons: Person[]): QuizQuestion => {
  const person = persons[Math.floor(Math.random() * persons.length)];
  const correctCountry = Array.isArray(person.country) ? person.country[0] : person.country;
  
  // Получаем все доступные страны
  const allCountriesSet = new Set<string>();
  persons.forEach(p => {
    if (Array.isArray(p.country)) {
      p.country.forEach(country => allCountriesSet.add(country));
    } else {
      allCountriesSet.add(p.country);
    }
  });
  const allCountriesArray = Array.from(allCountriesSet);
  
  if (allCountriesArray.length < 4) {
    // Если стран недостаточно, генерируем вопрос другого типа
    return generateSimpleFallback(persons);
  }
  
  // Генерируем неправильные варианты
  const options = [correctCountry];
  while (options.length < 4) {
    const randomCountry = allCountriesArray[Math.floor(Math.random() * allCountriesArray.length)];
    if (!options.includes(randomCountry)) {
      options.push(randomCountry);
    }
  }
  
  // Перемешиваем варианты
  const shuffledOptions = options.sort(() => Math.random() - 0.5);
  
  const data: CountryQuestionData = {
    person: {
      id: person.id,
      name: person.name,
      description: person.description,
      imageUrl: person.imageUrl
    },
    correctCountry,
    options: shuffledOptions,
    correctAnswer: correctCountry,
    questionText: `В какой стране родился ${person.name}?`,
    answerLabel: correctCountry
  };

  return {
    id: `country-${person.id}`,
    type: 'country',
    question: `В какой стране родился ${person.name}?`,
    correctAnswer: correctCountry,
    data
  };
};




