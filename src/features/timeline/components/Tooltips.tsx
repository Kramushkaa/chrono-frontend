import React from 'react'
import { useMobile } from '../../../shared/hooks/useMobile'
import { Person } from 'shared/types'
import { formatYear } from 'shared/utils/formatters'

interface TooltipsProps {
  hoveredPerson: Person | null
  showTooltip: boolean
  mousePosition: { x: number; y: number }
  hoveredAchievement: { person: Person; year: number; index: number } | null
  showAchievementTooltip: boolean
  getGroupColor: (groupName: string) => string
  getPersonGroup: (person: Person) => string
  getCategoryColor: (category: string) => string
}

export const Tooltips: React.FC<TooltipsProps> = ({
  hoveredPerson,
  showTooltip,
  mousePosition,
  hoveredAchievement,
  showAchievementTooltip,
  getGroupColor,
  getPersonGroup,
  getCategoryColor
}) => {
  const isMobile = useMobile()

  // Функция для рендеринга achievement tooltip
  const renderAchievementTooltip = () => {
    if (!hoveredAchievement || !showAchievementTooltip) return null

    const tooltipStyle = isMobile ? {
      position: 'fixed' as const,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '1rem',
      zIndex: 1002,
      maxWidth: '90vw',
      minWidth: '200px',
      color: '#f4e4c1',
      pointerEvents: 'auto' as const,
      opacity: 0,
      animation: 'tooltipFadeIn 0.2s ease-out forwards',
      backgroundColor: 'rgba(44, 24, 16, 0.98)',
      borderRadius: '12px',
      border: '2px solid rgba(244, 228, 193, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    } : {
      position: 'fixed' as const,
      left: `${mousePosition.x + 15}px`,
      top: `${mousePosition.y - 10}px`,
      padding: '0.75rem',
      zIndex: 1001,
      maxWidth: '250px',
      minWidth: '200px',
      color: '#f4e4c1',
      pointerEvents: 'none' as const,
      opacity: 0,
      transform: 'translateY(10px) scale(0.95)',
      animation: 'tooltipFadeIn 0.2s ease-out forwards',
      backgroundColor: 'rgba(44, 24, 16, 0.95)',
      borderRadius: '6px',
      border: `2px solid ${getGroupColor(getPersonGroup(hoveredAchievement.person))}`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }

    return (
      <div 
        className="achievement-tooltip" 
        id="achievement-tooltip"
        role="tooltip"
        aria-label={`Достижение ${hoveredAchievement.person.name} в ${hoveredAchievement.year} году`}
        style={tooltipStyle}
      >
        <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
          {/* Фотография человека, если есть */}
          {hoveredAchievement.person.imageUrl && (
            <div style={{ 
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              <img 
                src={hoveredAchievement.person.imageUrl} 
                alt={hoveredAchievement.person.name}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${getGroupColor(getPersonGroup(hoveredAchievement.person))}`,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                }}
                onError={(e) => {
                  // Скрываем изображение если оно не загрузилось
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: getGroupColor(getPersonGroup(hoveredAchievement.person)),
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            {hoveredAchievement.person.name}
          </h4>
          
          <p style={{ 
            margin: '0.25rem 0', 
            fontWeight: 'bold',
            color: getGroupColor(getPersonGroup(hoveredAchievement.person)),
            fontSize: '0.9rem'
          }}>
            🎯 {formatYear(hoveredAchievement.year)}
          </p>
          
          <p style={{ 
            margin: '0.25rem 0', 
            fontSize: '0.8rem',
            fontStyle: 'italic'
          }}>
            {hoveredAchievement.person.achievements[hoveredAchievement.index] || 'Ключевое достижение'}
          </p>
          
          {/* Кнопка закрытия для мобильных устройств */}
          {isMobile && (
            <button
              onClick={() => {
                // Закрываем tooltip
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('closeAchievementTooltip'));
                }
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(244, 228, 193, 0.2)',
                border: '1px solid rgba(244, 228, 193, 0.3)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#f4e4c1',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              aria-label="Закрыть"
            >
              ×
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Всплывающее окно с информацией (только для десктопа) */}
      {!isMobile && hoveredPerson && showTooltip && (
        <div 
          className="tooltip" 
          id="person-tooltip"
          role="tooltip"
          aria-label={`Информация о ${hoveredPerson.name}`}
          style={{ 
            position: 'fixed',
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y - 10}px`,
            padding: '1rem',
            zIndex: 1000,
            maxWidth: '300px',
            minWidth: '250px',
            color: '#f4e4c1',
            pointerEvents: 'none',
            opacity: 0,
            transform: 'translateY(10px) scale(0.95)',
            animation: 'tooltipFadeIn 0.2s ease-out forwards'
          }}
        >
          {/* Фотография человека, если есть */}
          {hoveredPerson.imageUrl && (
            <div 
              className="person-image-container"
              style={{ 
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}
            >
              <img 
                src={hoveredPerson.imageUrl} 
                alt={`Портрет ${hoveredPerson.name}`}
                className="person-image"
                id={`person-image-${hoveredPerson.id}`}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${getGroupColor(getPersonGroup(hoveredPerson))}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onError={(e) => {
                  // Скрываем изображение если оно не загрузилось
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 
            className="person-name"
            id={`person-name-${hoveredPerson.id}`}
            style={{ 
              margin: '0 0 0.5rem 0', 
              color: getGroupColor(getPersonGroup(hoveredPerson)),
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {hoveredPerson.name}
          </h3>
          
          <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>
              {formatYear(hoveredPerson.birthYear)} - {formatYear(hoveredPerson.deathYear)}
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <span style={{ color: getCategoryColor(hoveredPerson.category), fontWeight: 'bold' }}>
                {hoveredPerson.category}
              </span> • {hoveredPerson.country}
            </p>
            <p style={{ margin: '0.5rem 0', fontStyle: 'italic', opacity: 0.8 }}>
              {hoveredPerson.description}
            </p>
          </div>
        </div>
      )}

      {/* Всплывающее окно для достижений */}
      {renderAchievementTooltip()}
    </>
  )
} 



