import React from 'react'
import { getCenturyColor, getCenturyNumber, toRomanNumeral } from '../../utils/timelineUtils'

type TimelineElement =
  | { type: 'century'; year: number }
  | { type: 'gap'; startYear: number; endYear?: number; hiddenCenturies?: number[] }

interface TimelineBackgroundOverlayProps {
  elements: TimelineElement[]
  getAdjustedPosition: (year: number) => number
  adjustedTimelineWidth: number
  totalHeight: number
  minYear: number
  pixelsPerYear: number
}

export const TimelineBackgroundOverlay: React.FC<TimelineBackgroundOverlayProps> = React.memo(function TimelineBackgroundOverlay({
  elements,
  getAdjustedPosition,
  adjustedTimelineWidth,
  totalHeight,
  minYear,
  pixelsPerYear
}) {
  return (
    <div
      className="timeline-background"
      id="timeline-background"
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: `${adjustedTimelineWidth}px`,
        height: `${totalHeight + 200}px`,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {elements.map((element) => {
        if (element.type === 'century') {
          const year = element.year
          const nextYear = year + 100
          const startPos = getAdjustedPosition(year)
          const endPos = getAdjustedPosition(nextYear)
          const width = endPos - startPos

          const centerYear = year + 50
          const centuryNumber = getCenturyNumber(centerYear)
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
            />
          )
        }

        // gap: компактный сегмент (1/10 века)
        const gapWidth = pixelsPerYear * 10
        const startPos = getAdjustedPosition(element.startYear)
        return (
          <div
            key={`gap-${element.startYear}`}
            style={{
              position: 'absolute',
              left: `${startPos}px`,
              width: `${gapWidth}px`,
              height: '100%',
              background: 'rgba(139, 69, 19, 0.1)',
              border: '1px dashed rgba(139, 69, 19, 0.3)',
              zIndex: 1
            }}
          />
        )
      })}
    </div>
  )
})





