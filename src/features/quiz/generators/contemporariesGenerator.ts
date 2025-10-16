import { Person } from 'shared/types';
import { QuizQuestion, ContemporariesQuestionData } from '../types';
import { generateSimpleFallback } from './fallbackGenerator';

export const generateContemporariesQuestion = (persons: Person[]): QuizQuestion => {
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
    id: `contemporaries-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'contemporaries',
    question: 'Разделите на группы современников',
    correctAnswer: result.correctGroups,
    data
  };
};

