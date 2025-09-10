import { useState, useCallback, useMemo, useEffect } from 'react';
import { Person } from 'shared/types';
import { QuizSetupConfig, QuizQuestion, QuizAnswer, QuizResult, BirthYearQuestionData, AchievementsMatchQuestionData, BirthOrderQuestionData } from '../types';

export const useQuiz = (persons: Person[], allCategories: string[], allCountries: string[]) => {
  const [setup, setSetup] = useState<QuizSetupConfig>(() => ({
    selectedCountries: allCategories.length > 0 ? allCountries : [],
    selectedCategories: allCategories.length > 0 ? allCategories : [],
    questionTypes: ['birthYear', 'achievementsMatch', 'birthOrder'],
    questionCount: 5
  }));
  
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
        questionTypes: prev.questionTypes.length === 0 ? ['birthYear', 'achievementsMatch', 'birthOrder'] : prev.questionTypes,
        questionCount: prev.questionCount || 5
      }));
    }
  }, [allCategories, allCountries]);

  // Фильтруем личности по выбранным странам и категориям
  const filteredPersons = useMemo(() => {
    return persons.filter(person => {
      const matchesCountry = setup.selectedCountries.length === 0 || 
        setup.selectedCountries.some((country: string) => person.country.includes(country));
      const matchesCategory = setup.selectedCategories.length === 0 || 
        setup.selectedCategories.includes(person.category);
      return matchesCountry && matchesCategory;
    });
  }, [persons, setup]);

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
      options: shuffledOptions
    };

    return {
      id: `birth-year-${person.id}`,
      type: 'birthYear',
      question: `В каком году родился ${person.name}?`,
      correctAnswer: birthYear.toString(),
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
      return generateBirthYearQuestion(persons);
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
  }, [generateBirthYearQuestion]);

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
      return generateBirthYearQuestion(persons);
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
  }, [generateBirthYearQuestion]);

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
      'achievementsMatch': generateAchievementsMatchQuestion,
      'birthOrder': generateBirthOrderQuestion
    };

    const availableTypes = setup.questionTypes.length > 0 ? setup.questionTypes : ['birthYear', 'achievementsMatch', 'birthOrder'];
    const questionCount = setup.questionCount || 5;
    
    const generatedQuestions: QuizQuestion[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      const questionType = availableTypes[i % availableTypes.length];
      const generator = questionGenerators[questionType];
      if (generator) {
        const question = generator(filteredPersons);
        generatedQuestions.push(question);
      }
    }

    return generatedQuestions;
  }, [filteredPersons, setup.questionTypes, setup.questionCount, generateBirthYearQuestion, generateAchievementsMatchQuestion, generateBirthOrderQuestion]);

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
  const answerQuestion = useCallback((answer: string | string[]) => {
    if (!isQuizActive || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Date.now() - questionStartTime;
    
    let isCorrect = false;
    
    if (currentQuestion.type === 'birthYear') {
      // Для вопросов о годе рождения сравниваем числа
      const userYear = parseInt(answer as string);
      const correctYear = parseInt(currentQuestion.correctAnswer as string);
      isCorrect = userYear === correctYear;
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
    allCountries
  };
};
