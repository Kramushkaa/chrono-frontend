import React from 'react'
import { Person } from '../types'
import { 
  getPosition, 
  getWidth, 
  getCenturyColor, 
  getCenturyNumber, 
  toRomanNumeral,
  getFirstCountry
} from '../utils/timelineUtils'

interface TimelineProps {
  isLoading: boolean
  timelineWidth: number
  totalHeight: number
  centuryBoundaries: number[]
  minYear: number
  pixelsPerYear: number
  LEFT_PADDING_PX: number
  rowPlacement: Person[][]
  filters: {
    showAchievements: boolean
  }
  groupingType: 'category' | 'country' | 'none'
  categoryDividers: { category: string; top: number }[]
  getGroupColor: (groupName: string) => string
  getGroupColorDark: (groupName: string) => string
  getGroupColorMuted: (groupName: string) => string
  getPersonGroup: (person: Person) => string
  hoveredPerson: Person | null
  setHoveredPerson: (person: Person | null) => void
  mousePosition: { x: number; y: number }
  setMousePosition: (position: { x: number; y: number }) => void
  showTooltip: boolean
  setShowTooltip: (show: boolean) => void
  activeAchievementMarker: { personId: string; index: number } | null
  setActiveAchievementMarker: (marker: { personId: string; index: number } | null) => void
  hoveredAchievement: { person: Person; year: number; index: number } | null
  setHoveredAchievement: (achievement: { person: Person; year: number; index: number } | null) => void
  achievementTooltipPosition: { x: number; y: number }
  setAchievementTooltipPosition: (position: { x: number; y: number }) => void
  showAchievementTooltip: boolean
  setShowAchievementTooltip: (show: boolean) => void
  hoverTimerRef: React.MutableRefObject<NodeJS.Timeout | null>
}

export const Timeline: React.FC<TimelineProps> = ({
  isLoading,
  timelineWidth,
  totalHeight,
  centuryBoundaries,
  minYear,
  pixelsPerYear,
  LEFT_PADDING_PX,
  rowPlacement,
  filters,
  groupingType,
  categoryDividers,
  getGroupColor,
  getGroupColorDark,
  getGroupColorMuted,
  getPersonGroup,
  hoveredPerson,
  setHoveredPerson,
  mousePosition,
  setMousePosition,
  showTooltip,
  setShowTooltip,
  activeAchievementMarker,
  setActiveAchievementMarker,
  hoveredAchievement,
  setHoveredAchievement,
  achievementTooltipPosition,
  setAchievementTooltipPosition,
  showAchievementTooltip,
  setShowAchievementTooltip,
  hoverTimerRef
}) => {
  return (
    <main className="app-main">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Загрузка данных...</span>
        </div>
      )}
      
      {/* Временная линия на весь экран */}
      <div className="timeline-container" style={{ 
        position: 'relative', 
        height: 'calc(100vh - 100px)',
        overflow: 'auto',
        padding: '1rem 0 2rem 0'
      }}>
        {/* Разноцветная заливка веков */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: `${timelineWidth}px`,
          height: `${totalHeight + 200}px`,
          pointerEvents: 'none',
          zIndex: 1
        }}>
          {centuryBoundaries.map((year, index) => {
            const nextYear = centuryBoundaries[index + 1] || (year + 100)
            const startPos = getPosition(year, minYear, pixelsPerYear, LEFT_PADDING_PX)
            const endPos = getPosition(nextYear, minYear, pixelsPerYear, LEFT_PADDING_PX)
            const width = endPos - startPos

            // Вычисляем век на основе центра года в столетии
            const centerYear = year + 50
            const centuryNumber = getCenturyNumber(centerYear)
            // Для отрицательных веков добавляем знак минус
            const isNegativeCentury = year < 0
            const romanNumeral = isNegativeCentury ? `-${toRomanNumeral(Math.abs(centuryNumber))}` : toRomanNumeral(centuryNumber)
            
            return (
              <div key={`century-bg-${year}`} style={{
                position: 'absolute',
                left: `${startPos}px`,
                width: `${width}px`,
                height: '100%',
                background: getCenturyColor(year, minYear),
                opacity: 0.3,
                zIndex: 1
              }}>
                {/* Римская цифра века в центре */}
                <div className="century-label" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'rgba(244, 228, 193, 0.6)',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 2,
                  fontFamily: 'serif'
                }}>
                  {romanNumeral}
                </div>
              </div>
            )
          })}
        </div>

        {/* Границы веков на всю высоту */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: `${timelineWidth}px`,
          height: `${totalHeight + 200}px`,
          pointerEvents: 'none',
          zIndex: 5
        }}>
          {centuryBoundaries.map((year) => (
            <div key={`century-line-${year}`} style={{
              position: 'absolute',
              left: `${getPosition(year, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
              width: '2px',
              height: '100%',
              background: 'linear-gradient(to bottom, #cd853f 0%, #cd853f 20%, rgba(205, 133, 63, 0.3) 100%)',
              zIndex: 5
            }} />
          ))}
        </div>

        {/* Разделители групп */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: `${timelineWidth}px`,
          height: `${totalHeight + 200}px`,
          pointerEvents: 'none',
          zIndex: 8
        }}>
          {categoryDividers.map((divider) => (
            <div key={`category-divider-${divider.category}`} style={{
              position: 'absolute',
              top: `${divider.top}px`,
              left: '0',
              width: '100%',
              height: '10px',
              background: `linear-gradient(to right, transparent 0%, ${getGroupColor(divider.category)} 20%, ${getGroupColor(divider.category)} 80%, transparent 100%)`,
              opacity: 0.6,
              zIndex: 8
            }}>
              <div className="category-label" style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: getGroupColor(divider.category),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                zIndex: 9
              }}>
                {divider.category}
              </div>
            </div>
          ))}
        </div>

        {/* Полоски жизни */}
        <div style={{ 
          position: 'relative',
          width: `${timelineWidth}px`,
          height: `${totalHeight + 60}px`,
          zIndex: 10
        }}>
          {rowPlacement.map((row, rowIndex) => (
            <div key={rowIndex} style={{
              position: 'relative',
              height: row.length === 0 ? '20px' : '60px',
              marginBottom: row.length === 0 ? '0px' : '10px'
            }}>
              {row.map((person) => (
                <React.Fragment key={person.id}>
                  {/* Годы жизни и правления над полоской */}
                  <span style={{
                    position: 'absolute',
                    left: `${getPosition(person.birthYear, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
                    top: 0,
                    fontSize: '11px',
                    color: 'rgba(244, 228, 193, 0.6)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    transform: 'translateX(-100%) translateY(-10px)'
                  }}>{person.birthYear}</span>

                  {person.reignStart && (
                    <span className="reign-label" style={{
                      position: 'absolute',
                      left: `${getPosition(person.reignStart, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
                      top: 0,
                      fontSize: '11px',
                      color: '#E57373', // Темно-красный
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      transform: 'translateX(-100%) translateY(-22px)'
                    }}>👑 {person.reignStart}</span>
                  )}

                  {person.reignEnd && (
                    <span className="reign-label" style={{
                      position: 'absolute',
                      left: `${getPosition(person.reignEnd, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
                      top: 0,
                      fontSize: '11px',
                      color: '#E57373', // Темно-красный
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      transform: 'translateY(-22px)'
                    }}>{person.reignEnd}</span>
                  )}
                  
                  <span style={{
                    position: 'absolute',
                    left: `${getPosition(person.deathYear, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
                    top: 0,
                    fontSize: '11px',
                    color: 'rgba(244, 228, 193, 0.6)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    transform: 'translateY(-10px)'
                  }}>{person.deathYear}</span>

                  {/* Маркеры ключевых достижений */}
                  {filters.showAchievements && [person.achievementYear1, person.achievementYear2, person.achievementYear3]
                    .filter(year => year !== undefined && year !== null)
                    .map((year, index) => {
                      return (
                        <div key={index} style={{
                          position: 'absolute',
                          left: `${getPosition(year as number, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
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
                          e.currentTarget.style.backgroundColor = getGroupColor(getPersonGroup(person));
                          e.currentTarget.style.boxShadow = `0 0 3px ${getGroupColor(getPersonGroup(person))}`;
                          
                          // Устанавливаем активный маркер
                          setActiveAchievementMarker({ personId: person.id, index });
                          
                          // Очищаем предыдущий таймер если он есть
                          if (hoverTimerRef.current) {
                            clearTimeout(hoverTimerRef.current);
                          }
                          
                          // Запускаем таймер для показа tooltip
                          hoverTimerRef.current = setTimeout(() => {
                            setHoveredAchievement({ person, year: year as number, index });
                            setAchievementTooltipPosition({ x: e.clientX, y: e.clientY });
                            setShowAchievementTooltip(true);
                          }, 500);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = getGroupColorDark(getPersonGroup(person));
                          e.currentTarget.style.boxShadow = 'none';
                          
                          // Сбрасываем активный маркер
                          setActiveAchievementMarker(null);
                          
                          // Очищаем таймер и скрываем tooltip
                          if (hoverTimerRef.current) {
                            clearTimeout(hoverTimerRef.current);
                            hoverTimerRef.current = null;
                          }
                          setShowAchievementTooltip(false);
                          setHoveredAchievement(null);
                        }}
                        onMouseMove={(e) => {
                          setAchievementTooltipPosition({ x: e.clientX, y: e.clientY });
                        }}
                        >
                          <span style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '8px',
                            color: getGroupColorDark(getPersonGroup(person)),
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            backgroundColor: 'rgba(44, 24, 16, 0.9)',
                            padding: '1px 3px',
                            borderRadius: '2px',
                            border: `1px solid ${getGroupColorDark(getPersonGroup(person))}`,
                            transition: 'all 0.2s ease'
                          }}>
                            {year}
                          </span>
                        </div>
                      );
                    })}

                  {/* полоса правления */}
                  {person.reignStart && person.reignEnd && (
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: `${getPosition(person.reignStart, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
                      width: `${getWidth(person.reignStart, person.reignEnd, pixelsPerYear)}px`,
                      height: '65px',
                      backgroundColor: 'rgba(211, 47, 47, 0.25)',
                      pointerEvents: 'none',
                      borderLeft: '2px solid #D32F2F',
                      borderRight: '2px solid #D32F2F',
                      borderRadius: '3px',
                      zIndex: 1
                    }} />
                  )}

                  <div
                    className="life-bar"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: `${getPosition(person.birthYear, minYear, pixelsPerYear, LEFT_PADDING_PX)}px`,
                      width: `${getWidth(person.birthYear, person.deathYear, pixelsPerYear)}px`,
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
                      opacity: 1,
                      zIndex: 5
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                      setHoveredPerson(person)
                      setMousePosition({ x: e.clientX, y: e.clientY })
                      setTimeout(() => setShowTooltip(true), 300)
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      setHoveredPerson(null)
                      setShowTooltip(false)
                    }}
                    onMouseMove={(e) => {
                      setMousePosition({ x: e.clientX, y: e.clientY })
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                      <span>{person.name}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
} 