import React from 'react'
import { Person } from '../types'

type PersonCardProps = {
  person: Person
  getGroupColor: (groupName: string) => string
  getPersonGroup: (person: Person) => string
  getCategoryColor: (category: string) => string
  onAddAchievement?: (person: Person) => void
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, getGroupColor, getPersonGroup, getCategoryColor, onAddAchievement }) => {
  const safeText = (v?: string | null) => {
    const s = (v ?? '').toString()
    return s
  }
  return (
    <div
      role="region"
      aria-label={`Информация о ${person.name}`}
      style={{
        backgroundColor: 'rgba(44, 24, 16, 0.9)',
        border: '1px solid rgba(139, 69, 19, 0.4)',
        borderRadius: 8,
        padding: '16px',
        color: '#f4e4c1',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        background: `linear-gradient(135deg, ${getGroupColor(getPersonGroup(person))}20 0%, rgba(139, 69, 19, 0.1) 100%)`,
        padding: '8px 12px', borderRadius: 6 }}>
        <h2 style={{ margin: 0 }}>{safeText(person.name)}</h2>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
        {person.imageUrl && (
          <img
            src={person.imageUrl}
            alt={`Портрет ${person.name}`}
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${getGroupColor(getPersonGroup(person))}` }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', color: getGroupColor(getPersonGroup(person)), marginBottom: 6 }}>
            {person.birthYear} - {person.deathYear}
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: getCategoryColor(person.category), fontWeight: 'bold' }}>{safeText(person.category)}</span>
            {' • '}
            <span>{safeText(person.country)}</span>
          </div>
          {Array.isArray((person as any).rulerPeriods) && (person as any).rulerPeriods.length > 0 ? (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: '0.95rem', color: '#E57373', fontWeight: 'bold' }}>👑 Периоды правления:</div>
              <ul style={{ margin: '4px 0 0 18px' }}>
                {(person as any).rulerPeriods.map((rp: any, idx: number) => (
                  <li key={idx}>{rp.startYear} — {rp.endYear}{rp.countryName ? ` • ${rp.countryName}` : ''}</li>
                ))}
              </ul>
            </div>
          ) : (person.reignStart && person.reignEnd && (
            <div style={{ marginBottom: 6, color: '#E57373', fontWeight: 'bold' }}>👑 Правление: {person.reignStart} - {person.reignEnd}</div>
          ))}
        </div>
      </div>

      {person.wikiLink && (
        <div style={{ marginBottom: 8 }}>
          <a href={person.wikiLink} target="_blank" rel="noopener noreferrer" style={{ color: '#8ab4f8', textDecoration: 'underline' }}>
            Открыть в Википедии ↗
          </a>
        </div>
      )}

      <div style={{
        fontSize: '0.95rem', lineHeight: 1.6, color: '#f4e4c1', fontStyle: 'italic', padding: 8,
        background: 'rgba(139, 69, 19, 0.1)', borderRadius: 6, border: '1px solid rgba(139, 69, 19, 0.2)'
      }}>
        {safeText(person.description as any)}
      </div>

      <div style={{ marginTop: 12 }}>
        {person.achievements && person.achievements.length > 0 && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: getGroupColor(getPersonGroup(person)) }}>🎯 Ключевые достижения:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {person.achievements.map((achievement, index) => {
                const allYears = (person as any).achievementYears
                const year = Array.isArray(allYears) && allYears.length > 0
                  ? allYears[index]
                  : undefined
                const wiki = person.achievementsWiki?.[index] ?? null
                return (
                  <div key={index} style={{ padding: 8, background: 'rgba(139, 69, 19, 0.1)', borderRadius: 4, border: `1px solid ${getGroupColor(getPersonGroup(person))}40` }}>
                    {year != null && (
                      <div style={{ fontSize: '0.85rem', color: getGroupColor(getPersonGroup(person)), fontWeight: 'bold', marginBottom: 4 }}>{year} г.</div>
                    )}
                    <div style={{ fontSize: '0.9rem' }}>
                      {achievement}
                      {wiki && (
                        <>
                          {' '}<a href={wiki} target="_blank" rel="noopener noreferrer" style={{ color: '#8ab4f8', textDecoration: 'underline' }} aria-label={`Открыть в Википедии: ${achievement}`}>↗</a>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {onAddAchievement && (
          <div>
            <button onClick={() => onAddAchievement(person)}>Добавить достижение</button>
          </div>
        )}
      </div>
    </div>
  )
}


