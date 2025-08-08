import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div
      aria-label="Хронониндзя"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        color: 'inherit'
      }}
    >
      {/* "Хрон" + картинка вместо второй буквы "о" + "ниндзя" => "Хронониндзя" */}
      <span>Хрон</span>
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        style={{
          width: '1em',
          height: '1em',
          verticalAlign: 'middle'
        }}
      />
      <span>ниндзя</span>
    </div>
  )
}