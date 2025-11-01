import React from 'react'
import { Person } from 'shared/types'

interface PersonLifeBarProps {
  person: Person
  isMobile: boolean
  selectedPerson: Person | null
  hoveredPerson: Person | null
  isDragging: boolean
  isDraggingTimeline: boolean
  hoveredAchievement: { person: Person; year: number; index: number } | null
  getAdjustedPosition: (year: number) => number
  getAdjustedWidth: (startYear: number, endYear: number) => number
  getGroupColorMuted: (groupName: string) => string
  getPersonGroup: (person: Person) => string

  // interactions
  handlePersonHover: (person: Person | null, x: number, y: number) => void
  scheduleMousePosition: (x: number, y: number) => void
  setSelectedPerson: (person: Person | null) => void
  setHoveredPerson: (person: Person | null) => void
  setShowTooltip: (show: boolean) => void
  setShowAchievementTooltip: (show: boolean) => void
  setHoveredAchievement: (achievement: { person: Person; year: number; index: number } | null) => void
  setActiveAchievementMarker: (marker: { personId: string; index: number } | null) => void
}

export const PersonLifeBar: React.FC<PersonLifeBarProps> = ({
  person,
  isMobile,
  selectedPerson,
  hoveredPerson,
  isDragging,
  isDraggingTimeline,
  hoveredAchievement,
  getAdjustedPosition,
  getAdjustedWidth,
  getGroupColorMuted,
  getPersonGroup,
  handlePersonHover,
  scheduleMousePosition,
  setSelectedPerson,
  setHoveredPerson,
  setShowTooltip,
  setShowAchievementTooltip,
  setHoveredAchievement,
  setActiveAchievementMarker
}) => {
  return (
    <div
      className="life-bar"
      id={`life-bar-${person.id}`}
      role="button"
      aria-label={`${person.name}, ${person.birthYear} - ${person.deathYear}, ${person.category}`}
      tabIndex={0}
      style={{
        position: 'absolute',
        top: '10px',
        left: `${getAdjustedPosition(person.birthYear)}px`,
        width: `${getAdjustedWidth(person.birthYear, person.deathYear ?? new Date().getFullYear())}px`,
        height: '40px',
        background: `linear-gradient(135deg, ${getGroupColorMuted(getPersonGroup(person))} 0%, #6a5a3a 100%)`,
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        minWidth: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: '1.5px solid #a8926a',
        opacity: selectedPerson?.id === person.id ? 0.8 : 1,
        zIndex: 5,
        transform: selectedPerson?.id === person.id ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'

          if (hoveredAchievement?.person.id === person.id) {
            setShowAchievementTooltip(false)
            setHoveredAchievement(null)
            setActiveAchievementMarker(null)
          }

          handlePersonHover(person, e.clientX, e.clientY)
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = selectedPerson?.id === person.id ? 'scale(1.05)' : 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          handlePersonHover(null, 0, 0)
        }
      }}
      onMouseMove={(e) => {
        if (!isMobile && hoveredPerson?.id === person.id) {
          scheduleMousePosition(e.clientX, e.clientY)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (isMobile) {
            setSelectedPerson(person)
          } else {
            setHoveredPerson(person)
            setShowTooltip(true)
          }
        }
      }}
      onTouchStart={(e) => {
        if (isMobile) {
          if (hoveredAchievement?.person.id === person.id) {
            setShowAchievementTooltip(false)
            setHoveredAchievement(null)
            setActiveAchievementMarker(null)
          }
        }
      }}
      onClick={() => {
        if (!isDragging && !isDraggingTimeline) {
          setSelectedPerson(person)
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
        <span>{person.name}</span>
      </div>
    </div>
  )
}





