import React, { useState, useRef } from 'react';
import { BirthOrderQuestionData, QuizAnswer } from '../../types';

interface BirthOrderQuestionProps {
  data: BirthOrderQuestionData;
  onAnswer: (answer: string[]) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

export const BirthOrderQuestion: React.FC<BirthOrderQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false 
}) => {
  // Инициализируем порядок со всеми личностями в случайном порядке
  const [order, setOrder] = useState<string[]>(() => 
    data.persons.map(p => p.id).sort(() => Math.random() - 0.5)
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<{ personId: string; position: 'above' | 'below' } | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return;
    setDraggedItem(personId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', personId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
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

  const handleDrop = (e: React.DragEvent, targetPersonId: string) => {
    e.preventDefault();
    const draggedPersonId = e.dataTransfer.getData('text/html');
    
    if (draggedPersonId && draggedPersonId !== targetPersonId) {
      const newOrder = [...order];
      const draggedIndex = newOrder.indexOf(draggedPersonId);
      const targetIndex = newOrder.indexOf(targetPersonId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Удаляем перетаскиваемый элемент
        newOrder.splice(draggedIndex, 1);
        
        // Определяем новую позицию на основе draggedOver состояния
        let newTargetIndex = targetIndex;
        if (draggedOver?.position === 'above') {
          newTargetIndex = targetIndex;
        } else if (draggedOver?.position === 'below') {
          newTargetIndex = targetIndex + 1;
        } else {
          // Fallback: определяем по координатам курсора
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
    } else if (order.includes(personId)) {
      className += ' selected';
    }
    
    // Добавляем классы для drag and drop
    if (draggedItem === personId) {
      className += ' dragging';
    }
    
    return className;
  };

  const shouldShowDropZone = (personId: string, position: 'above' | 'below') => {
    if (!draggedItem) return true;
    
    const draggedIndex = order.indexOf(draggedItem);
    const targetIndex = order.indexOf(personId);
    
    if (draggedIndex === -1 || targetIndex === -1) return true;
    
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
        <h3>Расставьте личности по году рождения (от самого раннего к самому позднему):</h3>
        
        <div className="birth-order-instructions">
          <p>Перетащите личности в правильном порядке от самого раннего к самому позднему году рождения</p>
          <p className="instruction-hint">Перетащите карточку в зоны между карточками для изменения порядка</p>
        </div>

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
                  draggable={!showFeedback}
                  onDragStart={(e) => handleDragStart(e, person.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, person.id)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, person.id)}
                  className={getPersonClass(person.id)}
                >
                  <div className="birth-order-position">
                    {index + 1}
                  </div>
                  {person.imageUrl && (
                    <img 
                      src={person.imageUrl} 
                      alt={person.name}
                      className="birth-order-image"
                    />
                  )}
                  <div className="birth-order-person-info">
                    <h4>{person.name}</h4>
                    <p className="person-details">
                      {person.category}
                      {showFeedback && (
                        <span className="birth-years">
                          • {person.birthYear} - {person.deathYear}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="drag-handle">⋮⋮</div>
                </div>
              </React.Fragment>
            );
          })}
          
          {/* Drop zone after the last card */}
          {!showFeedback && (
            <div
              className={`drop-zone ${!shouldShowDropZone(order[order.length - 1], 'below') ? 'hidden' : ''} ${draggedOver?.personId === order[order.length - 1] && draggedOver?.position === 'below' ? 'active' : ''}`}
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
              <p><strong>Ваш ответ:</strong> {(userAnswer.answer as string[]).map((id, index) => {
                const person = getPersonById(id);
                return person ? `${index + 1}. ${person.name}` : '';
              }).join(', ')}</p>
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
