import React, { useState, useRef, useEffect } from 'react';
import { ContemporariesQuestionData, QuizAnswer } from '../../types';

interface ContemporariesQuestionProps {
  data: ContemporariesQuestionData;
  onAnswer: (answer: string | string[] | string[][]) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: any) => void;
}

export const ContemporariesQuestion: React.FC<ContemporariesQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false,
  onPersonInfoClick
}) => {
  // Состояние групп: все группы включая первую (изначально содержащую всех личностей)
  const [groups, setGroups] = useState<string[][]>(() => [
    data.persons.map(p => p.id).sort(() => Math.random() - 0.5)
  ]);
  
  // Drag & Drop состояние
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const draggedElementRef = useRef<HTMLDivElement | null>(null);

  // Reset state when question data changes
  useEffect(() => {
    setGroups([data.persons.map(p => p.id).sort(() => Math.random() - 0.5)]);
    setDraggedItem(null);
    if (draggedElementRef.current) {
      draggedElementRef.current.style.transform = '';
      draggedElementRef.current = null;
    }
  }, [data.persons]);


  const getPersonById = (personId: string) => {
    return data.persons.find(p => p.id === personId);
  };

  // Создание новой группы (перемещение из любой существующей группы)
  const createGroup = (personId: string) => {
    const newGroups = [...groups];
    
    // Находим и удаляем из текущей группы
    const currentGroupIndex = newGroups.findIndex(group => group.includes(personId));
    if (currentGroupIndex !== -1) {
      newGroups[currentGroupIndex] = newGroups[currentGroupIndex].filter(id => id !== personId);
      
      // Если группа стала пустой, удаляем её
      if (newGroups[currentGroupIndex].length === 0) {
        newGroups.splice(currentGroupIndex, 1);
      }
    }
    
    // Создаем новую группу
    newGroups.push([personId]);
    setGroups(newGroups);
  };

  // Добавление личности в существующую группу
  const addToGroup = (personId: string, groupIndex: number) => {
    const newGroups = [...groups];
    
    // Удаляем из текущей группы
    const currentGroupIndex = newGroups.findIndex(group => group.includes(personId));
    if (currentGroupIndex !== -1) {
      newGroups[currentGroupIndex] = newGroups[currentGroupIndex].filter(id => id !== personId);
      
      // Если группа стала пустой, удаляем её
      if (newGroups[currentGroupIndex].length === 0) {
        newGroups.splice(currentGroupIndex, 1);
        // Корректируем индекс целевой группы, если она была после удаленной
        if (groupIndex > currentGroupIndex) {
          groupIndex--;
        }
      }
    }
    
    // Добавляем в целевую группу
    newGroups[groupIndex] = [...newGroups[groupIndex], personId];
    setGroups(newGroups);
  };


  // Удаление группы
  const removeGroup = (groupIndex: number) => {
    const newGroups = [...groups];
    const removedPersonIds = newGroups[groupIndex];
    newGroups.splice(groupIndex, 1);
    
    // Если есть другие группы, возвращаем всех в первую доступную группу
    if (newGroups.length > 0) {
      newGroups[0] = [...newGroups[0], ...removedPersonIds];
    } else {
      // Если это была последняя группа, создаем новую с удаленными личностями
      newGroups.push(removedPersonIds);
    }
    
    setGroups(newGroups);
  };

  // Проверка ответа
  const handleSubmit = () => {
    // Отправляем все группы (включая группу 1)
    // Если все личности в группе 1 - это тоже валидный ответ (все в одной группе)
    onAnswer(groups);
  };

  // Drag & Drop handlers (упрощенная версия из BirthOrderQuestion)
  const handleDragStart = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return;
    
    setDraggedItem(personId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    
    if (draggedElementRef.current) {
      draggedElementRef.current.style.transform = '';
      draggedElementRef.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetGroupIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem || showFeedback) return;
    
    // Если личность уже в этой группе, ничего не делаем
    if (groups[targetGroupIndex]?.includes(draggedItem)) {
      handleDragEnd();
      return;
    }
    
    // Перемещаем в существующую группу
    addToGroup(draggedItem, targetGroupIndex);
    handleDragEnd();
  };

  // Создание новой группы через перетаскивание
  const handleDropToCreateGroup = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItem || showFeedback) return;
    
    // Создаем новую группу
    createGroup(draggedItem);
    handleDragEnd();
  };

  // Функция для анализа правильности групп
  const analyzeGroupCorrectness = () => {
    if (!showFeedback || !userAnswer) return {};
    
    const userGroups = userAnswer.answer as string[][];
    const correctGroups = data.correctGroups;
    const personStatus: { [personId: string]: 'correct' | 'incorrect' | 'missing' } = {};
    
    // Инициализируем всех личностей как отсутствующих
    const allPersonIds = new Set<string>();
    userGroups.forEach(group => group.forEach(id => allPersonIds.add(id)));
    correctGroups.forEach(group => group.forEach(id => allPersonIds.add(id)));
    
    allPersonIds.forEach(personId => {
      personStatus[personId] = 'missing';
    });
    
    // Проверяем каждую группу пользователя
    userGroups.forEach(userGroup => {
      // Находим соответствующую правильную группу
      const matchingCorrectGroup = correctGroups.find(correctGroup => 
        correctGroup.some(id => userGroup.includes(id))
      );
      
      if (matchingCorrectGroup) {
        // Проверяем, полная ли группа (содержит всех нужных людей)
        const isGroupComplete = matchingCorrectGroup.every(id => userGroup.includes(id));
        
        if (isGroupComplete) {
          // Группа полная - правильные зеленые, лишние красные
          userGroup.forEach(personId => {
            if (matchingCorrectGroup.includes(personId)) {
              personStatus[personId] = 'correct';
            } else {
              personStatus[personId] = 'incorrect'; // Лишние
            }
          });
        } else {
          // Группа неполная - все красные
          userGroup.forEach(personId => {
            personStatus[personId] = 'incorrect';
          });
        }
      } else {
        // Если нет соответствующей правильной группы, все неправильные
        userGroup.forEach(personId => {
          personStatus[personId] = 'incorrect';
        });
      }
    });
    
    return personStatus;
  };

  // Компонент карточки личности
  const PersonCard: React.FC<{ personId: string; isInGroup?: boolean; groupIndex?: number }> = ({ 
    personId, 
    isInGroup = false, 
    groupIndex 
  }) => {
    const person = getPersonById(personId);
    if (!person) return null;

    const isDragged = draggedItem === personId;
    const personStatuses = analyzeGroupCorrectness();
    const personStatus = personStatuses[personId] || 'missing';

    return (
      <div
        ref={isDragged ? draggedElementRef : null}
        draggable={!showFeedback}
        onDragStart={(e) => handleDragStart(e, personId)}
        onDragEnd={handleDragEnd}
        className={`contemporaries-person-card ${isDragged ? 'dragging' : ''} ${
          showFeedback ? (personStatus === 'correct' ? 'correct' : 
                         personStatus === 'incorrect' ? 'incorrect' : '') : ''
        }`}
        style={{
          transform: isDragged ? 'rotate(5deg)' : '',
          opacity: isDragged ? 0.7 : 1,
        }}
      >
        <div className="contemporaries-person-info">
          {showFeedback && onPersonInfoClick && (
            <button
              className="quiz-person-info-button contemporaries-info-button"
              onClick={() => onPersonInfoClick(person)}
              title="Подробная информация"
              aria-label={`Подробная информация о ${person.name}`}
            >
              i
            </button>
          )}
          
          {person.imageUrl && (
            <img
              src={person.imageUrl}
              alt={person.name}
              className="contemporaries-person-image"
            />
          )}
          
          <div className="contemporaries-person-content">
            <h5>{person.name}</h5>
            {showFeedback && (
              <p className="person-details">
                <span className="birth-years">
                  {person.birthYear} - {person.deathYear || 'н.в.'}
                </span>
              </p>
            )}
          </div>
        </div>
        
      </div>
    );
  };

  return (
    <div className="quiz-question contemporaries-question">
      <div className="quiz-question-content">
        <h3>Разделите этих личностей на группы современников:</h3>

        {/* Все группы, включая группу 1 */}
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="contemporaries-group">
            <div className="group-header">
              <h4>Группа {groupIndex + 1}</h4>
              {!showFeedback && groups.length > 1 && (
                <button
                  className="remove-group-btn"
                  onClick={() => removeGroup(groupIndex)}
                  title="Удалить группу"
                >
                  Удалить группу
                </button>
              )}
            </div>
            <div 
              className="group-persons"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, groupIndex)}
            >
              {group.map(personId => (
                <PersonCard
                  key={personId}
                  personId={personId}
                  isInGroup={true}
                  groupIndex={groupIndex}
                />
              ))}
              {groups.length > 1 && (
                <div className="drop-zone-hint">
                  Перетащите сюда
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Поле для создания новой группы */}
        {!showFeedback && groups.length > 0 && groups.some(group => group.length > 0) && (
          <div className="create-new-group-zone">
            <div 
              className="create-group-drop-zone"
              onDragOver={handleDragOver}
              onDrop={handleDropToCreateGroup}
            >
              <div className="create-group-hint">
                <span>+ Создать новую группу</span>
                <p>Перетащите сюда личность из любой существующей группы</p>
              </div>
            </div>
          </div>
        )}


        {/* Кнопка проверки */}
        {!showFeedback && (
          <div className="contemporaries-actions">
            <button onClick={handleSubmit} className="submit-groups-button">
              Проверить ответ
            </button>
          </div>
        )}

        {/* Фидбек */}
        {showFeedback && userAnswer && (
          <div className="question-feedback">
            <div className={`feedback-status ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="feedback-icon">
                {userAnswer.isCorrect ? '✓' : '✗'}
              </div>
              <div className="feedback-text">
                {userAnswer.isCorrect ? 'Правильно!' : 'Неправильно'}
              </div>
            </div>

            <div className="feedback-details">
              <p><strong>Время:</strong> {Math.round(userAnswer.timeSpent / 1000)}с</p>
              
              {/* Показываем правильные группы */}
              <div className="correct-groups-explanation">
                <h5>Правильная группировка:</h5>
                {data.correctGroups.map((group, index) => (
                  <div key={index} className="correct-group">
                    <strong>Группа {index + 1}:</strong>{' '}
                    {group.map(personId => getPersonById(personId)?.name).join(', ')}
                    <span className="group-years">
                      {' '}({group.map(personId => {
                        const person = getPersonById(personId);
                        return `${person?.birthYear}-${person?.deathYear || 'н.в.'}`;
                      }).join(', ')})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {onNext && (
              <div className="feedback-actions">
                <button onClick={onNext} className="feedback-next-button">
                  {isLastQuestion ? 'Завершить игру' : 'Далее'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
