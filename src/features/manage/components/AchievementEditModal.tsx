import React, { useEffect, useRef, useState } from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'
import { DraftModerationButtons } from 'shared/ui/DraftModerationButtons'
import { updateAchievement, submitAchievementDraft, createAchievementDraft } from 'shared/api/achievements'
import 'shared/styles/FormControls.css'
import type { Achievement } from 'shared/types'

type CountryOption = { id: number; name: string }

// Тип для payload редактирования достижения
export interface AchievementEditPayload {
  year: number
  description: string
  wikipedia_url: string | null
  image_url: string | null
  personId?: string
  countryId?: number | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  achievement: Achievement
  isModerator: boolean
  countryOptions: CountryOption[]
  personOptions: SelectOption[]
  personsSelectLoading: boolean
  onSearchPersons: (q: string) => Promise<void>
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
  onAchievementUpdated: (fresh: Achievement) => void
  onProposeEdit?: (id: number, payload: AchievementEditPayload) => Promise<void>
  onUpdateDraft?: (id: number, payload: AchievementEditPayload) => Promise<void>
  onSubmitDraft?: (id: number, payload: AchievementEditPayload) => Promise<void>
  onSuccess?: () => void
}

export function AchievementEditModal(props: Props) {
  const {
    isOpen,
    onClose,
    achievement,
    isModerator,
    countryOptions,
    personOptions,
    personsSelectLoading,
    onSearchPersons,
    showToast,
    onAchievementUpdated,
    onProposeEdit,
    onUpdateDraft,
    onSubmitDraft,
    onSuccess,
  } = props

  const [saving, setSaving] = useState(false)
  const [year, setYear] = useState<number | ''>(achievement.year || '')
  const [description, setDescription] = useState<string>(achievement.description || '')
  const [wikipediaUrl, setWikipediaUrl] = useState<string>(achievement.wikipedia_url || '')
  const [imageUrl, setImageUrl] = useState<string>(achievement.image_url || '')
  const [isGlobal, setIsGlobal] = useState<boolean>(!achievement.person_id && !achievement.country_id)
  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    achievement.country_id ? String(achievement.country_id) : ''
  )
  const [selectedPersonId, setSelectedPersonId] = useState<string>(achievement.person_id || '')
  const [validationError, setValidationError] = useState<string>('')
  const [yearError, setYearError] = useState<string>('')
  const modalRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedBeforeModalRef = useRef<HTMLElement | null>(null)

  // Обновляем состояние при изменении достижения
  useEffect(() => {
    if (achievement) {
      setYear(achievement.year || '')
      setDescription(achievement.description || '')
      setWikipediaUrl(achievement.wikipedia_url || '')
      setImageUrl(achievement.image_url || '')
      setIsGlobal(!achievement.person_id && !achievement.country_id)
      setSelectedCountryId(achievement.country_id ? String(achievement.country_id) : '')
      setSelectedPersonId(achievement.person_id || '')
    }
  }, [achievement])

  const countrySelectOptions = React.useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )

  // Общая функция валидации и получения payload
  const validateAndGetPayload = (): AchievementEditPayload | null => {
    const trimmedDescription = description.trim()
    const yearNum = Number(year)

    // Сброс ошибок
    setValidationError('')
    setYearError('')

    // Валидация обязательных полей
    if (!trimmedDescription || year === '') {
      setValidationError('Пожалуйста, заполните все обязательные поля')
      return null
    }

    // Валидация года
    if (!Number.isInteger(yearNum) || yearNum === 0) {
      setYearError('Введите корректный год')
      return null
    }

    // Проверка, что выбрана хотя бы одна привязка или глобальное событие
    if (!isGlobal && !selectedPersonId && !selectedCountryId) {
      setValidationError('Необходимо выбрать привязку к личности, стране или отметить как глобальное событие')
      return null
    }

    return {
      year: yearNum,
      description: trimmedDescription,
      wikipedia_url: wikipediaUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      personId: isGlobal ? undefined : selectedPersonId || undefined,
      countryId: isGlobal ? null : selectedCountryId ? Number(selectedCountryId) : null,
    }
  }

  const trapFocus = (container: HTMLElement, e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusable = container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
    const list = Array.from(focusable).filter((el) => el.offsetParent !== null)
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement as HTMLElement | null
    const shift = (e as React.KeyboardEvent).shiftKey
    if (!shift && active === last) {
      e.preventDefault()
      first.focus()
    } else if (shift && active === first) {
      e.preventDefault()
      last.focus()
    }
  }

  useEffect(() => {
    if (isOpen) {
      lastFocusedBeforeModalRef.current = document.activeElement as HTMLElement
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    } else if (!isOpen && lastFocusedBeforeModalRef.current) {
      try {
        lastFocusedBeforeModalRef.current.focus()
      } catch {}
      lastFocusedBeforeModalRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000,
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          position: 'relative',
          background: 'rgba(44,24,16,0.98)',
          border: '1px solid rgba(139,69,19,0.5)',
          borderRadius: 8,
          padding: 16,
          minWidth: 360,
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (modalRef.current) trapFocus(modalRef.current, e)
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>Редактирование достижения</div>
          <button onClick={onClose}>Отмена</button>
        </div>
        <form style={{ display: 'grid', gap: 8 }} className="formGrid">
          {validationError && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                padding: '12px',
                background: 'rgba(192, 57, 43, 0.2)',
                border: '1px solid rgba(192, 57, 43, 0.4)',
                borderRadius: '6px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {validationError}
            </div>
          )}

          {yearError && (
            <div style={{ color: '#ffaaaa', fontSize: 12 }}>
              <div>Год: {yearError}</div>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              id="achievement-edit-is-global"
              type="checkbox"
              checked={isGlobal}
              disabled={!!selectedPersonId || !!selectedCountryId}
              aria-describedby="global-hint"
              onChange={(e) => {
                const v = e.target.checked
                setIsGlobal(v)
                if (v) {
                  setSelectedPersonId('')
                  setSelectedCountryId('')
                }
              }}
            />
            Глобальное событие
          </label>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Привязка к сущности</legend>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', minWidth: 260 }} data-testid="achievement-person-select">
                <label style={{ display: 'block', marginBottom: 4, fontSize: 11, opacity: 0.8 }}>
                  Личность
                </label>
                <SearchableSelect
                  placeholder="Выбрать личность"
                  value={selectedPersonId}
                  disabled={isGlobal || !!selectedCountryId}
                  options={personOptions}
                  isLoading={personsSelectLoading}
                  locale="ru"
                  aria-label="Выбрать личность для привязки достижения"
                  onChange={(val) => {
                    setSelectedPersonId(val)
                    if (val) {
                      setIsGlobal(false)
                      setSelectedCountryId('')
                    }
                  }}
                  onSearchChange={(q) => onSearchPersons(q)}
                />
              </div>
              <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 11, opacity: 0.8 }}>
                  Страна
                </label>
                <SearchableSelect
                  placeholder="Выбрать страну"
                  value={selectedCountryId}
                  disabled={isGlobal || !!selectedPersonId}
                  options={countrySelectOptions}
                  locale="ru"
                  aria-label="Выбрать страну для привязки достижения"
                  onChange={(val) => {
                    setSelectedCountryId(val)
                    if (val) {
                      setIsGlobal(false)
                      setSelectedPersonId('')
                    }
                  }}
                />
              </div>
            </div>
          </fieldset>

          <div id="global-hint" style={{ fontSize: 12, opacity: 0.8 }} role="note">
            Можно выбрать только одно: «Глобальное событие», «Выбрать личность» или «Выбрать страну».
          </div>

          <div>
            <label htmlFor="achievement-edit-year" className="formLabel">
              Год <span aria-label="обязательное поле" className="formRequired">*</span>
            </label>
            <input
              id="achievement-edit-year"
              name="year"
              type="number"
              placeholder="Год"
              required
              aria-required="true"
              value={year}
              onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
              className="formInput"
            />
          </div>

          <div>
            <label htmlFor="achievement-edit-description" className="formLabel">
              Описание <span aria-label="обязательное поле" className="formRequired">*</span>
            </label>
            <textarea
              id="achievement-edit-description"
              name="description"
              placeholder="Описание достижения"
              rows={4}
              required
              aria-required="true"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="formTextarea"
            />
          </div>

          <div>
            <label htmlFor="achievement-edit-wiki" className="formLabel">
              Ссылка на Википедию (необязательно)
            </label>
            <input
              id="achievement-edit-wiki"
              name="wikipedia_url"
              type="url"
              placeholder="https://ru.wikipedia.org/wiki/..."
              value={wikipediaUrl}
              onChange={(e) => setWikipediaUrl(e.target.value)}
              className="formInput"
            />
          </div>

          <div>
            <label htmlFor="achievement-edit-image" className="formLabel">
              URL изображения (необязательно)
            </label>
            <input
              id="achievement-edit-image"
              name="image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="formInput"
            />
          </div>

          {/* Кнопки в зависимости от статуса и роли */}
          {isModerator ? (
            // Модераторы имеют одну кнопку
            <button
              type="button"
              disabled={saving || Boolean(yearError || validationError)}
              onClick={async () => {
                const payload = validateAndGetPayload()
                if (!payload) return

                setSaving(true)
                try {
                  // Для модераторов обновляем напрямую
                  await updateAchievement(achievement.id, {
                    year: payload.year,
                    description: payload.description,
                    wikipedia_url: payload.wikipedia_url,
                    image_url: payload.image_url,
                  })
                  showToast('Достижение сохранено', 'success')
                  // Обновляем достижение в состоянии
                  const updated: Achievement = {
                    ...achievement,
                    year: payload.year,
                    description: payload.description,
                    wikipedia_url: payload.wikipedia_url,
                    image_url: payload.image_url,
                    person_id: payload.personId || null,
                    country_id: payload.countryId || null,
                  }
                  onAchievementUpdated(updated)
                  onClose()
                } catch (e) {
                  const errorMessage = e instanceof Error ? e.message : 'Ошибка сохранения'
                  showToast(errorMessage, 'error')
                } finally {
                  setSaving(false)
                }
              }}
            >
              {saving ? 'Сохраняем…' : 'Сохранить (модератор)'}
            </button>
          ) : (
            // Обычные пользователи: разные кнопки для черновиков и опубликованных
            (() => {
              const isDraft = achievement.status === 'draft'

              if (isDraft) {
                // Для черновиков - две кнопки
                return (
                  <DraftModerationButtons
                    mode="edit"
                    disabled={Boolean(yearError || validationError)}
                    saving={saving}
                    onSaveDraft={async () => {
                      const payload = validateAndGetPayload()
                      if (!payload || !onUpdateDraft) return

                      setSaving(true)
                      try {
                        await onUpdateDraft(achievement.id, payload)
                        showToast('Черновик сохранен', 'success')
                        if (onSuccess) onSuccess()
                        onClose()
                      } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : 'Ошибка сохранения'
                        showToast(errorMessage, 'error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    onSubmitModeration={async () => {
                      const payload = validateAndGetPayload()
                      if (!payload || !onSubmitDraft) return

                      setSaving(true)
                      try {
                        await onSubmitDraft(achievement.id, payload)
                        showToast('Черновик отправлен на модерацию', 'success')
                        if (onSuccess) onSuccess()
                        onClose()
                      } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : 'Ошибка отправки'
                        showToast(errorMessage, 'error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    showDescription={true}
                  />
                )
              } else {
                // Для опубликованных достижений - одна кнопка (proposeEdit)
                return (
                  <button
                    type="button"
                    disabled={saving || Boolean(yearError || validationError)}
                    onClick={async () => {
                      const payload = validateAndGetPayload()
                      if (!payload) return

                      setSaving(true)
                      try {
                        if (onProposeEdit) {
                          await onProposeEdit(achievement.id, payload)
                        } else {
                          // Fallback: создаем черновик с изменениями
                          if (!payload.personId && !payload.countryId && !isGlobal) {
                            throw new Error('Необходимо указать привязку или отметить как глобальное событие')
                          }
                          if (payload.personId) {
                            await createAchievementDraft(payload.personId, {
                              year: payload.year,
                              description: payload.description,
                              wikipedia_url: payload.wikipedia_url,
                              image_url: payload.image_url,
                            })
                          } else {
                            // Для глобальных или привязанных к стране - используем generic API
                            // Но createAchievementDraft требует personId, поэтому нужно использовать другой подход
                            throw new Error('Редактирование глобальных достижений или привязанных к стране требует специальной обработки')
                          }
                        }
                        showToast('Изменения отправлены на модерацию', 'success')
                        if (onSuccess) onSuccess()
                        onClose()
                      } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : 'Ошибка отправки'
                        showToast(errorMessage, 'error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                  >
                    {saving ? 'Отправляем…' : 'Отправить на модерацию'}
                  </button>
                )
              }
            })()
          )}
        </form>
      </div>
    </div>
  )
}

