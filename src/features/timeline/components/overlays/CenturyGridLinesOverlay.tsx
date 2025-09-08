import React from 'react'

type TimelineElement =
  | { type: 'century'; year: number }
  | { type: 'gap'; startYear: number; endYear?: number; hiddenCenturies?: number[] }

interface CenturyGridLinesOverlayProps {
  elements: TimelineElement[]
  getAdjustedPosition: (year: number) => number
  adjustedTimelineWidth: number
  totalHeight: number
}

export const CenturyGridLinesOverlay: React.FC<CenturyGridLinesOverlayProps> = React.memo(function CenturyGridLinesOverlay({
  elements,
  getAdjustedPosition,
  adjustedTimelineWidth,
  totalHeight
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: `${adjustedTimelineWidth}px`,
        height: `${totalHeight + 200}px`,
        pointerEvents: 'none',
        zIndex: 5
      }}
    >
      {elements.map((element) => {
        const left = getAdjustedPosition(element.type === 'century' ? element.year : element.startYear)
        return (
          <div
            key={`gridline-${element.type === 'century' ? element.year : element.startYear}`}
            style={{
              position: 'absolute',
              left: `${left}px`,
              width: '2px',
              height: '100%',
              background: 'linear-gradient(to bottom, #cd853f 0%, #cd853f 20%, rgba(205, 133, 63, 0.3) 100%)',
              zIndex: 5
            }}
          />
        )
      })}
    </div>
  )
})


