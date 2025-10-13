import React, { useState, useRef, useEffect } from 'react';
import { ContemporariesQuestionData, QuizAnswer } from '../../types';
import { useMobile } from 'shared/hooks/useMobile';

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
  const [draggedOverGroup, setDraggedOverGroup] = useState<number | null>(null);
  const [draggedOverCreateZone, setDraggedOverCreateZone] = useState(false);
  const dragCounters = useRef<{ [key: string]: number }>({});
  
  // Touch events state (для мобильных устройств)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedElementRef = useRef<HTMLDivElement | null>(null);
  
  // Используем правильный хук для определения мобильного устройства (только по ширине экрана)
  const isMobile = useMobile();

  // Reset state when question data changes
  useEffect(() => {
    setGroups([data.persons.map(p => p.id).sort(() => Math.random() - 0.5)]);
    setDraggedItem(null);
    setDraggedOverGroup(null);
    setDraggedOverCreateZone(false);
    dragCounters.current = {};
    // Сбрасываем touch состояние
    setTouchStartPos(null);
    setIsDragging(false);
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

  // Drag & Drop handlers (только для desktop)
  const handleDragStart = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return;
    setDraggedItem(personId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', personId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverGroup(null);
    setDraggedOverCreateZone(false);
    dragCounters.current = {};
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterGroup = (groupIndex: number) => {
    const groupKey = `group-${groupIndex}`;
    dragCounters.current[groupKey] = (dragCounters.current[groupKey] || 0) + 1;
    setDraggedOverGroup(groupIndex);
    setDraggedOverCreateZone(false); // Сбрасываем подсветку зоны создания
  };

  const handleDragEnterCreateZone = () => {
    const createZoneKey = 'create-zone';
    dragCounters.current[createZoneKey] = (dragCounters.current[createZoneKey] || 0) + 1;
    setDraggedOverCreateZone(true);
    setDraggedOverGroup(null); // Сбрасываем подсветку всех групп
  };

  const handleDragLeaveGroup = (groupIndex: number) => {
    const groupKey = `group-${groupIndex}`;
    dragCounters.current[groupKey] = Math.max(0, (dragCounters.current[groupKey] || 0) - 1);
    if (dragCounters.current[groupKey] === 0) {
      setDraggedOverGroup(null);
    }
  };

  const handleDragLeaveCreateZone = () => {
    const createZoneKey = 'create-zone';
    dragCounters.current[createZoneKey] = Math.max(0, (dragCounters.current[createZoneKey] || 0) - 1);
    if (dragCounters.current[createZoneKey] === 0) {
      setDraggedOverCreateZone(false);
    }
  };

  const handleDrop = (e: React.DragEvent, targetGroupIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showFeedback) return;
    
    const personId = e.dataTransfer.getData('text/plain');
    if (!personId) return;
    
    // Если личность уже в этой группе, ничего не делаем
    if (groups[targetGroupIndex]?.includes(personId)) {
      return;
    }
    
    // Перемещаем в существующую группу
    addToGroup(personId, targetGroupIndex);
  };

  // Создание новой группы через перетаскивание
  const handleDropToCreateGroup = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showFeedback) return;
    
    const personId = e.dataTransfer.getData('text/plain');
    if (!personId) return;
    
    // Создаем новую группу
    createGroup(personId);
  };

  // Touch event handlers (для мобильных устройств)
  const handleTouchStart = (e: React.TouchEvent, personId: string) => {
    if (showFeedback || !isMobile) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedItem(personId);
    setIsDragging(true);
    
    const target = e.currentTarget as HTMLDivElement;
    draggedElementRef.current = target;
    target.style.pointerEvents = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStartPos || !isMobile) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;

    // Определяем, что это действительно перетаскивание, а не просто касание
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      e.preventDefault(); // Предотвращаем скролл страницы
      
      // Находим элемент под курсором
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elementBelow) {
        const groupElement = elementBelow.closest('.group-persons');
        const createZoneElement = elementBelow.closest('.create-group-drop-zone');
        
        if (groupElement) {
          const groupIndex = parseInt(groupElement.getAttribute('data-group-index') || '0');
          setDraggedOverGroup(groupIndex);
          setDraggedOverCreateZone(false);
        } else if (createZoneElement) {
          setDraggedOverCreateZone(true);
          setDraggedOverGroup(null);
        } else {
          setDraggedOverGroup(null);
          setDraggedOverCreateZone(false);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const touch = e.changedTouches[0];

    // Находим элемент под курсором
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const groupElement = elementBelow.closest('.group-persons');
      const createZoneElement = elementBelow.closest('.create-group-drop-zone');
      
      if (groupElement) {
        const groupIndex = parseInt(groupElement.getAttribute('data-group-index') || '0');
        const personId = draggedItem;
        if (personId && !groups[groupIndex]?.includes(personId)) {
          addToGroup(personId, groupIndex);
        }
      } else if (createZoneElement) {
        const personId = draggedItem;
        if (personId) {
          createGroup(personId);
        }
      }
    }

    // Сбрасываем состояние
    resetDragState();
  };

  const resetDragState = () => {
    if (draggedElementRef.current) {
      draggedElementRef.current.style.transform = '';
      draggedElementRef.current.style.zIndex = '';
      draggedElementRef.current.style.opacity = '';
      draggedElementRef.current.style.boxShadow = '';
      draggedElementRef.current.style.pointerEvents = '';
    }
    setTouchStartPos(null);
    setIsDragging(false);
    setDraggedItem(null);
    setDraggedOverGroup(null);
    setDraggedOverCreateZone(false);
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
        draggable={!showFeedback && !isMobile}
        onDragStart={(e) => handleDragStart(e, personId)}
        onDragEnd={handleDragEnd}
        onTouchStart={!showFeedback ? (e) => handleTouchStart(e, personId) : undefined}
        onTouchMove={!showFeedback ? handleTouchMove : undefined}
        onTouchEnd={!showFeedback ? handleTouchEnd : undefined}
        className={`contemporaries-person-card ${isDragged ? 'dragging' : ''} ${
          showFeedback ? (personStatus === 'correct' ? 'correct' : 
                         personStatus === 'incorrect' ? 'incorrect' : '') : ''
        } ${showFeedback ? 'feedback-mode' : ''}`}
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
    <div className={`quiz-question contemporaries-question ${showFeedback ? 'show-feedback' : ''}`}>
      <div className="quiz-question-content">
        <h3>Разделите на группы современников:</h3>
        {!showFeedback && (
          <p className="instruction-hint">
            {isMobile 
              ? "Нажмите и удерживайте карточку, затем перетащите её в нужную группу или создайте новую"
              : "Перетащите карточки в группы или создайте новые группы"
            }
          </p>
        )}

        {/* Все группы, включая группу 1 */}
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="contemporaries-group">
            <div 
              className={`group-persons ${draggedOverGroup === groupIndex ? 'drag-over' : ''}`}
              data-group-index={groupIndex}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnterGroup(groupIndex)}
              onDragLeave={() => handleDragLeaveGroup(groupIndex)}
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
              {!showFeedback && groups.length > 1 && (
                <div className="drop-zone-hint">
                  Перетащите сюда
                </div>
              )}
            </div>
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
        ))}

        {/* Поле для создания новой группы */}
        {!showFeedback && groups.length > 0 && groups.some(group => group.length > 0) && (
          <div className="create-new-group-zone">
            <div 
              className={`create-group-drop-zone ${draggedOverCreateZone ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnterCreateZone}
              onDragLeave={handleDragLeaveCreateZone}
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
