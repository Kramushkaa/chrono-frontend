import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getListModerationQueue, reviewListPublication } from 'shared/api/lists'
import { slugifyIdFromName } from 'shared/utils/slug'
import type { ModerationListSummary } from 'shared/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

type FormState = {
  slug: string
  comment: string
}

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  zIndex: 11000,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  overflowY: 'auto',
  padding: '60px 16px 40px',
}

const modalCardStyle: React.CSSProperties = {
  background: 'rgba(44,24,16,0.95)',
  border: '1px solid rgba(139,69,19,0.4)',
  borderRadius: 12,
  width: 'min(960px, 100%)',
  color: '#f7f2eb',
  boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 120px)',
}

export function ListModerationModal({ isOpen, onClose, showToast }: Props) {
  const [lists, setLists] = useState<ModerationListSummary[]>([])
  const [forms, setForms] = useState<Record<number, FormState>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await getListModerationQueue({ status: 'pending', limit: 100 })
      setLists(payload.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить списки'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadQueue()
    }
  }, [isOpen, loadQueue])

  useEffect(() => {
    if (!isOpen) {
      if (lists.length > 0) {
        setLists([])
      }
      if (Object.keys(forms).length > 0) {
        setForms({})
      }
    }
  }, [isOpen, lists.length, forms])

  useEffect(() => {
    if (!isOpen || lists.length === 0) {
      return
    }
    setForms((prev) => {
      let changed = false
      const next: Record<number, FormState> = { ...prev }
      lists.forEach((list) => {
        if (!next[list.id]) {
          next[list.id] = {
            slug: slugifyIdFromName(list.title) || `list-${list.id}`,
            comment: '',
          }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [lists, isOpen])

  const handleReview = async (
    list: ModerationListSummary,
    action: 'approve' | 'reject'
  ) => {
    const form = forms[list.id] || { slug: '', comment: '' }
    if (action === 'approve' && form.slug.trim().length === 0) {
      showToast('Введите slug перед публикацией', 'error')
      return
    }
    setSubmittingId(list.id)
    try {
      await reviewListPublication(list.id, {
        action,
        comment: form.comment.trim() || undefined,
        slug: action === 'approve' ? form.slug.trim() : undefined,
      })
      showToast(
        action === 'approve'
          ? `Список «${list.title}» опубликован`
          : `Список «${list.title}» отклонён`,
        'success'
      )
      setLists((prev) => prev.filter((item) => item.id !== list.id))
      setForms((prev) => {
        const next = { ...prev }
        delete next[list.id]
        return next
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить статус'
      showToast(message, 'error')
    } finally {
      setSubmittingId(null)
    }
  }

  const pendingCount = lists.length

  const content = useMemo(() => {
    if (loading) {
      return <div style={{ padding: 24 }}>Загрузка очереди модерации…</div>
    }
    if (error) {
      return (
        <div style={{ padding: 24, color: '#ffcccc' }}>
          Ошибка: {error}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={loadQueue}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(139,69,19,0.6)',
                background: 'rgba(139,69,19,0.2)',
                color: '#f7f2eb',
              }}
            >
              Повторить
            </button>
          </div>
        </div>
      )
    }
    if (lists.length === 0) {
      return (
        <div style={{ padding: 24, fontSize: 14, opacity: 0.8 }}>
          Нет списков, ожидающих модерации.
        </div>
      )
    }
    return (
      <div style={{ padding: '0 24px 24px', display: 'grid', gap: 16, overflowY: 'auto' }}>
        {lists.map((list) => {
          const form = forms[list.id] || { slug: '', comment: '' }
          return (
            <div
              key={list.id}
              style={{
                border: '1px solid rgba(139,69,19,0.35)',
                borderRadius: 10,
                padding: 16,
                background: 'rgba(35,20,13,0.9)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{list.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Автор: {list.owner_display_name || `#${list.owner_user_id}`}
                  </div>
                  {list.moderation_requested_at && (
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      Получено: {new Date(list.moderation_requested_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, textAlign: 'right' }}>
                  <div>Всего элементов: {list.items_count}</div>
                  <div>Личности: {list.persons_count}</div>
                  <div>Достижения: {list.achievements_count}</div>
                  <div>Периоды: {list.periods_count}</div>
                </div>
              </div>

              {list.public_description && (
                <div
                  style={{
                    borderLeft: '3px solid rgba(139,69,19,0.6)',
                    paddingLeft: 12,
                    fontSize: 13,
                    opacity: 0.85,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {list.public_description}
                </div>
              )}

              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.75 }}>Slug (для публичного URL)</span>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForms((prev) => ({
                        ...prev,
                        [list.id]: { ...form, slug: e.target.value.toLowerCase() },
                      }))
                    }
                    placeholder="Например, spisok-velikikh-rulerov"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(139,69,19,0.4)',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#f7f2eb',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.75 }}>Комментарий (для автора)</span>
                  <textarea
                    value={form.comment}
                    onChange={(e) =>
                      setForms((prev) => ({
                        ...prev,
                        [list.id]: { ...form, comment: e.target.value },
                      }))
                    }
                    rows={3}
                    style={{
                      resize: 'vertical',
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(139,69,19,0.4)',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#f7f2eb',
                    }}
                    placeholder="Укажите, что нужно поправить, если отклоняете"
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleReview(list, 'reject')}
                  disabled={submittingId === list.id}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(220,53,69,0.5)',
                    background: 'rgba(220,53,69,0.15)',
                    color: '#f7f2eb',
                    cursor: submittingId === list.id ? 'wait' : 'pointer',
                  }}
                >
                  {submittingId === list.id ? 'Обновление…' : 'Отклонить'}
                </button>
                <button
                  onClick={() => handleReview(list, 'approve')}
                  disabled={submittingId === list.id}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(46,160,67,0.6)',
                    background: 'rgba(46,160,67,0.2)',
                    color: '#f7f2eb',
                    cursor: submittingId === list.id ? 'wait' : 'pointer',
                  }}
                >
                  {submittingId === list.id ? 'Публикация…' : 'Опубликовать'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }, [lists, forms, loading, error, loadQueue, submittingId, showToast])

  if (!isOpen) return null

  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(139,69,19,0.35)',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Модерация публичных списков</div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              В очереди {pendingCount} {pendingCount === 1 ? 'список' : pendingCount >= 2 && pendingCount <= 4 ? 'списка' : 'списков'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={loadQueue}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(139,69,19,0.6)',
                background: 'rgba(139,69,19,0.2)',
                color: '#f7f2eb',
              }}
            >
              Обновить
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(139,69,19,0.4)',
                background: 'rgba(139,69,19,0.1)',
                color: '#f7f2eb',
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>{content}</div>
      </div>
    </div>
  )
}







