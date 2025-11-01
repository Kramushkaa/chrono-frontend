import React from 'react'

interface CategoryDivider {
  category: string
  top: number
}

interface CategoryDividersOverlayProps {
  dividers: CategoryDivider[]
  getGroupColor: (category: string) => string
  adjustedTimelineWidth: number
  totalHeight: number
}

export const CategoryDividersOverlay: React.FC<CategoryDividersOverlayProps> = React.memo(function CategoryDividersOverlay({
  dividers,
  getGroupColor,
  adjustedTimelineWidth,
  totalHeight
}) {
  return (
    <div
      className="category-dividers"
      id="category-dividers"
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: `${adjustedTimelineWidth}px`,
        height: `${totalHeight + 200}px`,
        pointerEvents: 'none',
        zIndex: 8
      }}
    >
      {dividers.map((divider) => (
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
  )
})





