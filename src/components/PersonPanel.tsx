import React, { useEffect, useState } from 'react'
import { Person } from '../types'
import { apiFetch } from '../services/api'

interface PersonPanelProps {
  selectedPerson: Person | null
  onClose: () => void
  getGroupColor: (groupName: string) => string
  getPersonGroup: (person: Person) => string
  getCategoryColor: (category: string) => string
}

export const PersonPanel: React.FC<PersonPanelProps> = ({
  selectedPerson,
  onClose,
  getGroupColor,
  getPersonGroup,
  getCategoryColor
}) => {
  const [achievementsWikiFallback, setAchievementsWikiFallback] = useState<(string | null)[] | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadAchievementsWiki() {
      if (!selectedPerson) {
        if (isMounted) setAchievementsWikiFallback(null)
        return
      }
      if (selectedPerson.achievementsWiki && selectedPerson.achievementsWiki.length > 0) {
        if (isMounted) setAchievementsWikiFallback(null)
        return
      }
      try {
        const res = await apiFetch(`/api/persons/${selectedPerson.id}/achievements`)
        const data = await res.json().catch(() => null)
        const items: Array<{ year: number; wikipedia_url?: string | null }> = data?.data || []
        const top3 = items
          .slice()
          .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
          .slice(0, 3)
          .map(a => (a.wikipedia_url && a.wikipedia_url.trim().length > 0 ? a.wikipedia_url : null))
        if (isMounted) setAchievementsWikiFallback(top3)
      } catch {
        if (isMounted) setAchievementsWikiFallback(null)
      }
    }
    loadAchievementsWiki()
    return () => { isMounted = false }
  }, [selectedPerson])

  if (!selectedPerson) return null

  return (
    <div 
      className="mobile-person-panel"
      id="mobile-person-panel"
      role="dialog"
      aria-label={`Информация о ${selectedPerson.name}`}
      aria-modal="true"
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
      <div 
        className="mobile-panel-header"
        id="mobile-panel-header"
        role="banner"
        aria-label="Заголовок панели"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid rgba(139, 69, 19, 0.3)',
          background: `linear-gradient(135deg, ${getGroupColor(getPersonGroup(selectedPerson))}20 0%, rgba(139, 69, 19, 0.1) 100%)`
        }}
      >
        <h2 
          className="mobile-panel-title"
          id="mobile-panel-title"
          style={{
            margin: 0,
            color: '#f4e4c1',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          {selectedPerson.name}
        </h2>
        <button
          className="mobile-panel-close-btn"
          id="mobile-panel-close"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            }
          }}
          aria-label="Закрыть панель"
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

      <div 
        className="mobile-panel-content"
        id="mobile-panel-content"
        role="main"
        aria-label="Основная информация"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div 
          className="mobile-panel-person-info"
          id="mobile-panel-person-info"
          role="region"
          aria-label="Информация о личности"
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          {selectedPerson.imageUrl && (
            <div 
              className="mobile-panel-person-image"
              id="mobile-panel-person-image"
              aria-label={`Портрет ${selectedPerson.name}`}
              style={{
                flexShrink: 0,
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${getGroupColor(getPersonGroup(selectedPerson))}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              <img
                src={selectedPerson.imageUrl}
                alt={`Портрет ${selectedPerson.name}`}
                className="mobile-panel-person-photo"
                id="mobile-panel-person-photo"
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
          
          <div 
            className="mobile-panel-person-details"
            id="mobile-panel-person-details"
            role="region"
            aria-label="Детали личности"
            style={{ flex: 1 }}
          >
            <div 
              className="mobile-panel-person-years"
              id="mobile-panel-person-years"
              aria-label={`Годы жизни: ${selectedPerson.birthYear} - ${selectedPerson.deathYear}`}
              style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: getGroupColor(getPersonGroup(selectedPerson)),
                marginBottom: '0.5rem'
              }}
            >
              {selectedPerson.birthYear} - {selectedPerson.deathYear}
            </div>
            
            <div 
              className="mobile-panel-person-category"
              id="mobile-panel-person-category"
              aria-label={`Категория: ${selectedPerson.category}, Страна: ${selectedPerson.country}`}
              style={{
                fontSize: '0.9rem',
                color: '#f4e4c1',
                marginBottom: '0.5rem'
              }}
            >
              <span 
                className="mobile-panel-person-category-name"
                id="mobile-panel-person-category-name"
                style={{ 
                  color: getCategoryColor(selectedPerson.category), 
                  fontWeight: 'bold' 
                }}
              >
                {selectedPerson.category}
              </span>
              {' • '}
              <span 
                className="mobile-panel-person-country"
                id="mobile-panel-person-country"
              >
                {selectedPerson.country}
              </span>
            </div>

            {Array.isArray((selectedPerson as any).rulerPeriods) && (selectedPerson as any).rulerPeriods.length > 0 ? (
              <div
                className="mobile-panel-person-reign"
                id="mobile-panel-person-reign"
                style={{ marginBottom: '0.5rem' }}
              >
                <div style={{ fontSize: '0.95rem', color: '#E57373', fontWeight: 'bold' }}>👑 Периоды правления:</div>
                <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0, listStyle: 'disc', color: '#f4e4c1', fontSize: '0.9rem' }}>
                  {(selectedPerson as any).rulerPeriods.map((rp: any, idx: number) => (
                    <li key={idx}>
                      {rp.startYear} — {rp.endYear}{rp.countryName ? ` • ${rp.countryName}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              selectedPerson.reignStart && selectedPerson.reignEnd && (
                <div 
                  className="mobile-panel-person-reign"
                  id="mobile-panel-person-reign"
                  aria-label={`Период правления: ${selectedPerson.reignStart} - ${selectedPerson.reignEnd}`}
                  style={{
                    fontSize: '0.9rem',
                    color: '#E57373',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}
                >
                  👑 Правление: {selectedPerson.reignStart} - {selectedPerson.reignEnd}
                </div>
              )
            )}
          </div>
        </div>

        {selectedPerson.wikiLink && (
          <div style={{ padding: '0 0.5rem' }}>
            <a
              href={selectedPerson.wikiLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#8ab4f8', textDecoration: 'underline' }}
              aria-label={`Открыть статью в Википедии: ${selectedPerson.name}`}
            >
              Открыть в Википедии ↗
            </a>
          </div>
        )}

        <div 
          className="mobile-panel-person-description"
          id="mobile-panel-person-description"
          role="region"
          aria-label="Описание личности"
          style={{
            fontSize: '0.9rem',
            lineHeight: '1.5',
            color: '#f4e4c1',
            fontStyle: 'italic',
            padding: '0.5rem',
            background: 'rgba(139, 69, 19, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(139, 69, 19, 0.2)'
          }}
        >
          {selectedPerson.description}
        </div>

        {selectedPerson.achievements && selectedPerson.achievements.length > 0 && (
          <div 
            className="mobile-panel-achievements"
            id="mobile-panel-achievements"
            role="region"
            aria-label="Ключевые достижения"
          >
            <h3 
              className="mobile-panel-achievements-title"
              id="mobile-panel-achievements-title"
              style={{
                fontSize: '1rem',
                color: getGroupColor(getPersonGroup(selectedPerson)),
                margin: '0 0 0.5rem 0',
                fontWeight: 'bold'
              }}
            >
              🎯 Ключевые достижения:
            </h3>
            <div 
              className="mobile-panel-achievements-list"
              id="mobile-panel-achievements-list"
              role="list"
              aria-label="Список достижений"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              {selectedPerson.achievements.map((achievement, index) => {
                const achievementYear = [
                  selectedPerson.achievementYear1,
                  selectedPerson.achievementYear2,
                  selectedPerson.achievementYear3
                ][index]
                const wiki = (selectedPerson.achievementsWiki?.[index] ?? achievementsWikiFallback?.[index]) || null
                
                return (
                  <div 
                    key={index}
                    className="mobile-panel-achievement-item"
                    id={`mobile-panel-achievement-${index}`}
                    role="listitem"
                    aria-label={`Достижение ${index + 1}: ${achievementYear} год`}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(139, 69, 19, 0.1)',
                      borderRadius: '4px',
                      border: `1px solid ${getGroupColor(getPersonGroup(selectedPerson))}40`
                    }}
                  >
                    <div 
                      className="mobile-panel-achievement-year"
                      id={`mobile-panel-achievement-year-${index}`}
                      aria-label={`Год: ${achievementYear}`}
                      style={{
                        fontSize: '0.8rem',
                        color: getGroupColor(getPersonGroup(selectedPerson)),
                        fontWeight: 'bold',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {achievementYear} г.
                    </div>
                    <div 
                      className="mobile-panel-achievement-text"
                      id={`mobile-panel-achievement-text-${index}`}
                      aria-label={`Достижение: ${achievement}`}
                      style={{
                        fontSize: '0.85rem',
                        color: '#f4e4c1'
                      }}
                    >
                      {achievement}
                      {wiki && (
                        <>
                          {' '}
                          <a
                            href={wiki}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#8ab4f8', textDecoration: 'underline' }}
                            aria-label={`Открыть в Википедии: ${achievement}`}
                          >
                            ↗
                          </a>
                        </>
                      )}
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


