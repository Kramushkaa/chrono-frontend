import { Person } from 'shared/types';
import { QuizQuestion } from '../types';

// Вспомогательная функция для генерации вопроса о годе рождения
const generateBirthYearQuestion = (person: Person): QuizQuestion => {
  const options = [
    person.birthYear,
    person.birthYear + Math.floor(Math.random() * 100) - 50,
    person.birthYear + Math.floor(Math.random() * 100) - 50,
    person.birthYear + Math.floor(Math.random() * 100) - 50
  ].sort(() => Math.random() - 0.5);

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
      options,
      correctAnswer: person.birthYear,
      questionText: `В каком году родился ${person.name}?`,
      answerLabel: `${person.birthYear}`
    }
  };
};

// Функция fallback - выбирает случайный тип SingleChoice вопроса
export const generateSimpleFallback = (
  persons: Person[],
  allCountries?: string[],
  allCategories?: string[]
): QuizQuestion => {
  const questionTypes = ['birthYear', 'deathYear', 'profession', 'country'];
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)] as 'birthYear' | 'deathYear' | 'profession' | 'country';
  
  const person = persons[Math.floor(Math.random() * persons.length)];
  
  switch (randomType) {
    case 'birthYear':
      return generateBirthYearQuestion(person);
    
    case 'deathYear':
      // Не генерируем вопрос о смерти, если нет года смерти
      // Вместо этого генерируем вопрос о годе рождения
      if (!person.deathYear) {
        return generateBirthYearQuestion(person);
      }
      
      // Если есть год смерти, генерируем вопрос о смерти
      const deathYearOptions = [
        person.deathYear,
        person.deathYear + Math.floor(Math.random() * 100) - 50,
        person.deathYear + Math.floor(Math.random() * 100) - 50,
        person.deathYear + Math.floor(Math.random() * 100) - 50
      ].sort(() => Math.random() - 0.5);

      return {
        id: `death-year-${person.id}`,
        type: 'deathYear',
        question: `В каком году умер ${person.name}?`,
        correctAnswer: person.deathYear.toString(),
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctDeathYear: person.deathYear,
          options: deathYearOptions,
          correctAnswer: person.deathYear,
          questionText: `В каком году умер ${person.name}?`,
          answerLabel: `${person.deathYear}`
        }
      };
    
    case 'profession':
      // Используем категории из API, если доступны, иначе извлекаем из persons
      const allCategoriesArray = allCategories && allCategories.length > 0
        ? allCategories
        : Array.from(new Set(persons.map(p => p.category)));
      
      // Если категорий недостаточно, генерируем вопрос о годе рождения
      if (allCategoriesArray.length < 4) {
        return generateBirthYearQuestion(person);
      }
      
      // Генерируем неправильные варианты из реальных категорий
      const professionOptions = [person.category];
      while (professionOptions.length < 4) {
        const randomCategory = allCategoriesArray[Math.floor(Math.random() * allCategoriesArray.length)];
        if (!professionOptions.includes(randomCategory)) {
          professionOptions.push(randomCategory);
        }
      }
      
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
          options: professionOptions.sort(() => Math.random() - 0.5),
          correctAnswer: person.category,
          questionText: `К какой категории относится ${person.name}?`,
          answerLabel: person.category
        }
      };
    
    case 'country':
      // Используем страны из API, если доступны, иначе извлекаем из persons
      let allCountriesArray: string[];
      if (allCountries && allCountries.length > 0) {
        allCountriesArray = allCountries;
      } else {
        const allCountriesSet = new Set<string>();
        persons.forEach(p => {
          if (Array.isArray(p.country)) {
            p.country.forEach(country => allCountriesSet.add(country));
          } else {
            allCountriesSet.add(p.country);
          }
        });
        allCountriesArray = Array.from(allCountriesSet);
      }
      
      // Если стран недостаточно, генерируем вопрос о годе рождения
      if (allCountriesArray.length < 4) {
        return generateBirthYearQuestion(person);
      }
      
      // Генерируем неправильные варианты из реальных стран
      const correctCountry = Array.isArray(person.country) ? person.country[0] : person.country;
      const countryOptions = [correctCountry];
      while (countryOptions.length < 4) {
        const randomCountry = allCountriesArray[Math.floor(Math.random() * allCountriesArray.length)];
        if (!countryOptions.includes(randomCountry)) {
          countryOptions.push(randomCountry);
        }
      }
      
      return {
        id: `country-${person.id}`,
        type: 'country',
        question: `В какой стране родился ${person.name}?`,
        correctAnswer: correctCountry,
        data: {
          person: {
            id: person.id,
            name: person.name,
            description: person.description,
            imageUrl: person.imageUrl
          },
          correctCountry: correctCountry,
          options: countryOptions.sort(() => Math.random() - 0.5),
          correctAnswer: correctCountry,
          questionText: `В какой стране родился ${person.name}?`,
          answerLabel: correctCountry
        }
      };
    
    default:
      // Fallback на birthYear
      return generateBirthYearQuestion(person);
  }
};

