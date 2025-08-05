import React from 'react'
import { Person } from '../types'

interface MobilePersonPanelProps {
  selectedPerson: Person | null
  onClose: () => void
  getGroupColor: (groupName: string) => string
  getPersonGroup: (person: Person) => string
  getCategoryColor: (category: string) => string
}

export const MobilePersonPanel: React.FC<MobilePersonPanelProps> = ({
  selectedPerson,
  onClose,
  getGroupColor,
  getPersonGroup,
  getCategoryColor
}) => {
  if (!selectedPerson) return null

  return (
    <div 
      className="mobile-person-panel"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50vh',
        backgroundColor: 'rgba(44, 24, 16, 0.98)',
        borderTop: '2px solid rgba(139, 69, 19, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease-out',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Заголовок с кнопкой закрытия */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid rgba(139, 69, 19, 0.3)',
        background: `linear-gradient(135deg, ${getGroupColor(getPersonGroup(selectedPerson))}20 0%, rgba(139, 69, 19, 0.1) 100%)`
      }}>
        <h2 style={{
          margin: 0,
          color: '#f4e4c1',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          {selectedPerson.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(231, 76, 60, 0.2)',
            border: '1px solid rgba(231, 76, 60, 0.4)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#e74c3c',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Закрыть"
        >
          ✕
        </button>
      </div>

      {/* Основной контент */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Фотография и основная информация */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          {selectedPerson.imageUrl && (
            <div style={{
              flexShrink: 0,
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `3px solid ${getGroupColor(getPersonGroup(selectedPerson))}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <img
                src={selectedPerson.imageUrl}
                alt={selectedPerson.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: getGroupColor(getPersonGroup(selectedPerson)),
              marginBottom: '0.5rem'
            }}>
              {selectedPerson.birthYear} - {selectedPerson.deathYear}
            </div>
            
            <div style={{
              fontSize: '0.9rem',
              color: '#f4e4c1',
              marginBottom: '0.5rem'
            }}>
              <span style={{ 
                color: getCategoryColor(selectedPerson.category), 
                fontWeight: 'bold' 
              }}>
                {selectedPerson.category}
              </span>
              {' • '}
              <span>{selectedPerson.country}</span>
            </div>

            {/* Информация о правлении */}
            {selectedPerson.reignStart && selectedPerson.reignEnd && (
              <div style={{
                fontSize: '0.9rem',
                color: '#E57373',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                👑 Правление: {selectedPerson.reignStart} - {selectedPerson.reignEnd}
              </div>
            )}
          </div>
        </div>

        {/* Описание */}
        <div style={{
          fontSize: '0.9rem',
          lineHeight: '1.5',
          color: '#f4e4c1',
          fontStyle: 'italic',
          padding: '0.5rem',
          background: 'rgba(139, 69, 19, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(139, 69, 19, 0.2)'
        }}>
          {selectedPerson.description}
        </div>

        {/* Достижения */}
        {selectedPerson.achievements && selectedPerson.achievements.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '1rem',
              color: getGroupColor(getPersonGroup(selectedPerson)),
              margin: '0 0 0.5rem 0',
              fontWeight: 'bold'
            }}>
              🎯 Ключевые достижения:
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {selectedPerson.achievements.map((achievement, index) => {
                const achievementYear = [
                  selectedPerson.achievementYear1,
                  selectedPerson.achievementYear2,
                  selectedPerson.achievementYear3
                ][index]
                
                return (
                  <div key={index} style={{
                    padding: '0.5rem',
                    background: 'rgba(139, 69, 19, 0.1)',
                    borderRadius: '4px',
                    border: `1px solid ${getGroupColor(getPersonGroup(selectedPerson))}40`
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: getGroupColor(getPersonGroup(selectedPerson)),
                      fontWeight: 'bold',
                      marginBottom: '0.25rem'
                    }}>
                      {achievementYear} г.
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#f4e4c1'
                    }}>
                      {achievement}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 