import React, { useCallback } from 'react'
import { ContemporariesQuestionData, QuizAnswer, QuizPerson } from '../../types'
import { useMobile } from 'shared/hooks/useMobile'
import { useContemporariesGroups } from '../../hooks/useContemporariesGroups'
import { useContemporariesDragDrop } from '../../hooks/useContemporariesDragDrop'
import { useContemporariesFeedback } from '../../hooks/useContemporariesFeedback'
import { ContemporariesGroupZone } from '../ContemporariesGroupZone'

interface ContemporariesQuestionProps {
  data: ContemporariesQuestionData
  onAnswer: (answer: string | string[] | string[][]) => void
  showFeedback?: boolean
  userAnswer?: QuizAnswer | null
  onNext?: () => void
  isLastQuestion?: boolean
  onPersonInfoClick?: (person: QuizPerson) => void
}

export const ContemporariesQuestion: React.FC<ContemporariesQuestionProps> = ({
  data,
  onAnswer,
  showFeedback = false,
  userAnswer = null,
  onNext,
  isLastQuestion = false,
  onPersonInfoClick,
}) => {
  const isMobile = useMobile()

  // Use custom hooks for groups and drag&drop management
  const { groups, createGroup, addToGroup, removeGroup } = useContemporariesGroups({ 
    persons: data.persons,
    showFeedback,
    userAnswer
  })

  const dragDropHandlers = useContemporariesDragDrop({ 
    showFeedback, 
    isMobile, 
    groups,
    addToGroup,
    createGroup,
  })

  const personStatuses = useContemporariesFeedback({ showFeedback, userAnswer, data })

  const getPersonById = useCallback(
    (personId: string) => {
      return data.persons.find((p) => p.id === personId)
    },
    [data.persons]
  )

  const handleSubmit = useCallback(() => {
    onAnswer(groups)
  }, [groups, onAnswer])

  const handleDrop = useCallback(
    (e: React.DragEvent, groupIndex: number) => {
      dragDropHandlers.handleDrop(e, groupIndex, addToGroup)
    },
    [dragDropHandlers, addToGroup]
  )

  const handleDropToCreateGroup = useCallback(
    (e: React.DragEvent) => {
      dragDropHandlers.handleDropToCreateGroup(e, createGroup)
    },
    [dragDropHandlers, createGroup]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      dragDropHandlers.handleTouchEnd(e, addToGroup, createGroup)
    },
    [dragDropHandlers, addToGroup, createGroup]
  )

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

        {/* Все группы */}
        {groups.map((group, groupIndex) => (
          <ContemporariesGroupZone
            key={groupIndex}
            group={group}
            groupIndex={groupIndex}
            draggedOverGroup={dragDropHandlers.draggedOverGroup}
            showFeedback={showFeedback}
            canRemoveGroup={groups.length > 1}
            getPersonById={getPersonById}
            personStatuses={personStatuses}
            draggedItem={dragDropHandlers.draggedItem}
            isMobile={isMobile}
            onDragOverGroup={dragDropHandlers.handleDragOverGroup}
            onDragEnterGroup={dragDropHandlers.handleDragEnterGroup}
            onDragLeaveGroup={dragDropHandlers.handleDragLeaveGroup}
            onDrop={handleDrop}
            onDragStart={dragDropHandlers.handleDragStart}
            onDragEnd={dragDropHandlers.handleDragEnd}
            onTouchStart={dragDropHandlers.handleTouchStart}
            onTouchMove={dragDropHandlers.handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onRemoveGroup={removeGroup}
            onPersonInfoClick={onPersonInfoClick}
          />
        ))}

        {/* Поле для создания новой группы */}
        {!showFeedback && groups.length > 0 && groups.some((group) => group.length > 0) && (
          <div className="create-new-group-zone">
            <div
              className={`create-group-drop-zone ${dragDropHandlers.draggedOverCreateZone ? 'drag-over' : ''}`}
              onDragOver={dragDropHandlers.handleDragOverCreateZone}
              onDragEnter={dragDropHandlers.handleDragEnterCreateZone}
              onDragLeave={dragDropHandlers.handleDragLeaveCreateZone}
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



