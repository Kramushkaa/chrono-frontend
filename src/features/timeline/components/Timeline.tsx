import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { TimelineBackgroundOverlay } from './overlays/TimelineBackgroundOverlay'
import { ViewportCenturyLabelsOverlay } from './overlays/ViewportCenturyLabelsOverlay'
import { CategoryDividersOverlay } from './overlays/CategoryDividersOverlay'
import { useMobile } from '../../../shared/hooks/useMobile'
import { Person } from 'shared/types'
import { 
  getPosition, 
  getWidth, 
  getCenturyNumber, 
  toRomanNumeral
} from '../utils/timelineUtils'
import { CenturyGridLinesOverlay } from './overlays/CenturyGridLinesOverlay'
import { PersonYearLabels } from './rows/PersonYearLabels'
import { PersonReignBars } from './rows/PersonReignBars'
import { PersonLifeBar } from './rows/PersonLifeBar'
import { PersonAchievementMarkers } from './rows/PersonAchievementMarkers'

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

  // Throttled setters via requestAnimationFrame to reduce re-renders on frequent events
  const mouseRafRef = useRef<number | null>(null)
  const pendingMousePosRef = useRef<{ x: number; y: number } | null>(null)
  const scheduleMousePosition = useCallback((x: number, y: number) => {
    pendingMousePosRef.current = { x, y }
    if (mouseRafRef.current == null) {
      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = null
        const p = pendingMousePosRef.current
        if (p) setMousePosition(p)
      })
    }
  }, [setMousePosition])

  // Removed achievement tooltip rAF scheduler after extraction

  const scrollRafRef = useRef<number | null>(null)
  const lastScrollTopRef = useRef(0)

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
      const st = el.scrollTop
      if (scrollRafRef.current == null) {
        scrollRafRef.current = requestAnimationFrame(() => {
          scrollRafRef.current = null
          setScrollTop(lastScrollTopRef.current)
        })
      }
      lastScrollTopRef.current = st
    }
    measure()
    const onScroll = () => measure()
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
          minHeight: '100%',
          height: 'auto',
          overflow: 'visible',
          padding: isMobile ? '0' : '1rem 0 2rem 0'
        }}
      >
        <TimelineBackgroundOverlay
          elements={timelineElements as any}
          getAdjustedPosition={getAdjustedPosition}
          adjustedTimelineWidth={getAdjustedTimelineWidth()}
          totalHeight={totalHeight}
          minYear={minYear}
          pixelsPerYear={pixelsPerYear}
        />

        <CenturyGridLinesOverlay
          elements={timelineElements as any}
          getAdjustedPosition={getAdjustedPosition}
          adjustedTimelineWidth={getAdjustedTimelineWidth()}
          totalHeight={totalHeight}
        />

        <ViewportCenturyLabelsOverlay
          labels={createViewportCenturyLabels() as any}
          adjustedTimelineWidth={getAdjustedTimelineWidth()}
          totalHeight={totalHeight}
        />

        <CategoryDividersOverlay
          dividers={categoryDividers as any}
          getGroupColor={getGroupColor}
          adjustedTimelineWidth={getAdjustedTimelineWidth()}
          totalHeight={totalHeight}
        />

                 {/* Полоски жизни */}
        <div 
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
                  <PersonYearLabels person={person} getAdjustedPosition={getAdjustedPosition} />

                  {/* полосы правления: множественные сегменты */}
                  <PersonReignBars person={person} getAdjustedPosition={getAdjustedPosition} getAdjustedWidth={getAdjustedWidth} />

                  {/* маркеры достижений */}
                  <PersonAchievementMarkers
                    person={person}
                    isMobile={isMobile}
                    showAchievements={filters.showAchievements}
                    hoveredPerson={hoveredPerson}
                    getAdjustedPosition={getAdjustedPosition}
                    getGroupColor={getGroupColor}
                    getGroupColorDark={getGroupColorDark}
                    getPersonGroup={getPersonGroup}
                    activeAchievementMarker={activeAchievementMarker}
                    setActiveAchievementMarker={setActiveAchievementMarker}
                    hoveredAchievement={hoveredAchievement}
                    setHoveredAchievement={setHoveredAchievement}
                    setAchievementTooltipPosition={setAchievementTooltipPosition}
                    setShowAchievementTooltip={setShowAchievementTooltip}
                    hoverTimerRef={hoverTimerRef}
                    handlePersonHover={handlePersonHover}
                  />

                  <PersonLifeBar
                    person={person}
                    isMobile={isMobile}
                    selectedPerson={selectedPerson}
                    hoveredPerson={hoveredPerson}
                    isDragging={isDragging}
                    isDraggingTimeline={isDraggingTimeline}
                    hoveredAchievement={hoveredAchievement}
                    getAdjustedPosition={getAdjustedPosition}
                    getAdjustedWidth={getAdjustedWidth}
                    getGroupColorMuted={getGroupColorMuted}
                    getPersonGroup={getPersonGroup}
                    handlePersonHover={handlePersonHover}
                    scheduleMousePosition={scheduleMousePosition}
                    setSelectedPerson={setSelectedPerson}
                    setHoveredPerson={setHoveredPerson}
                    setShowTooltip={setShowTooltip}
                    setShowAchievementTooltip={setShowAchievementTooltip}
                    setHoveredAchievement={setHoveredAchievement}
                    setActiveAchievementMarker={setActiveAchievementMarker}
                  />
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
