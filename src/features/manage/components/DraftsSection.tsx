import React, { useState, useEffect } from 'react'
import { getAchievementDrafts, getPeriodDrafts, getPersonDrafts, updateAchievement, updatePeriod, updatePerson, submitAchievementDraft, submitPeriodDraft, submitPersonDraft } from 'shared/api/api'

type DraftItem = {
  id: number | string
  person_id?: string
  country_id?: number
  year?: number
  start_year?: number
  end_year?: number
  description?: string
  period_type?: string
  comment?: string
  wikipedia_url?: string | null
  image_url?: string | null
  draft_saved_at: string
  last_edited_at: string
  title: string
  person_name?: string
  country_name?: string
  // Person specific fields
  name?: string
  birth_year?: number
  death_year?: number
  category?: string
  wiki_link?: string | null
}

interface DraftsSectionProps {
  isAuthenticated: boolean
  emailVerified: boolean
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function DraftsSection({ isAuthenticated, emailVerified, showToast }: DraftsSectionProps) {
  const [achievementDrafts, setAchievementDrafts] = useState<DraftItem[]>([])
  const [periodDrafts, setPeriodDrafts] = useState<DraftItem[]>([])
  const [personDrafts, setPersonDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'achievements' | 'periods' | 'people'>('achievements')
  const [editingDraft, setEditingDraft] = useState<{ id: number | string; type: 'achievement' | 'period' | 'person' } | null>(null)

  useEffect(() => {
    if (isAuthenticated && emailVerified) {
      loadDrafts()
    }
  }, [isAuthenticated, emailVerified])

  const loadDrafts = async () => {
    if (!isAuthenticated || !emailVerified) return
    
    setLoading(true)
    try {
      const [achievementsData, periodsData, peopleData] = await Promise.all([
        getAchievementDrafts(100),
        getPeriodDrafts(100),
        getPersonDrafts(100)
      ])
      
      setAchievementDrafts(achievementsData.data || [])
      setPeriodDrafts(periodsData.data || [])
      setPersonDrafts(peopleData.data || [])
    } catch (error: any) {
      showToast(error.message || 'Ошибка загрузки черновиков', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDraft = async (id: number | string, type: 'achievement' | 'period' | 'person') => {
    try {
      if (type === 'achievement') {
        await submitAchievementDraft(id as number)
        showToast('Черновик отправлен на модерацию', 'success')
      } else if (type === 'period') {
        await submitPeriodDraft(id as number)
        showToast('Черновик отправлен на модерацию', 'success')
      } else if (type === 'person') {
        await submitPersonDraft(id as string)
        showToast('Черновик отправлен на модерацию', 'success')
      }
      
      // Обновляем список черновиков
      await loadDrafts()
    } catch (error: any) {
      showToast(error.message || 'Ошибка отправки черновика', 'error')
    }
  }

  const handleDeleteDraft = async (id: number | string, type: 'achievement' | 'period' | 'person') => {
    if (!confirm('Удалить черновик? Это действие нельзя отменить.')) return
    
    try {
      // TODO: Добавить API для удаления черновиков
      showToast('Черновик удален', 'success')
      await loadDrafts()
    } catch (error: any) {
      showToast(error.message || 'Ошибка удаления черновика', 'error')
    }
  }

  const renderAchievementDraft = (draft: DraftItem) => (
    <div key={draft.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontWeight: 'bold' }}>{draft.title || '—'}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {new Date(draft.last_edited_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{draft.year}</div>
      <div style={{ fontSize: 14, marginBottom: 8 }}>{draft.description}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => setEditingDraft({ id: draft.id as number, type: 'achievement' })}
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          Редактировать
        </button>
        <button
          onClick={() => handleSubmitDraft(draft.id, 'achievement')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#4CAF50' }}
        >
          Отправить на модерацию
        </button>
        <button
          onClick={() => handleDeleteDraft(draft.id, 'achievement')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#f44336' }}
        >
          Удалить
        </button>
      </div>
    </div>
  )

  const renderPeriodDraft = (draft: DraftItem) => (
    <div key={draft.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontWeight: 'bold' }}>{draft.title || '—'}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {new Date(draft.last_edited_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
        {draft.start_year}–{draft.end_year} ({draft.period_type})
      </div>
      {draft.comment && (
        <div style={{ fontSize: 14, marginBottom: 8, fontStyle: 'italic' }}>{draft.comment}</div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => setEditingDraft({ id: draft.id as number, type: 'period' })}
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          Редактировать
        </button>
        <button
          onClick={() => handleSubmitDraft(draft.id, 'period')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#4CAF50' }}
        >
          Отправить на модерацию
        </button>
        <button
          onClick={() => handleDeleteDraft(draft.id, 'period')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#f44336' }}
        >
          Удалить
        </button>
      </div>
    </div>
  )

  const renderPersonDraft = (draft: DraftItem) => (
    <div key={draft.id} style={{ border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 12, background: 'rgba(44,24,16,0.85)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontWeight: 'bold' }}>{draft.name || draft.title || '—'}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {new Date(draft.last_edited_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
        {draft.birth_year}–{draft.death_year}
      </div>
      <div style={{ fontSize: 14, marginBottom: 8 }}>{draft.description}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => setEditingDraft({ id: draft.id as string, type: 'person' })}
          style={{ padding: '4px 8px', fontSize: 12 }}
        >
          Редактировать
        </button>
        <button
          onClick={() => handleSubmitDraft(draft.id, 'person')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#4CAF50' }}
        >
          Отправить на модерацию
        </button>
        <button
          onClick={() => handleDeleteDraft(draft.id, 'person')}
          style={{ padding: '4px 8px', fontSize: 12, background: '#f44336' }}
        >
          Удалить
        </button>
      </div>
    </div>
  )

  if (!isAuthenticated || !emailVerified) {
    return null
  }

  const totalDrafts = achievementDrafts.length + periodDrafts.length + personDrafts.length

  if (totalDrafts === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', opacity: 0.7 }}>
        У вас пока нет черновиков
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Мои черновики</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('achievements')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'achievements' ? '#4CAF50' : 'transparent',
              border: '1px solid #4CAF50',
              borderRadius: 4,
              color: activeTab === 'achievements' ? 'white' : '#4CAF50'
            }}
          >
            Достижения ({achievementDrafts.length})
          </button>
          <button
            onClick={() => setActiveTab('periods')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'periods' ? '#4CAF50' : 'transparent',
              border: '1px solid #4CAF50',
              borderRadius: 4,
              color: activeTab === 'periods' ? 'white' : '#4CAF50'
            }}
          >
            Периоды ({periodDrafts.length})
          </button>
          <button
            onClick={() => setActiveTab('people')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'people' ? '#4CAF50' : 'transparent',
              border: '1px solid #4CAF50',
              borderRadius: 4,
              color: activeTab === 'people' ? 'white' : '#4CAF50'
            }}
          >
            Личности ({personDrafts.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Загрузка...</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {activeTab === 'achievements' ? (
            achievementDrafts.map(renderAchievementDraft)
          ) : activeTab === 'periods' ? (
            periodDrafts.map(renderPeriodDraft)
          ) : (
            personDrafts.map(renderPersonDraft)
          )}
        </div>
      )}
    </div>
  )
}
