import React from 'react'

interface ViewportLabel {
  id: string
  year: number
  romanNumeral: string
  left: number
  top: number
  type: 'century' | 'gap'
}

interface ViewportCenturyLabelsOverlayProps {
  labels: ViewportLabel[]
  adjustedTimelineWidth: number
  totalHeight: number
}

export const ViewportCenturyLabelsOverlay: React.FC<ViewportCenturyLabelsOverlayProps> = React.memo(function ViewportCenturyLabelsOverlay({
  labels,
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
        zIndex: 6
      }}
    >
      {labels.map((label) => (
        <div
          key={label.id}
          style={{
            position: 'absolute',
            left: `${label.left}px`,
            top: `${label.top}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: label.type === 'century' ? '1.2rem' : '0.7rem',
            fontWeight: 'bold',
            color:
              label.type === 'century'
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
              <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>{label.romanNumeral}</div>
            </>
          )}
        </div>
      ))}
    </div>
  )
})





