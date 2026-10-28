import React, { useEffect, useMemo, useState } from 'react'
import { requestListPublication, updateList, unpublishList } from 'shared/api/lists'
import type { UserList, ListModerationStatus } from 'shared/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  list: UserList | null
  isOwner: boolean
  onUpdated?: (list: UserList) => void
  onReload?: (force?: boolean) => Promise<void>
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const statusLabel: Record<ListModerationStatus, string> = {
  draft: 'Черновик',
  pending: 'На модерации',
  published: 'Опубликован',
  rejected: 'Отклонён',
}

const statusColors: Record<ListModerationStatus, string> = {
  draft: 'rgba(139,69,19,0.25)',
  pending: 'rgba(255,165,0,0.25)',
  published: 'rgba(46,160,67,0.3)',
  rejected: 'rgba(220,53,69,0.3)',
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
  width: 'min(720px, 100%)',
  color: '#f7f2eb',
  boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
}

export function ListPublicationModal({ isOpen, onClose, list, isOwner, onUpdated, onReload, showToast }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)

  useEffect(() => {
    if (isOpen && list) {
      setTitle(list.title || '')
      setDescription(list.public_description || '')
    }
  }, [isOpen, list])

  const isPublished = list?.moderation_status === 'published'
  const hasPendingChanges = isPublished && (list.pending_title !== null || list.pending_description !== null)
  const canSubmit = list && isOwner && !list.readonly && (list.moderation_status === 'draft' || list.moderation_status === 'pending' || list.moderation_status === 'rejected')

  const submitLabel = useMemo(() => {
    if (!list) return 'Отправить на модерацию'
    if (list.moderation_status === 'pending') return 'Обновить заявку'
    if (list.moderation_status === 'rejected') return 'Отправить повторно'
    return 'Отправить на модерацию'
  }, [list])

  const publicUrl = useMemo(() => {
    if (!list) return null
    if (!list.public_slug && list.moderation_status !== 'published') return null
    const slug = list.public_slug || `list-${list.id}`
    return `${window.location.origin}/lists/public/${slug}`
  }, [list])

  const handleSaveDraft = async () => {
    if (!isOwner || !list) return
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    
    if (isPublished) {
      // Для опубликованных списков сохраняем как pending изменения
      const updates: { title?: string; public_description?: string } = {}
      if (trimmedTitle !== list.title) updates.title = trimmedTitle
      if (trimmedDescription !== (list.public_description || '')) updates.public_description = trimmedDescription
      
      if (Object.keys(updates).length === 0) {
        showToast('Нет изменений для сохранения', 'info')
        return
      }
      
      setSavingDraft(true)
      try {
        const updated = await updateList(list.id, updates)
        onUpdated?.(updated)
        showToast('Изменения сохранены и отправлены на модерацию', 'success')
        await onReload?.(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось сохранить изменения'
        showToast(message, 'error')
      } finally {
        setSavingDraft(false)
      }
    } else {
      // Для неопубликованных списков сохраняем сразу
      const trimmed = description.trim()
      if (trimmed === (list.public_description || '')) {
        showToast('Нет изменений для сохранения', 'info')
        return
      }
      setSavingDraft(true)
      try {
        const updated = await updateList(list.id, { public_description: trimmed })
        onUpdated?.(updated)
        showToast('Описание сохранено', 'success')
        await onReload?.(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось сохранить описание'
        showToast(message, 'error')
      } finally {
        setSavingDraft(false)
      }
    }
  }

  const handleUnpublish = async () => {
    if (!isOwner || !list || !isPublished) return
    if (!confirm('Вы уверены, что хотите отозвать публикацию этого списка? Он станет недоступен публично.')) {
      return
    }
    setUnpublishing(true)
    try {
      const updated = await unpublishList(list.id)
      onUpdated?.(updated)
      showToast('Публикация отозвана', 'success')
      await onReload?.(true)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось отозвать публикацию'
      showToast(message, 'error')
    } finally {
      setUnpublishing(false)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit || !list) return
    const payload = { description: description.trim() }
    setSaving(true)
    try {
      const updated = await requestListPublication(list.id, payload)
      onUpdated?.(updated)
      showToast('Заявка на публикацию отправлена', 'success')
      await onReload?.(true)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось отправить заявку'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !list) return null

  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(139,69,19,0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Публикация списка</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{list.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(139,69,19,0.4)',
              background: 'rgba(139,69,19,0.1)',
              color: '#f7f2eb',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'grid', gap: 16 }}>
          {/* Status and Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 999,
                  background: statusColors[list.moderation_status],
                  color: '#24140e',
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  fontSize: 11,
                }}
              >
                {statusLabel[list.moderation_status]}
              </span>
              {list.published_at && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  Опубликован: {new Date(list.published_at).toLocaleDateString()}
                </span>
              )}
              {list.moderation_requested_at && list.moderation_status === 'pending' && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  Отправлен: {new Date(list.moderation_requested_at).toLocaleString()}
                </span>
              )}
              {hasPendingChanges && (
                <span style={{ fontSize: 12, opacity: 0.8, color: '#ffa500' }}>
                  Изменения на модерации
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, textAlign: 'right' }}>
              <div>Всего: {list.items_count ?? 0}</div>
              <div>Личности: {list.persons_count ?? 0}</div>
              <div>Достижения: {list.achievements_count ?? 0}</div>
              <div>Периоды: {list.periods_count ?? 0}</div>
            </div>
          </div>

          {/* Public URL Copy */}
          {publicUrl && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                readOnly
                value={publicUrl}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(139,69,19,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#f7f2eb',
                  fontSize: 13,
                }}
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicUrl)
                    showToast('Публичная ссылка скопирована', 'success')
                  } catch {
                    showToast('Не удалось скопировать ссылку', 'error')
                  }
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(139,69,19,0.6)',
                  background: 'rgba(139,69,19,0.2)',
                  color: '#f7f2eb',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Скопировать
              </button>
            </div>
          )}

          {/* Pending Changes Warning */}
          {hasPendingChanges && (
            <div
              style={{
                background: 'rgba(255,165,0,0.15)',
                border: '1px solid rgba(255,165,0,0.35)',
                borderRadius: 8,
                padding: 12,
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Изменения ожидают модерации:</div>
              {list.pending_title && (
                <div style={{ marginBottom: 4 }}>
                  <strong>Название:</strong> {list.pending_title}
                </div>
              )}
              {list.pending_description && (
                <div>
                  <strong>Описание:</strong> {list.pending_description}
                </div>
              )}
            </div>
          )}

          {/* Title (only for published lists) */}
          {isPublished && (
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Название списка</span>
              <input
                type="text"
                value={title}
                disabled={!isOwner || list.readonly}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(139,69,19,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#f7f2eb',
                  fontSize: 14,
                }}
                placeholder="Название списка"
              />
              <span style={{ fontSize: 11, opacity: 0.6, textAlign: 'right' }}>{title.length}/200</span>
            </label>
          )}

          {/* Description */}
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.85 }}>Описание для публичной страницы</span>
            <textarea
              value={description}
              disabled={!isOwner || list.readonly}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={6}
              style={{
                resize: 'vertical',
                minHeight: 120,
                padding: 10,
                borderRadius: 8,
                border: '1px solid rgba(139,69,19,0.4)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f7f2eb',
                fontSize: 14,
              }}
              placeholder="Расскажите, что объединяет элементы в списке, зачем его читать, какие интригующие факты найти."
            />
            <span style={{ fontSize: 11, opacity: 0.6, textAlign: 'right' }}>{description.length}/2000</span>
          </label>

          {/* Moderator Comment */}
          {list.moderation_comment && list.moderation_status === 'rejected' && (
            <div
              style={{
                background: 'rgba(220,53,69,0.15)',
                border: '1px solid rgba(220,53,69,0.35)',
                borderRadius: 8,
                padding: 12,
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Комментарий модератора:</div>
              <div>{list.moderation_comment}</div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {isOwner && isPublished && !list.readonly && (
                <button
                  onClick={handleUnpublish}
                  disabled={unpublishing || saving || savingDraft}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(220,53,69,0.5)',
                    background: 'rgba(220,53,69,0.15)',
                    color: '#f7f2eb',
                    fontWeight: 500,
                    cursor: unpublishing || saving || savingDraft ? 'wait' : 'pointer',
                    opacity: unpublishing || saving || savingDraft ? 0.7 : 1,
                  }}
                >
                  {unpublishing ? 'Отзыв...' : 'Отозвать публикацию'}
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(139,69,19,0.4)',
                  background: 'rgba(139,69,19,0.1)',
                  color: '#f7f2eb',
                  cursor: 'pointer',
                }}
              >
                Закрыть
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {isOwner && !list.readonly && (
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft || saving || unpublishing}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(139,69,19,0.5)',
                    background: 'rgba(139,69,19,0.2)',
                    color: '#f7f2eb',
                    fontWeight: 500,
                    cursor: savingDraft || saving || unpublishing ? 'wait' : 'pointer',
                    opacity: savingDraft || saving || unpublishing ? 0.7 : 1,
                  }}
                >
                  {savingDraft ? 'Сохранение...' : isPublished ? 'Сохранить изменения' : 'Сохранить черновик'}
                </button>
              )}
              {canSubmit ? (
                <button
                  onClick={handleSubmit}
                  disabled={saving || savingDraft || unpublishing}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#c18453',
                    color: '#1b0f06',
                    fontWeight: 600,
                    cursor: saving || savingDraft || unpublishing ? 'wait' : 'pointer',
                    opacity: saving || savingDraft || unpublishing ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Отправка...' : submitLabel}
                </button>
              ) : (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {list.moderation_status === 'published'
                    ? 'Список опубликован'
                    : 'Только владелец может отправить на модерацию'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

