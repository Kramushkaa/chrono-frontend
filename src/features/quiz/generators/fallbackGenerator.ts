import { Person } from 'shared/types';
import { QuizQuestion } from '../types';

// Функция fallback - выбирает случайный тип SingleChoice вопроса
export const generateSimpleFallback = (persons: Person[]): QuizQuestion => {
  const questionTypes = ['birthYear', 'deathYear', 'profession', 'country'];
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)] as 'birthYear' | 'deathYear' | 'profession' | 'country';
  
  const person = persons[Math.floor(Math.random() * persons.length)];
  
  switch (randomType) {
    case 'birthYear':
      return {
        id: `birth-year-${person.id}`,
        type: 'birthYear',
        question: `В каком году родился ${person.name}?`,
        correctAnswer: person.birthYear.toString(),
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctBirthYear: person.birthYear,
          options: [person.birthYear, person.birthYear + Math.floor(Math.random() * 100) - 50, person.birthYear + Math.floor(Math.random() * 100) - 50, person.birthYear + Math.floor(Math.random() * 100) - 50].sort(() => Math.random() - 0.5),
          correctAnswer: person.birthYear,
          questionText: `В каком году родился ${person.name}?`,
          answerLabel: `${person.birthYear}`
        }
      };
    
    case 'deathYear':
      const deathYearValue = person.deathYear ?? new Date().getFullYear();
      return {
        id: `death-year-${person.id}`,
        type: 'deathYear',
        question: `В каком году умер ${person.name}?`,
        correctAnswer: deathYearValue.toString(),
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctDeathYear: deathYearValue,
          options: [deathYearValue, deathYearValue + Math.floor(Math.random() * 100) - 50, deathYearValue + Math.floor(Math.random() * 100) - 50, deathYearValue + Math.floor(Math.random() * 100) - 50].sort(() => Math.random() - 0.5),
          correctAnswer: deathYearValue,
          questionText: `В каком году умер ${person.name}?`,
          answerLabel: `${deathYearValue}`
        }
      };
    
    case 'profession':
      return {
        id: `profession-${person.id}`,
        type: 'profession',
        question: `К какой категории относится ${person.name}?`,
        correctAnswer: person.category,
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctProfession: person.category,
          options: [person.category, 'Писатель', 'Художник', 'Политик'].sort(() => Math.random() - 0.5),
          correctAnswer: person.category,
          questionText: `К какой категории относится ${person.name}?`,
          answerLabel: person.category
        }
      };
    
    case 'country':
      return {
        id: `country-${person.id}`,
        type: 'country',
        question: `В какой стране родился ${person.name}?`,
        correctAnswer: person.country,
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctCountry: person.country,
          options: [person.country, 'Франция', 'Германия', 'Италия'].sort(() => Math.random() - 0.5),
          correctAnswer: person.country,
          questionText: `В какой стране родился ${person.name}?`,
          answerLabel: person.country
        }
      };
    
    default:
      // Fallback на birthYear
      return {
        id: `birth-year-${person.id}`,
        type: 'birthYear',
        question: `В каком году родился ${person.name}?`,
        correctAnswer: person.birthYear.toString(),
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctBirthYear: person.birthYear,
          options: [person.birthYear, person.birthYear + Math.floor(Math.random() * 100) - 50, person.birthYear + Math.floor(Math.random() * 100) - 50, person.birthYear + Math.floor(Math.random() * 100) - 50].sort(() => Math.random() - 0.5),
          correctAnswer: person.birthYear,
          questionText: `В каком году родился ${person.name}?`,
          answerLabel: `${person.birthYear}`
        }
      };
  }
};




