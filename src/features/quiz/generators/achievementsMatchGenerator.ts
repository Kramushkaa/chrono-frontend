import { Person } from 'shared/types';
import { QuizQuestion, AchievementsMatchQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateAchievementsMatchQuestion = (persons: Person[]): QuizQuestion => {
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
    id: `achievements-match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'achievementsMatch',
    question: 'Сопоставьте достижения с личностями:',
    correctAnswer,
    data
  };
};

