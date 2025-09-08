import React, { useCallback, useRef } from 'react'
import { Person } from 'shared/types'

interface PersonAchievementMarkersProps {
  person: Person
  isMobile: boolean
  showAchievements: boolean
  hoveredPerson: Person | null
  getAdjustedPosition: (year: number) => number
  getGroupColor: (groupName: string) => string
  getGroupColorDark: (groupName: string) => string
  getPersonGroup: (person: Person) => string

  activeAchievementMarker: { personId: string; index: number } | null
  setActiveAchievementMarker: (marker: { personId: string; index: number } | null) => void
  hoveredAchievement: { person: Person; year: number; index: number } | null
  setHoveredAchievement: (achievement: { person: Person; year: number; index: number } | null) => void

  setAchievementTooltipPosition: (pos: { x: number; y: number }) => void
  setShowAchievementTooltip: (show: boolean) => void
  hoverTimerRef: React.MutableRefObject<NodeJS.Timeout | null>
  handlePersonHover: (person: Person | null, x: number, y: number) => void
}

export const PersonAchievementMarkers: React.FC<PersonAchievementMarkersProps> = ({
  person,
  isMobile,
  showAchievements,
  hoveredPerson,
  getAdjustedPosition,
  getGroupColor,
  getGroupColorDark,
  getPersonGroup,
  activeAchievementMarker,
  setActiveAchievementMarker,
  hoveredAchievement,
  setHoveredAchievement,
  setAchievementTooltipPosition,
  setShowAchievementTooltip,
  hoverTimerRef,
  handlePersonHover
}) => {
  const rafRef = useRef<number | null>(null)
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null)

  const scheduleTooltipPosition = useCallback((x: number, y: number) => {
    pendingPosRef.current = { x, y }
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const p = pendingPosRef.current
        if (p) setAchievementTooltipPosition(p)
      })
    }
  }, [setAchievementTooltipPosition])

  if (!showAchievements) return null

  const years: number[] = Array.isArray((person as any).achievementYears)
    ? (person as any).achievementYears.filter((y: any) => y !== undefined && y !== null)
    : []

  if (years.length === 0) return null

  return (
    <>
      {years.map((year: number, index: number) => (
        <div
          key={index}
          className="achievement-marker"
          id={`achievement-${person.id}-${index}`}
          role="button"
          aria-label={`Достижение ${index + 1} в ${year} году`}
          tabIndex={0}
          style={{
            position: 'absolute',
            left: `${getAdjustedPosition(year)}px`,
            top: '-4px',
            width: '2px',
            height: '15px',
            backgroundColor: getGroupColorDark(getPersonGroup(person)),
            zIndex: activeAchievementMarker?.personId === person.id && activeAchievementMarker?.index === index ? 10 : 3,
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isMobile) {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = getGroupColor(getPersonGroup(person))
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 3px ${getGroupColor(getPersonGroup(person))}`

              setActiveAchievementMarker({ personId: person.id, index })

              if (hoveredPerson?.id === person.id) {
                handlePersonHover(null, 0, 0)
              }

              if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
              hoverTimerRef.current = setTimeout(() => {
                scheduleTooltipPosition(e.clientX, e.clientY)
                setHoveredAchievement({ person, year, index })
                setShowAchievementTooltip(true)
              }, 500)
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = getGroupColorDark(getPersonGroup(person))
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              setActiveAchievementMarker(null)
              if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current)
                hoverTimerRef.current = null
              }
              setShowAchievementTooltip(false)
              setHoveredAchievement(null)
              if (hoveredPerson?.id === person.id) {
                handlePersonHover(null, 0, 0)
              }
            }
          }}
          onMouseMove={(e) => {
            if (!isMobile && hoveredAchievement && hoveredAchievement.person.id === person.id && hoveredAchievement.index === index) {
              scheduleTooltipPosition(e.clientX, e.clientY)
            }
          }}
          onTouchStart={(e) => {
            if (isMobile) {
              const touch = e.touches[0]
              setAchievementTooltipPosition({ x: touch.clientX, y: touch.clientY })
              setHoveredAchievement({ person, year, index })
              setShowAchievementTooltip(true)
            }
          }}
        />
      ))}
    </>
  )
}


