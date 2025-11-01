import React from 'react'

interface AchievementMarkerProps {
  isActive: boolean
}

export const AchievementMarker: React.FC<AchievementMarkerProps> = ({ isActive }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      opacity: isActive ? 1 : 0.5,
      transition: 'opacity 0.2s ease'
    }}>
      {/* Квадрат с годом */}
      <div style={{
        width: '20px',
        height: '16px',
        background: isActive ? '#f4e4c1' : 'rgba(244, 228, 193, 0.3)',
        border: '1px solid rgba(139, 69, 19, 0.5)',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '7px',
        color: isActive ? '#2c1810' : 'rgba(44, 24, 16, 0.5)',
        fontWeight: 'bold',
        lineHeight: 1
      }}>
        1825
      </div>
      {/* Палочка */}
      <div style={{
        width: '2px',
        height: '8px',
        background: isActive ? '#f4e4c1' : 'rgba(244, 228, 193, 0.3)',
        borderRadius: '1px'
      }} />
    </div>
  )
} 


