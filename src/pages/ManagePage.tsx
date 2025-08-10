import React, { useMemo, useState } from 'react'
import { Person } from '../types'
import { useTimelineData } from '../hooks/useTimelineData'
import { useFilters } from '../hooks/useFilters'
import { getGroupColor, getPersonGroup } from '../utils/groupingUtils'
import { useAchievements } from '../hooks/useAchievements'
import { PersonCard } from '../components/PersonCard'

type Tab = 'persons' | 'achievements'

export default function ManagePage() {
  const { filters } = useFilters()
  const [activeTab, setActiveTab] = useState<Tab>('persons')
  const { persons, isLoading } = useTimelineData(filters, true)
  const [searchPersons, setSearchPersons] = useState('')
  const [searchAch, setSearchAch] = useState('')
  const { items: achItems, isLoading: achLoading, hasMore, loadMore } = useAchievements(searchAch, activeTab === 'achievements')
  const [selected, setSelected] = useState<Person | null>(null)

  const personsSorted = useMemo(() => {
    const list = [...persons].sort((a, b) => a.name.localeCompare(b.name))
    if (!searchPersons.trim()) return list
    const q = searchPersons.trim().toLowerCase()
    return list.filter(p => `${p.name} ${p.country} ${p.category}`.toLowerCase().includes(q))
  }, [persons, searchPersons])
  const [page, setPage] = useState(0)
  const pageSize = 30
  const pagedPersons = useMemo(() => personsSorted.slice(page * pageSize, page * pageSize + pageSize), [personsSorted, page])
  const canPrev = page > 0
  const canNext = (page + 1) * pageSize < personsSorted.length

  return (
    <div className="app" id="chrononinja-manage" role="main" aria-label="Управление контентом">
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }} role="tablist" aria-label="Вкладки управления">
          <button role="tab" aria-selected={activeTab === 'persons'} onClick={() => setActiveTab('persons')} style={{ padding: '6px 12px' }}>Личности</button>
          <button role="tab" aria-selected={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} style={{ padding: '6px 12px' }}>Достижения</button>
        </div>

        {activeTab === 'persons' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div role="region" aria-label="Список персон" style={{ borderRight: '1px solid rgba(139,69,19,0.3)', paddingRight: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <input value={searchPersons} onChange={(e) => setSearchPersons(e.target.value)} placeholder="Поиск по ФИО/стране/категории" style={{ width: '100%', padding: 6 }} />
              </div>
              {isLoading && <div>Загрузка...</div>}
              {!isLoading && pagedPersons.map(p => (
                <div key={p.id} onClick={() => setSelected(p)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(p) }}
                  style={{ padding: '8px 6px', cursor: 'pointer', borderRadius: 6,
                    background: selected?.id === p.id ? 'rgba(139, 69, 19, 0.2)' : 'transparent' }}>
                  <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{p.country} • <span style={{ color: getGroupColor(getPersonGroup(p, 'category')) }}>{p.category}</span></div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={!canPrev} style={{ padding: '6px 10px' }}>Назад</button>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Стр. {page + 1} / {Math.max(1, Math.ceil(personsSorted.length / pageSize))}</div>
                <button onClick={() => setPage(p => canNext ? p + 1 : p)} disabled={!canNext} style={{ padding: '6px 10px' }}>Вперёд</button>
              </div>
            </div>
            <div role="region" aria-label="Карточка персоны">
              {selected ? (
                <PersonCard person={selected} getGroupColor={getGroupColor} getPersonGroup={(person) => getPersonGroup(person, 'category')} getCategoryColor={getGroupColor} />
              ) : (
                <div style={{ opacity: 0.8 }}>Выберите персону слева</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div role="region" aria-label="Фильтр достижений" style={{ borderRight: '1px solid rgba(139,69,19,0.3)', paddingRight: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <input value={searchAch} onChange={(e) => setSearchAch(e.target.value)} placeholder="Поиск по достижениям/имени/стране" style={{ width: '100%', padding: 6 }} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Найдено: {achItems.length}{!achLoading && hasMore ? '+' : ''}</div>
            </div>
            <div role="region" aria-label="Достижения" style={{ paddingRight: 8 }}>
              {achLoading && achItems.length === 0 && <div>Загрузка...</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {achItems.map((a) => {
                  const title = a.person_country || a.person_name || ''
                  return (
                    <div key={a.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{title || '—'}</div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{a.year}</div>
                      <div style={{ fontSize: 14 }}>{a.description}</div>
                    </div>
                  )
                })}
              </div>
              {!achLoading && hasMore && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={loadMore} style={{ padding: '6px 12px' }}>Показать ещё</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


