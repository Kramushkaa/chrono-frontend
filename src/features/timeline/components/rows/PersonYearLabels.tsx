import React from 'react'
import { Person } from 'shared/types'

interface PersonYearLabelsProps {
  person: Person
  getAdjustedPosition: (year: number) => number
}

export const PersonYearLabels: React.FC<PersonYearLabelsProps> = ({ person, getAdjustedPosition }) => {
  return (
    <>
      <span 
        className="birth-year-label"
        id={`birth-year-${person.id}`}
        aria-label={`Год рождения: ${person.birthYear}`}
        style={{
          position: 'absolute',
          left: `${getAdjustedPosition(person.birthYear)}px`,
          top: 0,
          fontSize: '11px',
          color: 'rgba(244, 228, 193, 0.6)',
          fontStyle: 'italic',
          fontWeight: 400,
          transform: 'translateX(-100%) translateY(-10px)'
        }}
      >
        {person.birthYear}
      </span>

      {person.reignStart && (
        <span 
          className="reign-label" 
          id={`reign-start-${person.id}`}
          aria-label={`Начало правления: ${person.reignStart}`}
          style={{
            position: 'absolute',
            left: `${getAdjustedPosition(person.reignStart)}px`,
            top: 0,
            fontSize: '11px',
            color: '#E57373',
            fontStyle: 'italic',
            fontWeight: 'bold',
            transform: 'translateX(-100%) translateY(-22px)'
          }}
        >
          👑 {person.reignStart}
        </span>
      )}

      {person.reignEnd && (
        <span 
          className="reign-label" 
          id={`reign-end-${person.id}`}
          aria-label={`Конец правления: ${person.reignEnd}`}
          style={{
            position: 'absolute',
            left: `${getAdjustedPosition(person.reignEnd)}px`,
            top: 0,
            fontSize: '11px',
            color: '#E57373',
            fontStyle: 'italic',
            fontWeight: 'bold',
            transform: 'translateY(-22px)'
          }}
        >
          {person.reignEnd}
        </span>
      )}

      <span 
        className="death-year-label"
        id={`death-year-${person.id}`}
        aria-label={`Год смерти: ${person.deathYear}`}
        style={{
          position: 'absolute',
          left: `${getAdjustedPosition(person.deathYear ?? new Date().getFullYear())}px`,
          top: 0,
          fontSize: '11px',
          color: 'rgba(244, 228, 193, 0.6)',
          fontStyle: 'italic',
          fontWeight: 400,
          transform: 'translateY(-10px)'
        }}
      >
        {person.deathYear}
      </span>
    </>
  )
}


