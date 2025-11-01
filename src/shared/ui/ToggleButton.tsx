import React from 'react'

interface ToggleButtonProps {
  /** Активна ли кнопка */
  isActive: boolean
  /** Обработчик клика */
  onClick: () => void
  /** Иконка или элемент внутри кнопки */
  children: React.ReactNode
  /** Подсказка */
  title: string
  /** Aria-label для accessibility */
  ariaLabel: string
  /** Ширина кнопки */
  width?: number | string
  /** Высота кнопки */
  height?: number | string
  /** ID элемента */
  id?: string
  /** Описательный текст для screen readers */
  ariaDescribedBy?: string
}

/**
 * Переиспользуемый компонент кнопки-переключателя
 * Поддерживает клавиатурную навигацию и accessibility
 */
export function ToggleButton({
  isActive,
  onClick,
  children,
  title,
  ariaLabel,
  width = '32px',
  height = '32px',
  id,
  ariaDescribedBy,
}: ToggleButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      id={id}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isActive}
      aria-describedby={ariaDescribedBy}
      tabIndex={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        borderRadius: '6px',
        background: isActive
          ? '#cd853f'
          : isHovered
            ? 'rgba(205, 133, 63, 0.4)'
            : 'rgba(244, 228, 193, 0.2)',
        border: `1px solid ${isActive ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        opacity: isActive ? 1 : isHovered ? 0.8 : 0.6,
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      {children}
    </div>
  )
}




