import React, { useState, useRef } from 'react';
import { AchievementsMatchQuestionData, QuizAnswer } from '../../types';

interface AchievementsMatchQuestionProps {
  data: AchievementsMatchQuestionData;
  onAnswer: (answer: string[]) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

export const AchievementsMatchQuestion: React.FC<AchievementsMatchQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false 
}) => {
  const [matches, setMatches] = useState<{ [personId: string]: string }>({});
  const [draggedAchievement, setDraggedAchievement] = useState<string | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);
  const dragCounter = useRef(0);

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
          <h4>Личности:</h4>
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
                  <h5>{person.name}</h5>
                </div>
                
                {/* Слот для достижения */}
                <div 
                  className={`achievements-slot ${draggedOverSlot === person.id ? 'drag-over' : ''} ${getMatchClass(person.id)}`}
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
        <div className="achievements-draggable-section">
          <h4>Достижения:</h4>
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
                >
                  <div className="achievements-draggable-content">
                    <span className="achievements-draggable-text">{achievement}</span>
                    {isDraggable && (
                      <div className="achievements-drag-handle">⋮⋮</div>
                    )}
                    {isUsed && !showFeedback && (
                      <div className="achievements-used-indicator">✓</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              <p><strong>Ваш ответ:</strong> {(userAnswer.answer as string[]).join(', ')}</p>
              <p><strong>Правильный ответ:</strong> {Object.values(data.correctMatches).join(', ')}</p>
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