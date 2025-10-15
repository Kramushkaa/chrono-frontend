import React, { useRef, useState } from 'react';
import { AchievementsMatchQuestionData, QuizAnswer, QuizPerson } from '../../types';
import { useMobile } from 'shared/hooks/useMobile';

interface AchievementsMatchQuestionProps {
  data: AchievementsMatchQuestionData;
  onAnswer: (answer: string[]) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: QuizPerson) => void;
}

export const AchievementsMatchQuestion: React.FC<AchievementsMatchQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false,
  onPersonInfoClick
}) => {
  const [matches, setMatches] = useState<{ [personId: string]: string }>({});
  const [draggedAchievement, setDraggedAchievement] = useState<string | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);
  const dragCounter = useRef(0);

  // Touch DnD support
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const draggedElementRef = useRef<HTMLDivElement | null>(null);
  const draggedAchievementRef = useRef<string | null>(null);
  const touchOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const originalRectRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const ghostElRef = useRef<HTMLDivElement | null>(null);
  const originalOpacityRef = useRef<string>('');
  
  // Используем правильный хук для определения мобильного устройства (только по ширине экрана)
  const isMobile = useMobile();

  const handleDragStart = (e: React.DragEvent, achievement: string) => {
    if (showFeedback) return;
    
    e.dataTransfer.setData('text/plain', achievement);
    setDraggedAchievement(achievement);
  };

  const handleDragEnd = () => {
    setDraggedAchievement(null);
    setDraggedOverSlot(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot(personId);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDraggedOverSlot(null);
    }
  };

  const handleDragEnter = () => {
    dragCounter.current++;
  };

  const handleDrop = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return;
    
    e.preventDefault();
    const achievement = e.dataTransfer.getData('text/plain');
    
    if (achievement) {
      const newMatches = { ...matches, [personId]: achievement };
      setMatches(newMatches);
      
      // Проверяем, все ли личности сопоставлены
      if (Object.keys(newMatches).length === data.persons.length) {
        // Отправляем ответ в том же порядке, что и правильный ответ
        const answerInCorrectOrder = data.persons.map(person => newMatches[person.id]);
        
        onAnswer(answerInCorrectOrder);
      }
    }
    
    setDraggedAchievement(null);
    setDraggedOverSlot(null);
    dragCounter.current = 0;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, achievement: string) => {
    if (showFeedback || !isMobile) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setIsTouchDragging(true);
    setDraggedAchievement(achievement);
    draggedAchievementRef.current = achievement;
    draggedElementRef.current = e.currentTarget;
    document.body.style.overflow = 'hidden';
    
    // Подготавливаем клон-элемент, добавляем под document.body
    const rect = e.currentTarget.getBoundingClientRect();
    touchOffsetRef.current = { 
      x: touch.clientX - rect.left, 
      y: touch.clientY - rect.top 
    };
    originalRectRef.current = { width: rect.width, height: rect.height };

    const sourceEl = e.currentTarget as HTMLDivElement;
    originalOpacityRef.current = sourceEl.style.opacity;
    sourceEl.style.opacity = '0.3';

    const ghost = sourceEl.cloneNode(true) as HTMLDivElement;
    ghost.style.position = 'fixed';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.zIndex = '2147483647';
    ghost.style.pointerEvents = 'none';
    ghost.style.margin = '0';
    ghost.style.transform = 'none';
    ghost.style.boxSizing = 'border-box';
    document.body.appendChild(ghost);
    ghostElRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging || !isMobile) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    // Перемещаем клон под пальцем в координатах viewport
    if (ghostElRef.current) {
      const ghost = ghostElRef.current;
      ghost.style.left = `${touch.clientX - touchOffsetRef.current.x}px`;
      ghost.style.top = `${touch.clientY - touchOffsetRef.current.y}px`;
    }
    
    // Находим элемент под курсором
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const slot = elementBelow.closest('.achievements-slot') as HTMLElement | null;
      if (slot) {
        const personId = slot.getAttribute('data-person-id');
        if (personId) setDraggedOverSlot(personId);
      } else {
        setDraggedOverSlot(null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDragging || !isMobile) return;
    
    e.preventDefault();
    const touch = e.changedTouches[0];
    const achievement = draggedAchievementRef.current;
    
    // Находим элемент под курсором
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow && achievement && !showFeedback) {
      const slot = elementBelow.closest('.achievements-slot') as HTMLElement | null;
      if (slot) {
        const personId = slot.getAttribute('data-person-id');
        if (personId) {
          const newMatches = { ...matches, [personId]: achievement };
          setMatches(newMatches);
          if (Object.keys(newMatches).length === data.persons.length) {
            const answerInCorrectOrder = data.persons.map(person => newMatches[person.id]);
            onAnswer(answerInCorrectOrder);
          }
        }
      }
    }
    
    // Сбрасываем состояние
    if (ghostElRef.current) {
      ghostElRef.current.remove();
      ghostElRef.current = null;
    }
    if (draggedElementRef.current) {
      const src = draggedElementRef.current;
      src.style.opacity = originalOpacityRef.current;
    }
    document.body.style.overflow = '';
    setIsTouchDragging(false);
    setDraggedOverSlot(null);
    setDraggedAchievement(null);
    draggedAchievementRef.current = null;
    dragCounter.current = 0;
  };

  const getAvailableAchievements = () => {
    // Всегда показываем все достижения, но помечаем использованные
    return data.achievements;
  };

  const isAchievementUsed = (achievement: string) => {
    return Object.values(matches).includes(achievement);
  };

  const getMatchClass = (personId: string) => {
    if (!showFeedback || !userAnswer) return '';
    
    const correctMatches = data.correctMatches;
    const userMatch = matches[personId];
    const correctMatch = correctMatches[personId];
    
    if (userMatch && correctMatch) {
      if (userMatch === correctMatch) {
        return 'correct';
      } else {
        return 'incorrect';
      }
    }
    
    return '';
  };

  const getAchievementClass = (achievement: string) => {
    if (!showFeedback || !userAnswer) return '';
    
    const userMatches = userAnswer.answer as string[];
    const correctMatches = data.correctMatches;
    const isUserMatch = userMatches.includes(achievement);
    const isCorrectMatch = Object.values(correctMatches).includes(achievement);
    
    if (isUserMatch && isCorrectMatch) {
      return 'correct';
    } else if (isUserMatch && !isCorrectMatch) {
      return 'incorrect';
    } else if (isCorrectMatch) {
      return 'correct-answer';
    }
    
    return '';
  };

  return (
    <div className="quiz-question achievements-match-question">
      <div className="quiz-question-content">
        <h3>Сопоставьте достижения с личностями:</h3>
        
        {/* Фиксированные личности */}
        <div className="achievements-persons-section">
          <div className="achievements-persons-grid">
            {data.persons.map(person => (
              <div key={person.id} className="achievements-person-card">
                <div className="achievements-person-info">
                  {person.imageUrl && (
                    <img 
                      src={person.imageUrl} 
                      alt={person.name}
                      className="achievements-person-image"
                    />
                  )}
                  <div className="achievements-person-header">
                    <h5>{person.name}</h5>
                    {showFeedback && onPersonInfoClick && (
                      <button
                        className="quiz-person-info-button achievements-info-button"
                                onClick={() => onPersonInfoClick(person)}
                        title="Подробная информация"
                        aria-label={`Подробная информация о ${person.name}`}
                      >
                        i
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Слот для достижения */}
                <div 
                  className={`achievements-slot ${draggedOverSlot === person.id ? 'drag-over' : ''} ${getMatchClass(person.id)}`}
                  data-person-id={person.id}
                  onDragOver={(e) => handleDragOver(e, person.id)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, person.id)}
                >
                  {matches[person.id] ? (
                    <div className="achievements-slot-content">
                      <span className="achievements-slot-text">{matches[person.id]}</span>
                      {!showFeedback && (
                        <button 
                          className="achievements-remove-btn"
                          onClick={() => {
                            const newMatches = { ...matches };
                            delete newMatches[person.id];
                            setMatches(newMatches);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="achievements-slot-placeholder">
                      Перетащите достижение сюда
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Достижения для перетаскивания */}
        {!showFeedback && (
          <div className="achievements-draggable-section">
            <div className="achievements-draggable-grid">
              {getAvailableAchievements().map(achievement => {
                const isUsed = isAchievementUsed(achievement);
                const isDraggable = !showFeedback && !isUsed;
                
                return (
                  <div
                    key={achievement}
                    className={`achievements-draggable-card ${draggedAchievement === achievement ? 'dragging' : ''} ${isUsed ? 'used' : ''} ${getAchievementClass(achievement)}`}
                    draggable={isDraggable}
                    onDragStart={isDraggable ? (e) => handleDragStart(e, achievement) : undefined}
                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                    onTouchStart={isDraggable ? (e) => handleTouchStart(e, achievement) : undefined}
                    onTouchMove={isDraggable ? handleTouchMove : undefined}
                    onTouchEnd={isDraggable ? handleTouchEnd : undefined}
                  >
                    <div className="achievements-draggable-content">
                      <span className="achievements-draggable-text">{achievement}</span>
                      {/* Removed used indicator to keep only opacity feedback */}
                    </div>
                  </div>
                );
              })}
            </div>
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
              <p><strong>Правильный ответ:</strong> {data.persons.map(p => `${p.name}: ${data.correctMatches[p.id]}`).join(', ')}</p>
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