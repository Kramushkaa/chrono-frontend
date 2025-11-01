import React, { useState, useRef, useEffect } from 'react';
import { BirthOrderQuestionData, QuizAnswer, QuizPerson } from '../../types';
import { useMobile } from 'shared/hooks/useMobile';

interface BirthOrderQuestionProps {
  data: BirthOrderQuestionData;
  onAnswer: (answer: string[]) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: QuizPerson) => void;
}

export const BirthOrderQuestion: React.FC<BirthOrderQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false,
  onPersonInfoClick
}) => {
  // Инициализируем порядок со всеми личностями в случайном порядке
  const [order, setOrder] = useState<string[]>(() => 
    data.persons.map(p => p.id).sort(() => Math.random() - 0.5)
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<{ personId: string; position: 'above' | 'below' } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  
  // Touch events state
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const draggedElementRef = useRef<HTMLDivElement | null>(null);
  
  // Используем правильный хук для определения мобильного устройства (только по ширине экрана)
  const isMobile = useMobile();

  // Reset state when question data changes (e.g., next question)
  useEffect(() => {
    // В режиме просмотра результатов восстанавливаем ответ пользователя
    if (showFeedback && userAnswer) {
      const userOrder = userAnswer.answer as string[];
      setOrder(userOrder);
    } else {
      // Reinitialize order with new persons
      setOrder(data.persons.map(p => p.id).sort(() => Math.random() - 0.5));
    }
    // Clear any drag-related state
    setDraggedItem(null);
    setDraggedOver(null);
    setIsDragActive(false);
    setIsDragging(false);
    setTouchStartPos(null);
    // Reset any transient DOM transform on a previously dragged element
    if (draggedElementRef.current) {
      draggedElementRef.current.style.transform = '';
      draggedElementRef.current.style.zIndex = '';
      draggedElementRef.current.style.pointerEvents = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.persons, showFeedback, userAnswer?.questionId]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent, personId: string) => {
    if (showFeedback || !isMobile) return;
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedItem(personId);
    setIsDragging(true);
    setIsDragActive(true);

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
      // Обновляем позицию элемента
      if (draggedElementRef.current) {
        draggedElementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        draggedElementRef.current.style.zIndex = '1000';
      }

      // Находим элемент под курсором
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elementBelow) {
        const personCard = elementBelow.closest('.birth-order-person');
        const dropZone = elementBelow.closest('.drop-zone');
        
        if (personCard && personCard !== draggedElementRef.current) {
          const personId = personCard.getAttribute('data-person-id');
          if (personId) {
            const rect = personCard.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const isAbove = touch.clientY < midpoint;
            setDraggedOver({ personId, position: isAbove ? 'above' : 'below' });
          }
        } else if (dropZone) {
          const personId = dropZone.getAttribute('data-person-id');
          const position = dropZone.getAttribute('data-position') as 'above' | 'below';
          if (personId) {
            setDraggedOver({ personId, position });
          }
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
      const personCard = elementBelow.closest('.birth-order-person');
      const dropZone = elementBelow.closest('.drop-zone');
      
      if (personCard && personCard !== draggedElementRef.current) {
        const personId = personCard.getAttribute('data-person-id');
        if (personId) {
          const rect = personCard.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          const isAbove = touch.clientY < midpoint;
          handleDrop(null, personId, isAbove ? 'above' : 'below');
        }
      } else if (dropZone) {
        const personId = dropZone.getAttribute('data-person-id');
        const position = dropZone.getAttribute('data-position') as 'above' | 'below';
        if (personId) {
          handleDrop(null, personId, position);
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
      draggedElementRef.current.style.pointerEvents = '';
    }
    setTouchStartPos(null);
    setIsDragging(false);
    setIsDragActive(false);
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragStart = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return;
    setDraggedItem(personId);
    setIsDragActive(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', personId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent, personId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const draggedPersonId = e.dataTransfer.getData('text/html');
    if (draggedPersonId && draggedPersonId !== personId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const isAbove = e.clientY < midpoint;
      setDraggedOver({ personId, position: isAbove ? 'above' : 'below' });
    }
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDraggedOver(null);
    }
  };

  const handleDragEnter = () => {
    dragCounter.current++;
  };

  const handleDrop = (e: React.DragEvent | null, targetPersonId: string, position?: 'above' | 'below') => {
    if (e) e.preventDefault();
    
    const draggedPersonId = e ? e.dataTransfer?.getData('text/html') : draggedItem;
    
    if (draggedPersonId && draggedPersonId !== targetPersonId) {
      const newOrder = [...order];
      const draggedIndex = newOrder.indexOf(draggedPersonId);
      const targetIndex = newOrder.indexOf(targetPersonId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Удаляем перетаскиваемый элемент
        newOrder.splice(draggedIndex, 1);
        
        // Определяем новую позицию на основе draggedOver состояния или переданной позиции
        let newTargetIndex = targetIndex;
        const finalPosition = position || draggedOver?.position;
        
        if (finalPosition === 'above') {
          newTargetIndex = targetIndex;
        } else if (finalPosition === 'below') {
          newTargetIndex = targetIndex + 1;
        } else if (e) {
          // Fallback: определяем по координатам курсора (только для drag events)
          const rect = e.currentTarget.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          const isAbove = e.clientY < midpoint;
          newTargetIndex = isAbove ? targetIndex : targetIndex + 1;
        }
        
        // Корректируем индекс после удаления элемента
        if (draggedIndex < targetIndex) {
          newTargetIndex = newTargetIndex - 1;
        }
        
        // Вставляем элемент в новую позицию
        newOrder.splice(newTargetIndex, 0, draggedPersonId);
        setOrder(newOrder);
        
        // noop
      }
    }
    
    setDraggedItem(null);
    setDraggedOver(null);
    dragCounter.current = 0;
  };

  const handleAnswer = () => {
    if (showFeedback) return;
    if (order.length === data.persons.length) {
      onAnswer(order);
    }
  };

  const getPersonById = (id: string) => data.persons.find(p => p.id === id);

  const getPersonClass = (personId: string) => {
    let className = 'birth-order-person';
    
    if (showFeedback && userAnswer) {
      className += ' feedback-mode';
      const userOrder = userAnswer.answer as string[];
      const correctOrder = data.correctOrder;
      const userIndex = userOrder.indexOf(personId);
      const correctIndex = correctOrder.indexOf(personId);
      
      if (userIndex !== -1 && correctIndex !== -1) {
        if (userIndex === correctIndex) {
          className += ' correct';
        } else {
          className += ' incorrect';
        }
      } else if (correctIndex !== -1) {
        className += ' correct-answer';
      }
    }
    
    // Добавляем классы для drag and drop
    if (draggedItem === personId) {
      className += ' dragging';
    }
    
    return className;
  };

  const shouldShowDropZone = (personId: string, position: 'above' | 'below') => {
    // Показываем дроп-зоны только когда активно перетаскивание
    if (!isDragActive || !draggedItem) return false;
    
    const draggedIndex = order.indexOf(draggedItem);
    const targetIndex = order.indexOf(personId);
    
    if (draggedIndex === -1 || targetIndex === -1) return true;
    
    // Скрываем обе дроп-зоны вокруг перетаскиваемой карточки
    if (personId === draggedItem) {
      return false;
    }
    
    // Не показываем зону выше, если перетаскиваемый элемент находится прямо перед целевым
    if (position === 'above' && draggedIndex === targetIndex - 1) {
      return false;
    }
    
    // Не показываем зону ниже, если перетаскиваемый элемент находится прямо после целевого
    if (position === 'below' && draggedIndex === targetIndex + 1) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="quiz-question birth-order-question">
      <div className="quiz-question-content">
        <h3>Расставьте по году рождения:</h3>
        
        {!showFeedback && (
          <div className="birth-order-instructions">
            <p>Перетащите личности в правильном порядке от самого раннего к самому позднему году рождения</p>
            <p className="instruction-hint">
              {isMobile 
                ? "Нажмите и удерживайте карточку, затем перетащите её в нужное место между другими карточками"
                : "Перетащите карточку в зоны между карточками для изменения порядка"
              }
            </p>
          </div>
        )}

        <div className="birth-order-persons-vertical">
          {order.map((personId, index) => {
            const person = getPersonById(personId);
            if (!person) return null;
            
            return (
              <React.Fragment key={person.id}>
                {/* Drop zone above each card */}
                {!showFeedback && (
                  <div
                    className={`drop-zone ${!shouldShowDropZone(person.id, 'above') ? 'hidden' : ''} ${draggedOver?.personId === person.id && draggedOver?.position === 'above' ? 'active' : ''}`}
                    data-person-id={person.id}
                    data-position="above"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDraggedOver({ personId, position: 'above' });
                    }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, person.id)}
                  />
                )}
                
                <div
                  draggable={!showFeedback && !isMobile}
                  data-person-id={person.id}
                  onDragStart={(e) => handleDragStart(e, person.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, person.id)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, person.id)}
                  onTouchStart={!showFeedback ? (e) => handleTouchStart(e, person.id) : undefined}
                  onTouchMove={!showFeedback ? handleTouchMove : undefined}
                  onTouchEnd={!showFeedback ? handleTouchEnd : undefined}
                  className={getPersonClass(person.id)}
                >
                  <div className="birth-order-position">
                    {index + 1}
                  </div>
                  {person.imageUrl && (
                    <img 
                      src={person.imageUrl} 
                      alt={person.name}
                      loading="lazy"
                      decoding="async"
                      className="birth-order-image"
                    />
                  )}
                  <div className="birth-order-person-info">
                    <div className="birth-order-person-header">
                      <h4>{person.name}</h4>
                      {showFeedback && onPersonInfoClick && (
                        <button
                          className="quiz-person-info-button birth-order-info-button"
                                  onClick={() => onPersonInfoClick(person)}
                          title="Подробная информация"
                          aria-label={`Подробная информация о ${person.name}`}
                        >
                          i
                        </button>
                      )}
                    </div>
                    <p className="person-details">
                      {person.category}
                      {showFeedback && (
                        <span className="birth-years">
                          • {person.birthYear} - {person.deathYear || 'н.в.'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          
          {/* Drop zone after the last card */}
          {!showFeedback && (
            <div
              className={`drop-zone ${!shouldShowDropZone(order[order.length - 1], 'below') ? 'hidden' : ''} ${draggedOver?.personId === order[order.length - 1] && draggedOver?.position === 'below' ? 'active' : ''}`}
              data-person-id={order[order.length - 1]}
              data-position="below"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDraggedOver({ personId: order[order.length - 1], position: 'below' });
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, order[order.length - 1])}
            />
          )}
        </div>

        {!showFeedback && (
          <div className="birth-order-actions">
            <button 
              onClick={handleAnswer}
              className="birth-order-submit"
            >
              Подтвердить порядок
            </button>
          </div>
        )}

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
              <p><strong>Правильный ответ:</strong> {data.correctOrder.map((id, index) => {
                const person = getPersonById(id);
                return person ? `${index + 1}. ${person.name}` : '';
              }).join(', ')}</p>
              <p><strong>Время:</strong> {Math.round(userAnswer.timeSpent / 1000)}с</p>
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



