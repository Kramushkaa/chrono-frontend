import React from 'react'
import { ContemporariesQuestionData, QuizPerson } from '../types'

interface PersonCardProps {
  personId: string
  person: ContemporariesQuestionData['persons'][0]
  isDragged: boolean
  personStatus: 'correct' | 'incorrect' | 'missing'
  showFeedback: boolean
  isMobile: boolean
  onDragStart: (e: React.DragEvent, personId: string) => void
  onDragEnd: (e?: React.DragEvent) => void
  onTouchStart: (e: React.TouchEvent, personId: string) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onPersonInfoClick?: (person: QuizPerson) => void
}

const PersonCard = React.memo<PersonCardProps>(
  ({
    personId,
    person,
    isDragged,
    personStatus,
    showFeedback,
    isMobile,
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onPersonInfoClick,
  }) => {
    if (!person) return null

    return (
      <div
        draggable={!showFeedback && !isMobile}
        data-person-id={personId}
        onDragStart={(e) => onDragStart(e, personId)}
        onDragEnd={(e) => onDragEnd(e)}
        onTouchStart={!showFeedback ? (e) => onTouchStart(e, personId) : undefined}
        onTouchMove={!showFeedback ? onTouchMove : undefined}
        onTouchEnd={!showFeedback ? onTouchEnd : undefined}
        className={`contemporaries-person-card ${isDragged ? 'dragging' : ''} ${
          showFeedback ? (personStatus === 'correct' ? 'correct' : personStatus === 'incorrect' ? 'incorrect' : '') : ''
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

          {person.imageUrl && <img src={person.imageUrl} alt={person.name} className="contemporaries-person-image" />}

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
    )
  }
)

PersonCard.displayName = 'PersonCard'

interface ContemporariesGroupZoneProps {
  group: string[]
  groupIndex: number
  draggedOverGroup: number | null
  showFeedback: boolean
  canRemoveGroup: boolean
  getPersonById: (personId: string) => ContemporariesQuestionData['persons'][0] | undefined
  personStatuses: { [personId: string]: 'correct' | 'incorrect' | 'missing' }
  draggedItem: string | null
  isMobile: boolean
  onDragOverGroup: (e: React.DragEvent) => void
  onDragEnterGroup: (groupIndex: number) => void
  onDragLeaveGroup: (groupIndex: number) => void
  onDrop: (e: React.DragEvent, groupIndex: number) => void
  onDragStart: (e: React.DragEvent, personId: string) => void
  onDragEnd: (e?: React.DragEvent) => void
  onTouchStart: (e: React.TouchEvent, personId: string) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onRemoveGroup: (groupIndex: number) => void
  onPersonInfoClick?: (person: QuizPerson) => void
}

export const ContemporariesGroupZone = React.memo<ContemporariesGroupZoneProps>(
  ({
    group,
    groupIndex,
    draggedOverGroup,
    showFeedback,
    canRemoveGroup,
    getPersonById,
    personStatuses,
    draggedItem,
    isMobile,
    onDragOverGroup,
    onDragEnterGroup,
    onDragLeaveGroup,
    onDrop,
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onRemoveGroup,
    onPersonInfoClick,
  }) => {
    return (
      <div className="contemporaries-group">
        <div
          className={`group-persons ${draggedOverGroup === groupIndex ? 'drag-over' : ''}`}
          data-group-index={groupIndex}
          onDragOver={onDragOverGroup}
          onDragEnter={() => onDragEnterGroup(groupIndex)}
          onDragLeave={() => onDragLeaveGroup(groupIndex)}
          onDrop={(e) => onDrop(e, groupIndex)}
        >
          {group.map((personId) => {
            const person = getPersonById(personId)
            if (!person) return null

            return (
              <PersonCard
                key={personId}
                personId={personId}
                person={person}
                isDragged={draggedItem === personId}
                personStatus={personStatuses[personId] || 'missing'}
                showFeedback={showFeedback}
                isMobile={isMobile}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onPersonInfoClick={onPersonInfoClick}
              />
            )
          })}
          {!showFeedback && canRemoveGroup && <div className="drop-zone-hint">Перетащите сюда</div>}
        </div>
        {!showFeedback && canRemoveGroup && (
          <button className="remove-group-btn" onClick={() => onRemoveGroup(groupIndex)} title="Удалить группу">
            Удалить группу
          </button>
        )}
      </div>
    )
  }
)

ContemporariesGroupZone.displayName = 'ContemporariesGroupZone'

