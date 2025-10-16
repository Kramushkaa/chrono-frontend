import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Person } from 'shared/types';
import { QuizSetupConfig, QuizQuestion, QuizAnswer, QuizResult } from '../types';
import {
  generateBirthYearQuestion,
  generateDeathYearQuestion,
  generateProfessionQuestion,
  generateCountryQuestion,
  generateAchievementsMatchQuestion,
  generateBirthOrderQuestion,
  generateContemporariesQuestion,
  generateGuessPersonQuestion
} from '../generators';
import { saveQuizAttempt } from '../../../shared/api';

export const useQuiz = (persons: Person[], allCategories: string[], allCountries: string[]) => {
  // Debounce для временного периода
  const timeRangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedTimeRange, setDebouncedTimeRange] = useState<{ start: number; end: number }>({ start: -800, end: 2000 });

  // Все генераторы теперь импортированы из ../generators
  // Локальные генераторы удалены для уменьшения размера этого файла

  const [setup, setSetup] = useState<QuizSetupConfig>(() => ({
    selectedCountries: allCategories.length > 0 ? allCountries : [],
    selectedCategories: allCategories.length > 0 ? allCategories : [],
    questionTypes: ['birthYear', 'deathYear', 'profession', 'country', 'achievementsMatch', 'birthOrder', 'contemporaries', 'guessPerson'],
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
  const [ratingPoints, setRatingPoints] = useState<number | undefined>(undefined);

  // Обновляем setup когда данные загружены
  useEffect(() => {
    if (allCategories.length > 0 && allCountries.length > 0) {
      setSetup(prev => ({
        selectedCountries: prev.selectedCountries.length === 0 ? allCountries : prev.selectedCountries,
        selectedCategories: prev.selectedCategories.length === 0 ? allCategories : prev.selectedCategories,
        questionTypes: prev.questionTypes.length === 0 ? ['birthYear', 'deathYear', 'profession', 'country', 'achievementsMatch', 'birthOrder', 'contemporaries', 'guessPerson'] : prev.questionTypes,
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

  // Генерируем вопросы на основе настроек
  const generateQuestions = useCallback(() => {
    if (filteredPersons.length === 0) return [];

    const questionGenerators: { [key: string]: (persons: Person[]) => QuizQuestion } = {
      'birthYear': generateBirthYearQuestion,
      'deathYear': generateDeathYearQuestion,
      'profession': generateProfessionQuestion,
      'country': generateCountryQuestion,
      'achievementsMatch': generateAchievementsMatchQuestion,
      'birthOrder': generateBirthOrderQuestion,
      'contemporaries': generateContemporariesQuestion,
      'guessPerson': generateGuessPersonQuestion
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
        case 'guessPerson':
          // Требуется как минимум 10 одобренных личностей
          return filteredPersons.filter(p => p.status === 'approved' || !p.status).length >= 10;
        default:
          return false;
      }
    };

    // Получаем предпочитаемые типы от пользователя
    const preferredTypes = setup.questionTypes.length > 0 ? setup.questionTypes : ['birthYear', 'deathYear', 'profession', 'country', 'achievementsMatch', 'birthOrder', 'contemporaries', 'guessPerson'];
    
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
  }, [filteredPersons, setup.questionTypes, setup.questionCount]);

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
    } else if (currentQuestion.type === 'profession' || currentQuestion.type === 'country' || currentQuestion.type === 'guessPerson') {
      // Для вопросов о профессии, стране и угадывании личности сравниваем строки
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

  // Сохранить результаты квиза на сервер
  const saveResults = useCallback(async () => {
    const result = getResults();
    const questionTypes = questions.map(q => q.type);

    try {
      const response = await saveQuizAttempt({
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        totalTimeMs: result.totalTime,
        config: setup,
        questionTypes,
      });

      if (response.success) {
        setRatingPoints(response.data.ratingPoints);
      }
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
      // Don't throw error - quiz results should still be shown
    }
  }, [getResults, questions, setup]);

  // Автоматически сохранить результаты когда квиз завершен
  useEffect(() => {
    if (!isQuizActive && answers.length === questions.length && questions.length > 0 && ratingPoints === undefined) {
      saveResults();
    }
  }, [isQuizActive, answers.length, questions.length, ratingPoints, saveResults]);

  // Сбросить игру
  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsQuizActive(false);
    setShowAnswer(false);
    setLastAnswer(null);
    setRatingPoints(undefined);
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
    checkStrictFilters,
    ratingPoints,
  };
};
