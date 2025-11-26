import React, { useEffect, useRef, useState } from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'
import { DraftModerationButtons } from 'shared/ui/DraftModerationButtons'
import { updatePeriod, submitPeriodDraft, createPeriodDraft } from 'shared/api/periods'
import { apiFetch } from 'shared/api/core'
import 'shared/styles/FormControls.css'

type CountryOption = { id: number; name: string }

// Period entity type - расширенный Period с дополнительными полями
export interface PeriodEntity {
  id?: number
  name?: string
  startYear: number
  endYear: number | null
  type?: 'life' | 'ruler' | 'other' | 'reign'
  description?: string
  comment?: string | null
  person_id?: string
  country_id?: number
  countryId?: number
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
}

// Тип для payload редактирования периода
export interface PeriodEditPayload {
  name: string
  startYear: number
  endYear: number
  description: string
  type: 'reign' | 'life'
  countryId?: number | null
  personId?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  period: PeriodEntity
  isModerator: boolean
  countryOptions: CountryOption[]
  personOptions: SelectOption[]
  personsSelectLoading: boolean
  onSearchPersons: (q: string) => Promise<void>
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
  onPeriodUpdated: (fresh: PeriodEntity) => void
  onProposeEdit?: (id: number, payload: PeriodEditPayload) => Promise<void>
  onUpdateDraft?: (id: number, payload: PeriodEditPayload) => Promise<void>
  onSubmitDraft?: (id: number, payload: PeriodEditPayload) => Promise<void>
  onSuccess?: () => void
}

export function PeriodEditModal(props: Props) {
  const {
    isOpen,
    onClose,
    period,
    isModerator,
    countryOptions,
    personOptions,
    personsSelectLoading,
    onSearchPersons,
    showToast,
    onPeriodUpdated,
    onProposeEdit,
    onUpdateDraft,
    onSubmitDraft,
    onSuccess,
  } = props

  const [saving, setSaving] = useState(false)
  const [name, setName] = useState<string>(period.name || '')
  const [startYear, setStartYear] = useState<number | ''>(period.startYear || '')
  const [endYear, setEndYear] = useState<number | ''>(period.endYear || '')
  const [type, setType] = useState<'reign' | 'life'>((period.type === 'life' || period.type === 'ruler') ? (period.type === 'life' ? 'life' : 'reign') : 'reign')
  const [description, setDescription] = useState<string>(period.description || period.comment || '')
  const [countryId, setCountryId] = useState<string>(period.country_id || period.countryId ? String(period.country_id || period.countryId) : '')
  const [personId, setPersonId] = useState<string>(period.person_id || '')
  const [validationError, setValidationError] = useState<string>('')
  const [yearErrors, setYearErrors] = useState<{ start?: string; end?: string }>({})
  const modalRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedBeforeModalRef = useRef<HTMLElement | null>(null)

  // Обновляем состояние при изменении периода
  useEffect(() => {
    if (period) {
      setName(period.name || '')
      setStartYear(period.startYear || '')
      setEndYear(period.endYear || '')
      setType((period.type === 'life' || period.type === 'ruler') ? (period.type === 'life' ? 'life' : 'reign') : 'reign')
      setDescription(period.description || period.comment || '')
      setCountryId(period.country_id || period.countryId ? String(period.country_id || period.countryId) : '')
      setPersonId(period.person_id || '')
    }
  }, [period])

  const countrySelectOptions = React.useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )

  // Общая функция валидации и получения payload
  const validateAndGetPayload = (): PeriodEditPayload | null => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const startYearNum = Number(startYear)
    const endYearNum = Number(endYear)

    // Сброс ошибок
    setValidationError('')
    const errs: { start?: string; end?: string } = {}

    // Валидация обязательных полей
    if (!trimmedName || !trimmedDescription || startYear === '' || endYear === '') {
      setValidationError('Пожалуйста, заполните все обязательные поля')
      return null
    }

    // Валидация годов
    if (!Number.isInteger(startYearNum)) errs.start = 'Введите целое число'
    if (!Number.isInteger(endYearNum)) errs.end = 'Введите целое число'
    if (Number.isInteger(startYearNum) && Number.isInteger(endYearNum) && startYearNum > endYearNum) {
      errs.start = 'Год начала > года окончания'
      errs.end = 'Год окончания < года начала'
    }
    setYearErrors(errs)
    if (errs.start || errs.end) return null

    // Валидация личности
    if (!personId && (type === 'life' || type === 'reign')) {
      setValidationError('Для периодов типов "Жизнь" и "Правление" обязательно нужно выбрать личность')
      return null
    }

    return {
      name: trimmedName,
      startYear: startYearNum,
      endYear: endYearNum,
      description: trimmedDescription,
      type,
      countryId: countryId ? Number(countryId) : null,
      personId: personId || undefined,
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
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>Редактирование периода</div>
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

          {(yearErrors.start || yearErrors.end) && (
            <div style={{ color: '#ffaaaa', fontSize: 12 }}>
              {yearErrors.start && <div>Год начала: {yearErrors.start}</div>}
              {yearErrors.end && <div>Год окончания: {yearErrors.end}</div>}
            </div>
          )}

          <div>
            <label htmlFor="period-edit-name" className="formLabel">
              Название периода <span aria-label="обязательное поле" className="formRequired">*</span>
            </label>
            <input
              id="period-edit-name"
              name="name"
              placeholder="Введите название периода"
              required
              aria-required="true"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="formInput"
            />
          </div>

          <fieldset
            style={{
              border: '1px solid rgba(139, 69, 19, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              margin: 0,
            }}
          >
            <legend
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                fontWeight: '500',
                padding: '0 8px',
              }}
            >
              Даты периода <span aria-label="обязательные поля" style={{ color: '#e74c3c' }}>*</span>
            </legend>
            <div className="formRow">
              <div>
                <label htmlFor="period-edit-start-year" className="formLabel">
                  Год начала
                </label>
                <input
                  id="period-edit-start-year"
                  name="startYear"
                  type="number"
                  placeholder="Год начала"
                  required
                  aria-required="true"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value === '' ? '' : Number(e.target.value))}
                  className="formInput"
                />
              </div>
              <div>
                <label htmlFor="period-edit-end-year" className="formLabel">
                  Год окончания
                </label>
                <input
                  id="period-edit-end-year"
                  name="endYear"
                  type="number"
                  placeholder="Год окончания"
                  required
                  aria-required="true"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value === '' ? '' : Number(e.target.value))}
                  className="formInput"
                />
              </div>
            </div>
          </fieldset>

          <div data-testid="period-person-select">
            <label htmlFor="period-edit-person" className="formLabel">
              Личность <span aria-label="обязательное поле" className="formRequired">*</span>
            </label>
            <SearchableSelect
              placeholder="Выбрать личность"
              value={personId}
              options={personOptions}
              isLoading={personsSelectLoading}
              onChange={(val) => setPersonId(val)}
              onSearchChange={(q) => onSearchPersons(q)}
              locale="ru"
              aria-label="Выбрать историческую личность"
            />
          </div>

          <div>
            <label htmlFor="period-edit-type" className="formLabel">
              Тип периода
            </label>
            <select
              id="period-edit-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'reign' | 'life')}
              aria-label="Выберите тип периода"
              className="formInput"
            >
              <option value="reign">Правление</option>
              <option value="life">Жизнь</option>
            </select>
          </div>

          <div>
            <label htmlFor="period-edit-country" className="formLabel">
              Страна (необязательно)
            </label>
            <SearchableSelect
              placeholder="Выбрать страну"
              value={countryId}
              options={countrySelectOptions}
              onChange={(val) => setCountryId(val)}
              locale="ru"
              aria-label="Выбрать страну для периода"
            />
          </div>

          <div>
            <label htmlFor="period-edit-description" className="formLabel">
              Описание периода <span aria-label="обязательное поле" className="formRequired">*</span>
            </label>
            <textarea
              id="period-edit-description"
              name="description"
              placeholder="Введите описание периода"
              rows={4}
              required
              aria-required="true"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="formTextarea"
            />
          </div>

          {/* Кнопки в зависимости от статуса и роли */}
          {isModerator ? (
            // Модераторы имеют одну кнопку
            <button
              type="button"
              disabled={saving || Boolean(yearErrors.start || yearErrors.end || validationError)}
              onClick={async () => {
                const payload = validateAndGetPayload()
                if (!payload || !period.id) return

                setSaving(true)
                try {
                  // Для модераторов обновляем напрямую
                  await updatePeriod(period.id, {
                    start_year: payload.startYear,
                    end_year: payload.endYear,
                    period_type: payload.type === 'reign' ? 'ruler' : 'life',
                    country_id: payload.countryId,
                    comment: payload.description,
                  })
                  // Обновляем name и description через отдельный endpoint, если нужно
                  // Пока используем comment для description
                  showToast('Период сохранен', 'success')
                  // Обновляем период в состоянии
                  const updated: PeriodEntity = {
                    ...period,
                    startYear: payload.startYear,
                    endYear: payload.endYear,
                    type: payload.type === 'reign' ? 'ruler' : 'life',
                    country_id: payload.countryId || undefined,
                    countryId: payload.countryId || undefined,
                    description: payload.description,
                    comment: payload.description,
                    name: payload.name,
                    person_id: payload.personId,
                  }
                  onPeriodUpdated(updated)
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
              const isDraft = period.status === 'draft'

              if (isDraft) {
                // Для черновиков - две кнопки
                return (
                  <DraftModerationButtons
                    mode="edit"
                    disabled={Boolean(yearErrors.start || yearErrors.end || validationError)}
                    saving={saving}
                    onSaveDraft={async () => {
                      const payload = validateAndGetPayload()
                      if (!payload || !period.id || !onUpdateDraft) return

                      setSaving(true)
                      try {
                        await onUpdateDraft(period.id, payload)
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
                      if (!payload || !period.id || !onSubmitDraft) return

                      setSaving(true)
                      try {
                        await onSubmitDraft(period.id, payload)
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
                // Для опубликованных периодов - одна кнопка (proposeEdit)
                return (
                  <button
                    type="button"
                    disabled={saving || Boolean(yearErrors.start || yearErrors.end || validationError)}
                    onClick={async () => {
                      const payload = validateAndGetPayload()
                      if (!payload || !period.id) return

                      setSaving(true)
                      try {
                        if (onProposeEdit) {
                          await onProposeEdit(period.id, payload)
                        } else {
                          // Fallback: создаем черновик с изменениями
                          if (!payload.personId) {
                            throw new Error('Необходимо указать личность')
                          }
                          await createPeriodDraft(payload.personId, {
                            start_year: payload.startYear,
                            end_year: payload.endYear,
                            period_type: payload.type === 'reign' ? 'ruler' : 'life',
                            country_id: payload.countryId,
                            comment: `${payload.name}\n\n${payload.description}`,
                          })
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

