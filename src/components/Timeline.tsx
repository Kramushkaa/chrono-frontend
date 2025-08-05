import React from 'react'
import { Person } from '../types'
import { 
  getPosition, 
  getWidth, 
  getCenturyColor, 
  getCenturyNumber, 
  toRomanNumeral
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
    hideEmptyCenturies: boolean
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
  sortedData: any[]
}

// Типы для элементов временной линии
type TimelineElement = 
  | { type: 'century'; year: number }
  | { type: 'gap'; startYear: number; endYear: number; hiddenCenturies: number[] }

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
  hoverTimerRef,
  sortedData
}) => {
  // Функция для определения пустых веков на основе отфильтрованных данных
  const getEmptyCenturies = () => {
    if (!sortedData || sortedData.length === 0) return new Set();
    
    // Используем отфильтрованные данные для определения диапазона
    const minYear = Math.min(...sortedData.map(p => p.birthYear));
    const maxYear = Math.max(...sortedData.map(p => p.deathYear));
    
    const startCentury = Math.floor(minYear / 100) * 100;
    const endCentury = Math.ceil(maxYear / 100) * 100;
    
    const emptyCenturies = new Set<number>();
    
    for (let centuryStart = startCentury; centuryStart <= endCentury; centuryStart += 100) {
      const centuryEnd = centuryStart + 99;
      const hasDataInCentury = sortedData.some(person => 
        (person.birthYear <= centuryEnd && person.deathYear >= centuryStart)
      );
      
      if (!hasDataInCentury) {
        emptyCenturies.add(centuryStart);
      }
    }
    
    return emptyCenturies;
  };

  // Создаем массив для отображения веков с промежутками
  const getTimelineElements = (): TimelineElement[] => {
    if (!filters.hideEmptyCenturies) {
      return centuryBoundaries.map(year => ({ type: 'century', year }));
    }

    const emptyCenturies = getEmptyCenturies();
    const visibleCenturies = centuryBoundaries.filter(year => !emptyCenturies.has(year));
    
    const elements: TimelineElement[] = [];
    
    for (let i = 0; i < visibleCenturies.length; i++) {
      const currentYear = visibleCenturies[i];
      
      // Добавляем промежуток перед веком (кроме первого)
      if (i > 0) {
        const prevYear = visibleCenturies[i - 1];
        const gapStart = prevYear + 100;
        const gapEnd = currentYear;
        
        // Находим все скрытые века в промежутке
        const hiddenCenturies: number[] = [];
        for (let year = gapStart; year < gapEnd; year += 100) {
          if (emptyCenturies.has(year)) {
            hiddenCenturies.push(year);
          }
        }
        
        if (hiddenCenturies.length > 0) {
          elements.push({
            type: 'gap',
            startYear: gapStart,
            endYear: gapEnd,
            hiddenCenturies
          });
        }
      }
      
      // Добавляем сам век
      elements.push({ type: 'century', year: currentYear });
    }
    
    return elements;
  };

  const timelineElements = getTimelineElements();

  // Функция для вычисления позиции с учетом промежутков
  const getAdjustedPosition = (year: number) => {
    if (!filters.hideEmptyCenturies) {
      return getPosition(year, minYear, pixelsPerYear, LEFT_PADDING_PX);
    }

    // Находим позицию года в оригинальной шкале
    const originalPosition = getPosition(year, minYear, pixelsPerYear, LEFT_PADDING_PX);
    
    // Вычисляем смещение, проходя по всем промежуткам до этого года
    let totalOffset = 0;
    
    for (const element of timelineElements) {
      if (element.type === 'gap') {
        const gapStart = getPosition(element.startYear, minYear, pixelsPerYear, LEFT_PADDING_PX);
        const gapEnd = getPosition(element.endYear, minYear, pixelsPerYear, LEFT_PADDING_PX);
        const originalGapWidth = gapEnd - gapStart;
        const newGapWidth = pixelsPerYear * 10; // 10 лет
        
        // Если год находится после этого промежутка, добавляем смещение
        if (year >= element.endYear) {
          totalOffset += (originalGapWidth - newGapWidth);
        }
      }
    }
    
    return originalPosition - totalOffset;
  };

  // Функция для вычисления ширины с учетом промежутков
  const getAdjustedWidth = (startYear: number, endYear: number) => {
    if (!filters.hideEmptyCenturies) {
      return getWidth(startYear, endYear, pixelsPerYear);
    }

    const startPos = getAdjustedPosition(startYear);
    const endPos = getAdjustedPosition(endYear);
    return endPos - startPos;
  };

  // Функция для вычисления скорректированной ширины таймлайна
  const getAdjustedTimelineWidth = () => {
    if (!filters.hideEmptyCenturies) {
      return timelineWidth;
    }

    // Вычисляем общую ширину, проходя по всем элементам
    let totalWidth = 0;
    
    for (const element of timelineElements) {
      if (element.type === 'century') {
        // Век занимает 100 лет
        totalWidth += pixelsPerYear * 100;
      } else if (element.type === 'gap') {
        // Промежуток занимает 10 лет
        totalWidth += pixelsPerYear * 10;
      }
    }

    return totalWidth + LEFT_PADDING_PX + 50; // Добавляем отступы
  };

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
           width: `${getAdjustedTimelineWidth()}px`,
           height: `${totalHeight + 200}px`,
           pointerEvents: 'none',
           zIndex: 1
         }}>
          {timelineElements.map((element, index) => {
                         if (element.type === 'century') {
               const year = element.year;
               // Каждый век занимает ровно 100 лет
               const nextYear = year + 100
               const startPos = getAdjustedPosition(year)
               const endPos = getAdjustedPosition(nextYear)
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
                                                   } else if (element.type === 'gap') {
                // Промежуток между веками - компактный размер (1/10 века)
                const gapWidth = pixelsPerYear * 10; // 10 лет = 1/10 века
                const startPos = getAdjustedPosition(element.startYear)
               
               return (
                 <div key={`gap-${element.startYear}`} style={{
                   position: 'absolute',
                   left: `${startPos}px`,
                   width: `${gapWidth}px`,
                   height: '100%',
                   background: 'rgba(139, 69, 19, 0.1)',
                   border: '1px dashed rgba(139, 69, 19, 0.3)',
                   zIndex: 1
                 }}>
                  {/* Информация о скрытых веках */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.8rem',
                    color: 'rgba(139, 69, 19, 0.7)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 2,
                    fontWeight: 'bold'
                  }}>
                                         <div>Скрыто:</div>
                     <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                       {element.hiddenCenturies?.map(year => {
                         const centuryNumber = getCenturyNumber(year + 50);
                         const isNegativeCentury = year < 0;
                         const romanNumeral = isNegativeCentury ? `-${toRomanNumeral(Math.abs(centuryNumber))}` : toRomanNumeral(centuryNumber);
                         return romanNumeral;
                       }).join(', ') || ''}
                     </div>
                  </div>
                </div>
              )
            }
            return null;
          })}
        </div>

                 {/* Границы веков и промежутков на всю высоту */}
         <div style={{
           position: 'absolute',
           top: '0',
           left: '0',
           width: `${getAdjustedTimelineWidth()}px`,
           height: `${totalHeight + 200}px`,
           pointerEvents: 'none',
           zIndex: 5
         }}>
                      {timelineElements.map((element) => {
              if (element.type === 'century') {
                return (
                  <div key={`century-line-${element.year}`} style={{
                    position: 'absolute',
                    left: `${getAdjustedPosition(element.year)}px`,
                    width: '2px',
                    height: '100%',
                    background: 'linear-gradient(to bottom, #cd853f 0%, #cd853f 20%, rgba(205, 133, 63, 0.3) 100%)',
                    zIndex: 5
                  }} />
                );
              } else if (element.type === 'gap') {
                return (
                  <div key={`gap-line-${element.startYear}`} style={{
                    position: 'absolute',
                    left: `${getAdjustedPosition(element.startYear)}px`,
                    width: '2px',
                    height: '100%',
                    background: 'linear-gradient(to bottom, #cd853f 0%, #cd853f 20%, rgba(205, 133, 63, 0.3) 100%)',
                    zIndex: 5
                  }} />
                );
              }
              return null;
            })}
         </div>

                 {/* Разделители групп */}
         <div style={{
           position: 'absolute',
           top: '0',
           left: '0',
           width: `${getAdjustedTimelineWidth()}px`,
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
           width: `${getAdjustedTimelineWidth()}px`,
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
                     left: `${getAdjustedPosition(person.birthYear)}px`,
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
                       left: `${getAdjustedPosition(person.reignStart)}px`,
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
                       left: `${getAdjustedPosition(person.reignEnd)}px`,
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
                     left: `${getAdjustedPosition(person.deathYear)}px`,
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
                           left: `${getAdjustedPosition(year as number)}px`,
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
                       left: `${getAdjustedPosition(person.reignStart)}px`,
                       width: `${getAdjustedWidth(person.reignStart, person.reignEnd)}px`,
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
                       left: `${getAdjustedPosition(person.birthYear)}px`,
                       width: `${getAdjustedWidth(person.birthYear, person.deathYear)}px`,
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