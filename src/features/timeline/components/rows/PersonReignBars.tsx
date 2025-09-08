import React from 'react'
import { Person } from 'shared/types'

interface PersonReignBarsProps {
  person: Person
  getAdjustedPosition: (year: number) => number
  getAdjustedWidth: (startYear: number, endYear: number) => number
}

export const PersonReignBars: React.FC<PersonReignBarsProps> = ({ person, getAdjustedPosition, getAdjustedWidth }) => {
  const rulerPeriods = Array.isArray((person as any).rulerPeriods) ? (person as any).rulerPeriods : null

  if (rulerPeriods && rulerPeriods.length > 0) {
    return (
      <>
        {rulerPeriods.map((rp: any, idx: number) => (
          <div
            key={`ruler-${person.id}-${idx}`}
            className="reign-bar"
            id={`reign-bar-${person.id}-${idx}`}
            role="presentation"
            aria-label={`Период правления: ${rp.startYear} - ${rp.endYear}${rp.countryName ? `, ${rp.countryName}` : ''}`}
            style={{
              position: 'absolute',
              top: '-15px',
              left: `${getAdjustedPosition(rp.startYear)}px`,
              width: `${getAdjustedWidth(rp.startYear, rp.endYear)}px`,
              height: '65px',
              backgroundColor: 'rgba(211, 47, 47, 0.25)',
              pointerEvents: 'none',
              borderLeft: '2px solid #D32F2F',
              borderRight: '2px solid #D32F2F',
              borderRadius: '3px',
              zIndex: 1
            }}
            title={`👑 ${rp.startYear}–${rp.endYear}${rp.countryName ? ` • ${rp.countryName}` : ''}`}
          />
        ))}
      </>
    )
  }

  if (person.reignStart && person.reignEnd) {
    return (
      <div 
        className="reign-bar"
        id={`reign-bar-${person.id}`}
        role="presentation"
        aria-label={`Период правления: ${person.reignStart} - ${person.reignEnd}`}
        style={{
          position: 'absolute',
          top: '-15px',
          left: `${getAdjustedPosition(person.reignStart)}px`,
          width: `${getAdjustedWidth(person.reignStart, person.reignEnd)}px`,
          height: '65px',
          backgroundColor: 'rgba(211, 47, 47, 0.25)',
          pointerEvents: 'none',
          borderLeft: '2px solid #D32F2F',
          borderRight: '2px solid #D32F2F',
          borderRadius: '3px',
          zIndex: 1
        }} 
      />
    )
  }

  return null
}


