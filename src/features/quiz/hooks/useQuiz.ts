import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Person } from 'shared/types';
import { QuizSetupConfig, QuizQuestion, QuizAnswer, QuizResult, BirthYearQuestionData, DeathYearQuestionData, ProfessionQuestionData, CountryQuestionData, AchievementsMatchQuestionData, BirthOrderQuestionData, ContemporariesQuestionData } from '../types';

export const useQuiz = (persons: Person[], allCategories: string[], allCountries: string[]) => {
  // Debounce для временного периода
  const timeRangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedTimeRange, setDebouncedTimeRange] = useState<{ start: number; end: number }>({ start: -800, end: 2000 });

  // Функция fallback - выбирает случайный тип SingleChoice вопроса
  const generateSimpleFallback = (persons: Person[]): QuizQuestion => {
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
            options: [person.deathYear, person.deathYear + Math.floor(Math.random() * 100) - 50, person.deathYear + Math.floor(Math.random() * 100) - 50, person.deathYear + Math.floor(Math.random() * 100) - 50].sort(() => Math.random() - 0.5),
            correctAnswer: person.deathYear,
            questionText: `В каком году умер ${person.name}?`,
            answerLabel: `${person.deathYear}`
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
  const [setup, setSetup] = useState<QuizSetupConfig>(() => ({
    selectedCountries: allCategories.length > 0 ? allCountries : [],
    selectedCategories: allCategories.length > 0 ? allCategories : [],
    questionTypes: ['birthYear', 'deathYear', 'profession', 'country', 'achievementsMatch', 'birthOrder', 'contemporaries'],
    questionCount: 5,
    timeRange: { start: -800, end: 2000 }
  }));

  // Debounce эффект для временного периода
  useEffect(() => {
    if (timeRangeTimeoutRef.current) {
      clearTimeout(timeRangeTimeoutRef.current);
    }
    
    timeRangeTimeoutRef.current = setTimeout(() => {
      setDebouncedTimeRange(setup.timeRange);
    }, 500); // 500ms задержка

    return () => {
      if (timeRangeTimeoutRef.current) {
        clearTimeout(timeRangeTimeoutRef.current);
      }
    };
  }, [setup.timeRange]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<QuizAnswer | null>(null);

  // Обновляем setup когда данные загружены
  useEffect(() => {
    if (allCategories.length > 0 && allCountries.length > 0) {
      setSetup(prev => ({
        selectedCountries: prev.selectedCountries.length === 0 ? allCountries : prev.selectedCountries,
        selectedCategories: prev.selectedCategories.length === 0 ? allCategories : prev.selectedCategories,
        questionTypes: prev.questionTypes.length === 0 ? ['birthYear', 'deathYear', 'profession', 'country', 'achievementsMatch', 'birthOrder', 'contemporaries'] : prev.questionTypes,
        questionCount: prev.questionCount || 5,
        timeRange: prev.timeRange || { start: -800, end: 2000 }
      }));
    }
  }, [allCategories, allCountries]);

  // Фильтруем личности по выбранным странам, категориям и временному периоду
  const filteredPersons = useMemo(() => {
    return persons.filter(person => {
      const matchesCountry = setup.selectedCountries.length === 0 || 
        setup.selectedCountries.some((country: string) => person.country.includes(country));
      const matchesCategory = setup.selectedCategories.length === 0 || 
        setup.selectedCategories.includes(person.category);
      
      // Проверяем временной период (используем debounced значение)
      const deathYear = person.deathYear || new Date().getFullYear();
      const matchesTimeRange = deathYear >= debouncedTimeRange.start && person.birthYear <= debouncedTimeRange.end;
      
      return matchesCountry && matchesCategory && matchesTimeRange;
    });
  }, [persons, setup.selectedCountries, setup.selectedCategories, debouncedTimeRange]);

  // Генерируем вопрос "Угадай годы жизни"
  const generateBirthYearQuestion = useCallback((persons: Person[]): QuizQuestion => {
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
  }, []);

  // Генерируем вопрос "Угадай год смерти"
  const generateDeathYearQuestion = useCallback((persons: Person[]): QuizQuestion => {
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
  }, []);

  // Генерируем вопрос "Угадай род деятельности"
  const generateProfessionQuestion = useCallback((persons: Person[]): QuizQuestion => {
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
  }, []);

  // Генерируем вопрос "Угадай страну рождения"
  const generateCountryQuestion = useCallback((persons: Person[]): QuizQuestion => {
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
  }, []);

  // Генерируем вопрос "Сопоставь достижения"
  const generateAchievementsMatchQuestion = useCallback((persons: Person[]): QuizQuestion => {
    const selectedPersons = persons
      .filter(p => p.achievements && p.achievements.length > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    if (selectedPersons.length === 0) {
      // Если нет достижений, генерируем вопрос другого типа
      return generateSimpleFallback(persons);
    }

    // Создаем строгое соответствие 1:1
    const correctMatches: { [personId: string]: string } = {};
    const selectedAchievements: string[] = [];
    
    selectedPersons.forEach(person => {
      // Выбираем случайное достижение для каждой личности
      const randomAchievement = person.achievements[Math.floor(Math.random() * person.achievements.length)];
      correctMatches[person.id] = randomAchievement;
      selectedAchievements.push(randomAchievement);
    });

    // Перемешиваем достижения для отображения
    const shuffledAchievements = selectedAchievements.sort(() => Math.random() - 0.5);

    const data: AchievementsMatchQuestionData = {
      persons: selectedPersons.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl
      })),
      achievements: shuffledAchievements,
      correctMatches
    };

    // Правильный ответ должен быть в том же порядке, что и личности
    const correctAnswer = selectedPersons.map(person => correctMatches[person.id]);

    return {
      id: `achievements-match-${Date.now()}`,
      type: 'achievementsMatch',
      question: 'Сопоставьте достижения с личностями:',
      correctAnswer,
      data
    };
  }, []);

  // Генерируем вопрос "Расставь по году рождения"
  const generateBirthOrderQuestion = useCallback((persons: Person[]): QuizQuestion => {
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
      id: `birth-order-${Date.now()}`,
      type: 'birthOrder',
      question: 'Расставьте личности по году рождения (от самого раннего к самому позднему):',
      correctAnswer: correctOrder,
      data
    };
  }, []);

  // Генерируем вопрос "Разделите на группы современников"
  const generateContemporariesQuestion = useCallback((persons: Person[]): QuizQuestion => {
    if (persons.length < 4) {
      return generateSimpleFallback(persons);
    }

    // Функция для проверки, были ли личности современниками
    const areContemporaries = (person1: Person, person2: Person): boolean => {
      const death1 = person1.deathYear || new Date().getFullYear();
      const death2 = person2.deathYear || new Date().getFullYear();
      return person1.birthYear <= death2 && person2.birthYear <= death1;
    };

    // Новый алгоритм на основе теории графов
    const createQuestionClusters = (persons: Person[]): { selectedPersons: Person[], correctGroups: string[][] } => {
      // Шаг 1: Построение графа пересечений
      const buildIntersectionGraph = (persons: Person[]): Map<string, Set<string>> => {
        const graph = new Map<string, Set<string>>();
        
        // Инициализируем граф
        persons.forEach(person => {
          graph.set(person.id, new Set<string>());
        });
        
        // Добавляем рёбра между современниками
        for (let i = 0; i < persons.length; i++) {
          for (let j = i + 1; j < persons.length; j++) {
            const person1 = persons[i];
            const person2 = persons[j];
            
            if (areContemporaries(person1, person2)) {
              graph.get(person1.id)!.add(person2.id);
              graph.get(person2.id)!.add(person1.id);
            }
          }
        }
        
        return graph;
      };

      // Шаг 2: Поиск клик размером 1-3 (оптимизированный алгоритм)
      const findAllCliques = (graph: Map<string, Set<string>>, persons: Person[]): Person[][] => {
        const cliques: Person[][] = [];
        const personMap = new Map(persons.map(p => [p.id, p]));
        const personIds = persons.map(p => p.id);
        
        // Одиночные личности (клики размером 1)
        for (const personId of personIds) {
          cliques.push([personMap.get(personId)!]);
        }
        
        // Пары современников (клики размером 2)
        for (let i = 0; i < personIds.length; i++) {
          for (let j = i + 1; j < personIds.length; j++) {
            const person1Id = personIds[i];
            const person2Id = personIds[j];
            
            if (graph.get(person1Id)?.has(person2Id)) {
              cliques.push([
                personMap.get(person1Id)!,
                personMap.get(person2Id)!
              ]);
            }
          }
        }
        
        // Тройки современников (клики размером 3)
        for (let i = 0; i < personIds.length; i++) {
          for (let j = i + 1; j < personIds.length; j++) {
            for (let k = j + 1; k < personIds.length; k++) {
              const person1Id = personIds[i];
              const person2Id = personIds[j];
              const person3Id = personIds[k];
              
              // Проверяем, что все трое являются современниками
              if (graph.get(person1Id)?.has(person2Id) &&
                  graph.get(person1Id)?.has(person3Id) &&
                  graph.get(person2Id)?.has(person3Id)) {
                cliques.push([
                  personMap.get(person1Id)!,
                  personMap.get(person2Id)!,
                  personMap.get(person3Id)!
                ]);
              }
            }
          }
        }
        
        return cliques;
      };

      // Шаг 3: Поиск непересекающихся клик с перебором всех комбинаций
      const findBestCliqueCombination = (cliques: Person[][]): Person[][] => {
        // Сортируем клики по размеру (большие сначала), затем случайно
        const sortedCliques = [...cliques].sort((a, b) => {
          if (b.length !== a.length) {
            return b.length - a.length; // Большие клики приоритетнее
          }
          return Math.random() - 0.5; // Случайный порядок для клик одинакового размера
        });
        
        // Функция для проверки, что клика не пересекается с уже выбранными
        const isCliqueCompatible = (clique: Person[], selectedCliques: Person[][]): boolean => {
          // 1. Проверяем, что личности из клики не использованы
        const usedPersons = new Set<string>();
          selectedCliques.forEach(selectedClique => {
            selectedClique.forEach(person => usedPersons.add(person.id));
          });
          
          const hasPersonOverlap = clique.some(person => usedPersons.has(person.id));
          
          // 2. Проверяем, что личности из клики не являются современниками 
          // с личностями из уже выбранных клик
          const hasTimeOverlap = clique.some(person1 => 
            selectedCliques.some(selectedClique => 
              selectedClique.some(person2 => areContemporaries(person1, person2))
            )
          );
          
          return !hasPersonOverlap && !hasTimeOverlap;
        };
        
        // Перебираем все возможные комбинации клик
        let bestCombination: Person[][] = [];
        let maxTotalPersons = 0;
        
        // Пробуем каждую клику как начальную
        for (let startIndex = 0; startIndex < Math.min(sortedCliques.length, 20); startIndex++) {
          const startClique = sortedCliques[startIndex];
          const currentCombination: Person[][] = [startClique];
          
          // Ищем совместимые клики для этой комбинации
          for (const candidateClique of sortedCliques) {
            if (candidateClique === startClique) continue;
            
            if (isCliqueCompatible(candidateClique, currentCombination)) {
              currentCombination.push(candidateClique);
              
              // Ограничиваем количество групп для квиза
              if (currentCombination.length >= 3) break;
            }
          }
          
          // Проверяем, лучше ли эта комбинация
          const totalPersons = currentCombination.reduce((sum, clique) => sum + clique.length, 0);
          if (totalPersons > maxTotalPersons) {
            maxTotalPersons = totalPersons;
            bestCombination = [...currentCombination];
          }
          
          // Если нашли идеальную комбинацию (4+ личности), можно остановиться
          if (totalPersons >= 4) break;
        }
        
        return bestCombination;
      };

      // Шаг 4: Добавление одиночных личностей, если нужно
      const addAdditionalPersons = (
        selectedCliques: Person[][], 
        allPersons: Person[], 
        targetCount: number = 4
      ): Person[][] => {
        const usedPersons = new Set<string>();
        selectedCliques.forEach(clique => {
          clique.forEach(person => usedPersons.add(person.id));
        });
        
        const availablePersons = allPersons.filter(p => !usedPersons.has(p.id));
        const currentCount = selectedCliques.reduce((sum, clique) => sum + clique.length, 0);
        
        if (currentCount < targetCount && availablePersons.length > 0) {
          const needed = targetCount - currentCount;
          
          // Фильтруем личности, которые не пересекаются с существующими группами
          const nonOverlappingPersons = availablePersons.filter(person => {
            return selectedCliques.every(clique => 
              !clique.some(cliqueMember => areContemporaries(person, cliqueMember))
          );
        });
        
        const additionalPersons = nonOverlappingPersons
          .sort(() => Math.random() - 0.5)
          .slice(0, needed);
        
          // Добавляем одиночных личностей как отдельные группы
        additionalPersons.forEach(person => {
            selectedCliques.push([person]);
          });
        }
        
        return selectedCliques;
      };

      // Выполняем алгоритм
      const graph = buildIntersectionGraph(persons);
      const allCliques = findAllCliques(graph, persons);
      
      let selectedCliques = findBestCliqueCombination(allCliques);
      selectedCliques = addAdditionalPersons(selectedCliques, persons);
      
      // Подготавливаем результат
      const selectedPersons: Person[] = [];
      const correctGroups: string[][] = [];
      
      selectedCliques.forEach(clique => {
        selectedPersons.push(...clique);
        correctGroups.push(clique.map(p => p.id));
      });
      
      return { selectedPersons, correctGroups };
    };

    const result = createQuestionClusters(persons);
    
    // Требуем минимум 4 личности
    if (result.selectedPersons.length < 4) {
      return generateSimpleFallback(persons);
    }

    const data: ContemporariesQuestionData = {
      persons: result.selectedPersons.map(p => ({
        id: p.id,
        name: p.name,
        birthYear: p.birthYear,
        deathYear: p.deathYear,
        category: p.category,
        imageUrl: p.imageUrl
      })),
      correctGroups: result.correctGroups
    };

    return {
      id: `contemporaries-${result.selectedPersons.map(p => p.id).join('-')}`,
      type: 'contemporaries',
      question: 'Разделите на группы современников',
      correctAnswer: result.correctGroups,
      data
    };
  }, []);


  // Генерируем вопросы на основе настроек
  // Вспомогательная функция для прокрутки к началу контента
  const scrollToContentStart = useCallback(() => {
    // На мобильных устройствах используем более надежный метод
    const quizContent = document.querySelector('.quiz-content');
    if (quizContent) {
      quizContent.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    } else {
      // Fallback для десктопа
      const header = document.querySelector('.app-header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      window.scrollTo(0, headerHeight);
    }
  }, []);

  const generateQuestions = useCallback(() => {
    if (filteredPersons.length === 0) return [];

    const questionGenerators: { [key: string]: (persons: Person[]) => QuizQuestion } = {
      'birthYear': generateBirthYearQuestion,
      'deathYear': generateDeathYearQuestion,
      'profession': generateProfessionQuestion,
      'country': generateCountryQuestion,
      'achievementsMatch': generateAchievementsMatchQuestion,
      'birthOrder': generateBirthOrderQuestion,
      'contemporaries': generateContemporariesQuestion
    };

    // Проверяем, какие типы вопросов доступны с текущими данными
    const checkQuestionAvailability = (type: string): boolean => {
      switch (type) {
        case 'birthYear':
        case 'deathYear':
        case 'profession':
        case 'country':
          return filteredPersons.length >= 1;
        case 'achievementsMatch':
          return filteredPersons.length >= 3 && filteredPersons.some(p => p.achievements && p.achievements.length > 0);
        case 'birthOrder':
          return filteredPersons.length >= 4;
        case 'contemporaries':
          if (filteredPersons.length < 4) {
            return false;
          }
          // Дополнительная проверка: есть ли современники
          const hasContemporaries = filteredPersons.some(person1 => 
            filteredPersons.some(person2 => 
              person1.id !== person2.id && 
              person1.birthYear <= (person2.deathYear || new Date().getFullYear()) && 
              person2.birthYear <= (person1.deathYear || new Date().getFullYear())
            )
          );
          return filteredPersons.length >= 4 && hasContemporaries;
        default:
          return false;
      }
    };

    // Получаем предпочитаемые типы от пользователя
    const preferredTypes = setup.questionTypes.length > 0 ? setup.questionTypes : ['birthYear', 'deathYear', 'profession', 'country', 'achievementsMatch', 'birthOrder', 'contemporaries'];
    
    // Фильтруем доступные типы
    const availablePreferredTypes = preferredTypes.filter(checkQuestionAvailability);

    
    // Если нет доступных предпочитаемых типов, используем базовые
    const fallbackTypes = ['birthYear', 'deathYear', 'profession', 'country'].filter(checkQuestionAvailability);
    const finalAvailableTypes = availablePreferredTypes.length > 0 ? availablePreferredTypes : fallbackTypes;

    if (finalAvailableTypes.length === 0) return [];

    const questionCount = setup.questionCount || 5;
    const generatedQuestions: QuizQuestion[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      const questionType = finalAvailableTypes[i % finalAvailableTypes.length];
      const generator = questionGenerators[questionType];
      if (generator) {
        const question = generator(filteredPersons);
        generatedQuestions.push(question);
      }
    }

    return generatedQuestions;
  }, [filteredPersons, setup.questionTypes, setup.questionCount, generateBirthYearQuestion, generateDeathYearQuestion, generateProfessionQuestion, generateCountryQuestion, generateAchievementsMatchQuestion, generateBirthOrderQuestion, generateContemporariesQuestion]);

  // Начать игру
  const startQuiz = useCallback(() => {
    const newQuestions = generateQuestions();
    if (newQuestions.length === 0) return false;
    
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsQuizActive(true);
    setQuestionStartTime(Date.now());
    // Прокрутить к началу страницы при старте квиза
    // Небольшая задержка для корректного рендеринга на мобильных
    setTimeout(() => {
      scrollToContentStart();
    }, 100);
    return true;
  }, [generateQuestions, scrollToContentStart]);

  // Ответить на вопрос
  const answerQuestion = useCallback((answer: string | string[] | string[][]) => {
    if (!isQuizActive || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Date.now() - questionStartTime;
    
    let isCorrect = false;
    
    if (currentQuestion.type === 'birthYear' || currentQuestion.type === 'deathYear') {
      // Для вопросов о годах сравниваем числа
      const userYear = parseInt(answer as string);
      const correctYear = parseInt(currentQuestion.correctAnswer as string);
      isCorrect = userYear === correctYear;
    } else if (currentQuestion.type === 'profession' || currentQuestion.type === 'country') {
      // Для вопросов о профессии и стране сравниваем строки
      isCorrect = answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'birthOrder') {
      // Для вопросов о порядке рождения сравниваем массивы без сортировки
      isCorrect = JSON.stringify(answer) === JSON.stringify(currentQuestion.correctAnswer);
    } else if (currentQuestion.type === 'achievementsMatch') {
      // Для сопоставления достижений сравниваем правильные сопоставления
      const userAnswerArray = answer as string[];
      const correctAnswerArray = currentQuestion.correctAnswer as string[];
      
      // Проверяем, что все элементы совпадают в правильном порядке
      isCorrect = userAnswerArray.length === correctAnswerArray.length &&
        userAnswerArray.every((achievement, index) => achievement === correctAnswerArray[index]);
        
    } else if (currentQuestion.type === 'contemporaries') {
      // Для вопросов о современниках сравниваем группы
      const userGroups = answer as string[][];
      const correctGroups = currentQuestion.correctAnswer as string[][];
      
      // Нормализуем группы: сортируем ID внутри групп и сами группы
      const normalizeGroups = (groups: string[][]) => 
        groups.map(group => group.sort()).sort((a, b) => a[0].localeCompare(b[0]));
      
      isCorrect = JSON.stringify(normalizeGroups(userGroups)) === 
                  JSON.stringify(normalizeGroups(correctGroups));
      
    } else if (Array.isArray(answer)) {
      // Для других массивов сравниваем отсортированные массивы
      isCorrect = JSON.stringify(answer.sort()) === JSON.stringify((currentQuestion.correctAnswer as string[]).sort());
    } else {
      // Для строк
      isCorrect = answer === currentQuestion.correctAnswer;
    }

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
      timeSpent
    };

    setAnswers(prev => [...prev, newAnswer]);
    setLastAnswer(newAnswer);
    setShowAnswer(true);
  }, [isQuizActive, currentQuestionIndex, questions, questionStartTime]);

  // Перейти к следующему вопросу
  const nextQuestion = useCallback(() => {
    setShowAnswer(false);
    setLastAnswer(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      // Прокрутить к началу страницы при переходе к новому вопросу
      // Небольшая задержка для корректного рендеринга на мобильных
      setTimeout(() => {
        scrollToContentStart();
      }, 100);
    } else {
      // Игра окончена
      setIsQuizActive(false);
    }
  }, [currentQuestionIndex, questions.length, scrollToContentStart]);

  // Получить результаты
  const getResults = useCallback((): QuizResult => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const score = Math.round((correctAnswers / questions.length) * 100);

    return {
      totalQuestions: questions.length,
      correctAnswers,
      totalTime,
      score,
      answers
    };
  }, [answers, questions.length]);

  // Сбросить игру
  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsQuizActive(false);
    setShowAnswer(false);
    setLastAnswer(null);
    // Прокрутить к началу страницы при сбросе квиза
    scrollToContentStart();
  }, [scrollToContentStart]);

  // Функция для проверки строгости фильтров
  const checkStrictFilters = useCallback((setup: QuizSetupConfig, allCategories: string[], allCountries: string[]) => {
    const warnings: string[] = [];
    
    // Проверяем фильтр по странам
    if (setup.selectedCountries.length > 0 && setup.selectedCountries.length < allCountries.length) {
      warnings.push(`Выбрано ${setup.selectedCountries.length} из ${allCountries.length} стран`);
    }
    
    // Проверяем фильтр по категориям
    if (setup.selectedCategories.length > 0 && setup.selectedCategories.length < allCategories.length) {
      warnings.push(`Выбрано ${setup.selectedCategories.length} из ${allCategories.length} категорий`);
    }
    
    // Проверяем временной период
    const timeRange = setup.timeRange.end - setup.timeRange.start;
    if (timeRange < 1000) {
      warnings.push(`Временной период составляет ${timeRange} лет`);
    }
    
    return warnings;
  }, []);

  return {
    setup,
    setSetup,
    questions,
    currentQuestionIndex,
    answers,
    isQuizActive,
    filteredPersons,
    startQuiz,
    answerQuestion,
    nextQuestion,
    getResults,
    resetQuiz,
    showAnswer,
    lastAnswer,
    allCategories,
    allCountries,
    checkStrictFilters
  };
};
