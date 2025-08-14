import React, { useEffect, useMemo, useState } from 'react'
import { useMobile } from 'hooks/useMobile'
import { Person } from 'shared/types'
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
  handlePersonHover: (person: Person | null, x: number, y: number) => void
  activeAchievementMarker: { personId: string; index: number } | null
  setActiveAchievementMarker: (marker: { personId: string; index: number } | null) => void
  hoveredAchievement: { person: Person; year: number; index: number } | null
  setHoveredAchievement: (achievement: { person: Person; year: number; index: number } | null) => void
  achievementTooltipPosition: { x: number; y: number }
  setAchievementTooltipPosition: (position: { x: number; y: number }) => void
  showAchievementTooltip: boolean
  setShowAchievementTooltip: (show: boolean) => void
  hoverTimerRef: React.MutableRefObject<NodeJS.Timeout | null>
  sortedData: Person[]
  selectedPerson: Person | null
  setSelectedPerson: (person: Person | null) => void
  timelineRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
  isDraggingTimeline: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: (e: React.MouseEvent) => void
  handleTouchStart: (e: React.TouchEvent) => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchEnd: (e: React.TouchEvent) => void
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
  handlePersonHover,
  activeAchievementMarker,
  setActiveAchievementMarker,
  hoveredAchievement,
  setHoveredAchievement,
  achievementTooltipPosition,
  setAchievementTooltipPosition,
  showAchievementTooltip,
  setShowAchievementTooltip,
  hoverTimerRef,
  sortedData,
  selectedPerson,
  setSelectedPerson,
  timelineRef,
  isDragging,
  isDraggingTimeline,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
}) => {
  const isMobile = useMobile()
  // --- Basic row virtualization state ---
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Compute per-row heights and prefix offsets once per data change
  const ROW_HEIGHT = 60
  const ROW_MARGIN = 10
  const EMPTY_ROW_HEIGHT = 20
  const rowHeights = useMemo(() => rowPlacement.map(row => (row.length === 0 ? EMPTY_ROW_HEIGHT : ROW_HEIGHT + ROW_MARGIN)), [rowPlacement])
  const rowOffsets = useMemo(() => {
    const offsets: number[] = new Array(rowHeights.length)
    let acc = 0
    for (let i = 0; i < rowHeights.length; i++) {
      offsets[i] = acc
      acc += rowHeights[i]
    }
    return offsets
  }, [rowHeights])

  // Track scroll/viewport on the scrolling element (timelineRef)
  useEffect(() => {
    const el = timelineRef.current
    if (!el) return
    const measure = () => {
      setViewportHeight(el.clientHeight)
      setScrollTop(el.scrollTop)
    }
    measure()
    const onScroll = () => setScrollTop(el.scrollTop)
    window.addEventListener('resize', measure)
    el.addEventListener('scroll', onScroll, { passive: true } as any)
    return () => {
      window.removeEventListener('resize', measure)
      el.removeEventListener('scroll', onScroll as any)
    }
  }, [timelineRef])

  // Compute visible window with small buffer
  const VIRTUAL_BUFFER_PX = 600
  const [startIndex, endIndex] = useMemo(() => {
    if (rowOffsets.length === 0) return [0, 0]
    const startPx = Math.max(0, scrollTop - VIRTUAL_BUFFER_PX)
    const endPx = scrollTop + (viewportHeight || 0) + VIRTUAL_BUFFER_PX
    // find first index with offset >= startPx
    let s = 0
    while (s < rowOffsets.length - 1 && rowOffsets[s + 1] <= startPx) s++
    let e = s
    while (e < rowOffsets.length && rowOffsets[e] < endPx) e++
    return [s, Math.min(e + 1, rowOffsets.length)]
  }, [rowOffsets, scrollTop, viewportHeight])

  const topSpacer = useMemo(() => (startIndex < rowOffsets.length ? rowOffsets[startIndex] : 0), [startIndex, rowOffsets])
  const visibleRows = useMemo(() => rowPlacement.slice(startIndex, endIndex), [rowPlacement, startIndex, endIndex])
  const visibleHeight = useMemo(() => {
    let h = 0
    for (let i = startIndex; i < endIndex; i++) h += rowHeights[i] || 0
    return h
  }, [rowHeights, startIndex, endIndex])
  const bottomSpacer = Math.max(0, (totalHeight + 0) - (topSpacer + visibleHeight))
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

  // Создаём небольшое число меток веков в пределах текущего вьюпорта
  const createViewportCenturyLabels = () => {
    const labels: Array<{
      id: string;
      year: number;
      romanNumeral: string;
      left: number;
      top: number;
      type: 'century' | 'gap';
    }> = [];

    const topUpper = (scrollTop || 0) + (viewportHeight || 0) * 0.1
    const topLower = (scrollTop || 0) + (viewportHeight || 0) * 0.9

    // Метки только по одному экземпляру на экран
    timelineElements.forEach((element) => {
      if (element.type === 'century') {
        const year = element.year;
        const centerYear = year + 50;
        const centuryNumber = getCenturyNumber(centerYear);
        const isNegativeCentury = year < 0;
        const romanNumeral = isNegativeCentury ? `${toRomanNumeral(Math.abs(centuryNumber))} в. до н.э` : `${toRomanNumeral(centuryNumber)} в.`;
        const startPos = getAdjustedPosition(year);
        const nextYear = year + 100;
        const endPos = getAdjustedPosition(nextYear);
        const centerPos = startPos + (endPos - startPos) / 2; // Центр века
        labels.push({ id: `century-label-${year}-top`, year, romanNumeral, left: centerPos, top: topUpper, type: 'century' })
        labels.push({ id: `century-label-${year}-bottom`, year, romanNumeral, left: centerPos, top: topLower, type: 'century' })
      } else if (element.type === 'gap') {
        const startPos = getAdjustedPosition(element.startYear);
        const gapWidth = pixelsPerYear * 10; // 10 лет = 1/10 века
        const centerPos = startPos + gapWidth / 2; // Центр промежутка
        const hiddenCenturiesText = element.hiddenCenturies?.map(year => {
          const centuryNumber = getCenturyNumber(year + 50);
          const isNegativeCentury = year < 0;
          const romanNumeral = isNegativeCentury ? `${toRomanNumeral(Math.abs(centuryNumber))} в. до н.э` : `${toRomanNumeral(centuryNumber)} в.`;
          return romanNumeral;
        }).join(', ') || '';
        labels.push({ id: `gap-label-${element.startYear}-top`, year: element.startYear, romanNumeral: hiddenCenturiesText, left: centerPos, top: topUpper, type: 'gap' })
        labels.push({ id: `gap-label-${element.startYear}-bottom`, year: element.startYear, romanNumeral: hiddenCenturiesText, left: centerPos, top: topLower, type: 'gap' })
      }
    });
    
    return labels;
  };

  return (
    <>
      {/* Временная линия на весь экран */}
      <div 
        className="timeline-content" 
        id="timeline-content"
        role="presentation" 
        aria-hidden="true"
        style={{ 
          position: 'relative', 
          height: '100%',
          overflow: 'visible',
          padding: isMobile ? '0' : '1rem 0 2rem 0'
        }}
      >
        {/* Разноцветная заливка веков */}
        <div 
          className="timeline-background"
          id="timeline-background"
          role="presentation"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${getAdjustedTimelineWidth()}px`,
            height: `${totalHeight + 200}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
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
                <div 
                  key={`century-bg-${year}`} 
                  className="century-background"
                  id={`century-${year}`}
                  role="presentation"
                  aria-label={`Век ${romanNumeral}`}
                  style={{
                    position: 'absolute',
                    left: `${startPos}px`,
                    width: `${width}px`,
                    height: '100%',
                    background: getCenturyColor(year, minYear),
                    opacity: 0.3,
                    zIndex: 1
                  }}
                >
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

         {/* Метки веков в пределах текущего вьюпорта */}
         <div style={{
           position: 'absolute',
           top: '0',
           left: '0',
           width: `${getAdjustedTimelineWidth()}px`,
           height: `${totalHeight + 200}px`,
           pointerEvents: 'none',
           zIndex: 6
         }}>
           {createViewportCenturyLabels().map((label) => (
             <div
               key={label.id}
               style={{
                 position: 'absolute',
                 left: `${label.left}px`,
                 top: `${label.top}px`,
                 transform: 'translate(-50%, -50%)',
                  fontSize: label.type === 'century' ? '1.2rem' : '0.7rem',
                 fontWeight: 'bold',
                  color: label.type === 'century' 
                    ? 'rgba(244, 228, 193, 0.28)'
                    : 'rgba(139, 69, 19, 0.35)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                 pointerEvents: 'none',
                 fontFamily: label.type === 'century' ? 'serif' : 'sans-serif',
                 textAlign: 'center',
                 maxWidth: '200px',
                 wordWrap: 'break-word'
               }}
             >
               {label.type === 'century' ? (
                 label.romanNumeral
               ) : (
                 <>
                   <div>Скрыто:</div>
                   <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                     {label.romanNumeral}
                   </div>
                 </>
               )}
             </div>
           ))}
         </div>

         {/* Разделители групп */}
         <div 
           className="category-dividers"
           id="category-dividers"
           role="presentation"
           aria-hidden="true"
           style={{
             position: 'absolute',
             top: '0',
             left: '0',
             width: `${getAdjustedTimelineWidth()}px`,
             height: `${totalHeight + 200}px`,
             pointerEvents: 'none',
             zIndex: 8
           }}
         >
          {categoryDividers.map((divider) => (
            <div 
              key={`category-divider-${divider.category}`} 
              className="category-divider"
              id={`divider-${divider.category}`}
              role="separator"
              aria-label={`Разделитель группы: ${divider.category}`}
              style={{
                position: 'absolute',
                top: `${divider.top}px`,
                left: '0',
                width: '100%',
                height: '10px',
                background: `linear-gradient(to right, transparent 0%, ${getGroupColor(divider.category)} 20%, ${getGroupColor(divider.category)} 80%, transparent 100%)`,
                opacity: 0.6,
                zIndex: 8
              }}
            >
              <div 
                className="category-label" 
                id={`category-label-${divider.category}`}
                aria-label={`Группа: ${divider.category}`}
                style={{
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
                }}
              >
                {divider.category}
              </div>
            </div>
          ))}
        </div>

                 {/* Полоски жизни */}
         <div 
           ref={timelineRef}
           className="person-timeline"
           id="person-timeline"
           role="list"
           aria-label="Временные линии исторических личностей"
           style={{ 
             position: 'relative',
             width: `${getAdjustedTimelineWidth()}px`,
             height: `${totalHeight + 60}px`,
             zIndex: 10
           }}
           onScroll={(e) => setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
           onMouseDown={!isMobile ? handleMouseDown : undefined}
           onMouseMove={!isMobile ? handleMouseMove : undefined}
           onMouseUp={!isMobile ? handleMouseUp : undefined}
           onMouseLeave={!isMobile ? handleMouseUp : undefined}
           onTouchStart={!isMobile ? handleTouchStart : undefined}
           onTouchMove={!isMobile ? handleTouchMove : undefined}
           onTouchEnd={!isMobile ? handleTouchEnd : undefined}
         >
          {/* Top spacer to keep scroll position */}
          {topSpacer > 0 && (
            <div style={{ height: `${topSpacer}px` }} aria-hidden="true" />
          )}
          {visibleRows.map((row, i) => {
            const rowIndex = startIndex + i
            return (
            <div 
              key={rowIndex} 
              className="timeline-row"
              id={`timeline-row-${rowIndex}`}
              role="listitem"
              aria-label={`Строка ${rowIndex + 1} временной линии`}
              style={{
                position: 'relative',
                height: row.length === 0 ? '20px' : '60px',
                marginBottom: row.length === 0 ? '0px' : '10px'
              }}
            >
              {row.map((person) => (
                <React.Fragment key={person.id}>
                  {/* Годы жизни и правления над полоской */}
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
                         color: '#E57373', // Темно-красный
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
                         color: '#E57373', // Темно-красный
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
                                         left: `${getAdjustedPosition(person.deathYear)}px`,
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

                  {/* Маркеры ключевых достижений */}
                  {filters.showAchievements && (
                    (Array.isArray((person as any).achievementYears) && (person as any).achievementYears.length > 0
                      ? (person as any).achievementYears
                      : [])
                    .filter((year: number | null | undefined) => year !== undefined && year !== null)
                    .map((year: number, index: number) => {
                      return (
                        <div 
                          key={index} 
                          className="achievement-marker"
                          id={`achievement-${person.id}-${index}`}
                          role="button"
                          aria-label={`Достижение ${index + 1} в ${year} году`}
                          tabIndex={0}
                          style={{
                            position: 'absolute',
                            left: `${getAdjustedPosition(year as number)}px`,
                            top: '-4px',
                            width: '2px', // Возвращаем стандартную ширину
                            height: '15px', // Возвращаем стандартную высоту
                            backgroundColor: getGroupColorDark(getPersonGroup(person)),
                            zIndex: activeAchievementMarker?.personId === person.id && activeAchievementMarker?.index === index ? 10 : 3,
                            transform: 'translateX(-50%)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            // Убираем псевдоэлементы, так как они не работают в inline стилях
                          }}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.backgroundColor = getGroupColor(getPersonGroup(person));
                            e.currentTarget.style.boxShadow = `0 0 3px ${getGroupColor(getPersonGroup(person))}`;
                            
                            // Устанавливаем активный маркер
                            setActiveAchievementMarker({ personId: person.id, index });
                            
                            // Скрываем tooltip человека при наведении на маркер достижения
                            if (hoveredPerson?.id === person.id) {
                              handlePersonHover(null, 0, 0);
                            }
                            
                            // Очищаем предыдущий таймер если он есть
                            if (hoverTimerRef.current) {
                              clearTimeout(hoverTimerRef.current);
                            }
                            
                            // Запускаем таймер для показа tooltip
                            hoverTimerRef.current = setTimeout(() => {
                              setAchievementTooltipPosition({ x: e.clientX, y: e.clientY });
                              setHoveredAchievement({ person, year: year as number, index });
                              setShowAchievementTooltip(true);
                            }, 500);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.backgroundColor = getGroupColorDark(getPersonGroup(person));
                            e.currentTarget.style.boxShadow = 'none';
                            
                            // Сбрасываем активный маркер
                            setActiveAchievementMarker(null);
                            
                            // Очищаем таймер и скрываем tooltip достижения
                            if (hoverTimerRef.current) {
                              clearTimeout(hoverTimerRef.current);
                              hoverTimerRef.current = null;
                            }
                            setShowAchievementTooltip(false);
                            setHoveredAchievement(null);
                            
                            // Также скрываем tooltip человека, если он был показан
                            if (hoveredPerson?.id === person.id) {
                              handlePersonHover(null, 0, 0);
                            }
                          }
                        }}
                        onMouseMove={(e) => {
                          if (!isMobile && hoveredAchievement && hoveredAchievement.person.id === person.id && hoveredAchievement.index === index) {
                            setAchievementTooltipPosition({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        onTouchStart={(e) => {
                          if (isMobile) {
                            e.preventDefault();
                            e.currentTarget.style.backgroundColor = getGroupColor(getPersonGroup(person));
                            e.currentTarget.style.boxShadow = `0 0 3px ${getGroupColor(getPersonGroup(person))}`;
                            
                            // Устанавливаем активный маркер
                            setActiveAchievementMarker({ personId: person.id, index });
                            
                            // Скрываем tooltip человека при касании маркера достижения
                            if (hoveredPerson?.id === person.id) {
                              handlePersonHover(null, 0, 0);
                            }
                            
                            // Показываем tooltip сразу на мобильных
                            const touch = e.touches[0];
                            setAchievementTooltipPosition({ x: touch.clientX, y: touch.clientY });
                            setHoveredAchievement({ person, year: year as number, index });
                            setShowAchievementTooltip(true);
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (isMobile) {
                            // Убираем визуальные эффекты при отпускании, но НЕ скрываем tooltip
                            e.currentTarget.style.backgroundColor = getGroupColorDark(getPersonGroup(person));
                            e.currentTarget.style.boxShadow = 'none';
                            
                            // Сбрасываем активный маркер
                            setActiveAchievementMarker(null);
                            
                            // НЕ скрываем tooltip достижения - он будет скрыт только по клику вне или по кнопке закрытия
                            // Но скрываем tooltip человека, если он был показан
                            if (hoveredPerson?.id === person.id) {
                              handlePersonHover(null, 0, 0);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Показываем tooltip при нажатии Enter или Space
                            setHoveredAchievement({ person, year: year as number, index });
                            // Используем позицию элемента для tooltip при нажатии клавиши
                            const rect = e.currentTarget.getBoundingClientRect();
                            setAchievementTooltipPosition({ 
                              x: rect.left + rect.width / 2, 
                              y: rect.top - 10 
                            });
                            setShowAchievementTooltip(true);
                          }
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
                    })
                  )}

                  {/* полосы правления: множественные сегменты */}
                  {Array.isArray((person as any).rulerPeriods) && (person as any).rulerPeriods.length > 0
                    ? (person as any).rulerPeriods.map((rp: any, idx: number) => (
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
                      ))
                    : (person.reignStart && person.reignEnd && (
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
                      ))}

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
                        
                        // Скрываем tooltip достижения при наведении на lifebar
                        if (hoveredAchievement?.person.id === person.id) {
                          setShowAchievementTooltip(false);
                          setHoveredAchievement(null);
                          setActiveAchievementMarker(null);
                        }
                        
                        // Используем handlePersonHover для правильной обработки
                        handlePersonHover(person, e.clientX, e.clientY)
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.transform = selectedPerson?.id === person.id ? 'scale(1.05)' : 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        // Используем handlePersonHover для правильной обработки с задержкой
                        handlePersonHover(null, 0, 0)
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!isMobile && hoveredPerson?.id === person.id) {
                        setMousePosition({ x: e.clientX, y: e.clientY })
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (isMobile) {
                          setSelectedPerson(person);
                        } else {
                          setHoveredPerson(person);
                          setShowTooltip(true);
                        }
                      }
                    }}
                    onTouchStart={(e) => {
                      if (isMobile) {
                        // Скрываем tooltip достижения при касании lifebar
                        if (hoveredAchievement?.person.id === person.id) {
                          setShowAchievementTooltip(false);
                          setHoveredAchievement(null);
                          setActiveAchievementMarker(null);
                        }
                      }
                    }}
                    onClick={() => {
                      // Открываем нижнюю панель и на десктопе, и на мобильных
                      // но игнорируем клик после жеста перетаскивания таймлайна
                      if (!isDragging && !isDraggingTimeline) {
                        setSelectedPerson(person)
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                      <span>{person.name}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            )
          })}
          {/* Bottom spacer */}
          {bottomSpacer > 0 && (
            <div style={{ height: `${bottomSpacer}px` }} aria-hidden="true" />
          )}
        </div>
      </div>
    </>
  )
} 