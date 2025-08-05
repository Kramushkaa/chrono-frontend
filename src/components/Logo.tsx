import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '2px',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      color: 'inherit'
    }}>
      <span>Chron</span>
      <img 
        src="/logo.png" 
        alt="Chrono Ninja Icon" 
        style={{ 
          width: '1em', 
          height: '1em',
          verticalAlign: 'middle'
        }} 
      />
      <span> Ninja</span>
    </div>
  )
} 