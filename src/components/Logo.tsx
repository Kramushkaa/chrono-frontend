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
      <span>Хр</span>
      <img 
        src="/logo.png" 
        alt="Хроно ниндзя" 
        style={{ 
          width: '1em', 
          height: '1em',
          verticalAlign: 'middle'
        }} 
      />
      <span> ниндзя</span>
    </div>
  )
} 