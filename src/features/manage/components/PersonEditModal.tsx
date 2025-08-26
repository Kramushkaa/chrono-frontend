import React, { useEffect, useRef, useState } from 'react'
import { Person } from 'shared/types'
import { PersonEditor } from './PersonEditor'
import { validateLifePeriodsClient } from 'shared/utils/validation'
import { DraftModerationButtons } from 'shared/ui/DraftModerationButtons'
import { adminUpsertPerson, getPersonById } from 'shared/api/api'
import { apiFetch } from 'shared/api/api'

type Option = { value: string; label: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  person: Person
  isModerator: boolean
  editBirthYear: number
  setEditBirthYear: (n: number) => void
  editDeathYear: number
  setEditDeathYear: (n: number) => void
  editPersonCategory: string
  setEditPersonCategory: (s: string) => void
  categorySelectOptions: Option[]
  lifePeriods: Array<{ countryId: string; start: number | ''; end: number | '' }>
  setLifePeriods: (updater: any) => void
  countrySelectOptions: Option[]
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
  onPersonUpdated: (fresh: Person) => void
  onProposeEdit: (id: string, payload: any, nextLifePeriods: Array<{ country_id: number; start_year: number; end_year: number }>) => Promise<void>
  onUpdateDraft?: (id: string, payload: any, nextLifePeriods: Array<{ country_id: number; start_year: number; end_year: number }>) => Promise<void>
  onSubmitDraft?: (id: string, payload: any, nextLifePeriods: Array<{ country_id: number; start_year: number; end_year: number }>) => Promise<void>
  onSuccess?: () => void
}

export function PersonEditModal(props: Props) {
  const { isOpen, onClose, person, isModerator, editBirthYear, setEditBirthYear, editDeathYear, setEditDeathYear, editPersonCategory, setEditPersonCategory, categorySelectOptions, lifePeriods, setLifePeriods, countrySelectOptions, showToast, onPersonUpdated, onProposeEdit, onUpdateDraft, onSubmitDraft, onSuccess } = props
  const [saving, setSaving] = useState(false)
  const [yearErrors, setYearErrors] = useState<{ birth?: string; death?: string }>({})
  const [periodsError, setPeriodsError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedBeforeModalRef = useRef<HTMLElement | null>(null)

  // Общая функция валидации и получения payload
  const validateAndGetPayload = () => {
    const formData = new FormData(modalRef.current?.querySelector('form') as HTMLFormElement)
    const payload = {
      id: person.id,
      name: String(formData.get('name') || '').trim(),
      birthYear: Number(editBirthYear),
      deathYear: Number(editDeathYear),
      category: editPersonCategory || String(formData.get('category') || person.category),
      country: (() => {
        const chosen = countrySelectOptions.find(c => String(c.value) === String(formData.get('countryId') || ''))?.label
        return chosen || person.country
      })(),
      description: String(formData.get('description') || person.description),
      imageUrl: String(formData.get('imageUrl') || person.imageUrl || '') || null,
      wikiLink: String(formData.get('wikiLink') || person.wikiLink || '') || null,
    }

    // Валидация годов
    const errs: { birth?: string; death?: string } = {}
    if (!Number.isInteger(editBirthYear)) errs.birth = 'Введите целое число'
    if (!Number.isInteger(editDeathYear)) errs.death = 'Введите целое число'
    if (Number.isInteger(editBirthYear) && Number.isInteger(editDeathYear) && editBirthYear > editDeathYear) {
      errs.birth = 'Год рождения > года смерти'
      errs.death = 'Год смерти < года рождения'
    }
    setYearErrors(errs)
    if (errs.birth || errs.death) return null

    // Валидация периодов
    if (lifePeriods.length > 0) {
      const v = validateLifePeriodsClient(lifePeriods as any, payload.birthYear, payload.deathYear)
      if (!v.ok) { 
        setPeriodsError(v.message || 'Проверьте периоды')
        return null
      }
      setPeriodsError(null)
    }

    return { payload, lifePeriods: lifePeriods.map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) })) }
  }

  const trapFocus = (container: HTMLElement, e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusable = container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
    const list = Array.from(focusable).filter(el => el.offsetParent !== null)
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement as HTMLElement | null
    const shift = (e as any).shiftKey
    if (!shift && active === last) { e.preventDefault(); first.focus(); }
    else if (shift && active === first) { e.preventDefault(); last.focus(); }
  }

  useEffect(() => {
    if (isOpen) {
      lastFocusedBeforeModalRef.current = document.activeElement as HTMLElement
      setTimeout(() => { modalRef.current?.focus() }, 0)
    } else if (!isOpen && lastFocusedBeforeModalRef.current) {
      try { lastFocusedBeforeModalRef.current.focus() } catch {}
      lastFocusedBeforeModalRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000 }} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{ position: 'relative', background: 'rgba(44,24,16,0.98)', border: '1px solid rgba(139,69,19,0.5)', borderRadius: 8, padding: 16, minWidth: 360, maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (modalRef.current) trapFocus(modalRef.current, e) }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>Редактирование личности</div>
          <button onClick={onClose}>Отмена</button>
        </div>
        <form style={{ display: 'grid', gap: 8 }}>
          <PersonEditor
            person={person}
            editBirthYear={editBirthYear}
            setEditBirthYear={setEditBirthYear}
            editDeathYear={editDeathYear}
            setEditDeathYear={setEditDeathYear}
            editPersonCategory={editPersonCategory}
            setEditPersonCategory={setEditPersonCategory}
            categorySelectOptions={categorySelectOptions}
            lifePeriods={lifePeriods as any}
            setLifePeriods={setLifePeriods as any}
            countrySelectOptions={countrySelectOptions}
          />
          {(yearErrors.birth || yearErrors.death) && (
            <div style={{ color: '#ffaaaa', fontSize: 12 }}>
              {yearErrors.birth && <div>Год рождения: {yearErrors.birth}</div>}
              {yearErrors.death && <div>Год смерти: {yearErrors.death}</div>}
            </div>
          )}
          {periodsError && (
            <div style={{ color: '#ffaaaa', fontSize: 12 }}>{periodsError}</div>
          )}
          
          {/* Кнопки в зависимости от статуса и роли */}
          {isModerator ? (
            // Модераторы имеют одну кнопку
            <button 
              type="button" 
              disabled={saving || Boolean(yearErrors.birth || yearErrors.death || periodsError)}
              onClick={async () => {
                const data = validateAndGetPayload()
                if (!data) return
                
                setSaving(true)
                try {
                  await adminUpsertPerson(data.payload)
                  if (data.lifePeriods.length > 0) {
                    await apiFetch(`/api/persons/${encodeURIComponent(person.id)}/life-periods`, { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ periods: data.lifePeriods }) 
                    })
                  }
                  const fresh = await getPersonById(person.id)
                  if (fresh) onPersonUpdated(fresh as any)
                  showToast('Личность сохранена', 'success')
                  onClose()
                } catch (e: any) {
                  showToast(e?.message || 'Ошибка сохранения', 'error')
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
              const isDraft = person.status === 'draft'
              
              if (isDraft) {
                // Для черновиков - две кнопки
                return (
                  <DraftModerationButtons
                    mode="edit"
                    disabled={Boolean(yearErrors.birth || yearErrors.death || periodsError)}
                    saving={saving}
                    onSaveDraft={async () => {
                      const data = validateAndGetPayload()
                      if (!data || !onUpdateDraft) return
                      
                      setSaving(true)
                      try {
                        await onUpdateDraft(person.id, data.payload, data.lifePeriods)
                        showToast('Черновик сохранен', 'success')
                        // Вызываем callback для обновления данных
                        if (onSuccess) onSuccess()
                        onClose()
                      } catch (e: any) {
                        showToast(e?.message || 'Ошибка сохранения', 'error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    onSubmitModeration={async () => {
                      const data = validateAndGetPayload()
                      if (!data || !onSubmitDraft) return
                      
                      setSaving(true)
                      try {
                        await onSubmitDraft(person.id, data.payload, data.lifePeriods)
                        showToast('Черновик отправлен на модерацию', 'success')
                        // Вызываем callback для обновления данных
                        if (onSuccess) onSuccess()
                        onClose()
                      } catch (e: any) {
                        showToast(e?.message || 'Ошибка отправки', 'error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    showDescription={true}
                  />
                )
              } else {
                // Для опубликованных персон - одна кнопка
                return (
                  <button 
                    type="button"
                    disabled={saving || Boolean(yearErrors.birth || yearErrors.death || periodsError)}
                    onClick={async () => {
                      const data = validateAndGetPayload()
                      if (!data) return
                      
                      setSaving(true)
                      try {
                        await onProposeEdit(person.id, data.payload, data.lifePeriods)
                        showToast('Изменения отправлены на модерацию', 'success')
                        // Вызываем callback для обновления данных
                        if (onSuccess) onSuccess()
                        onClose()
                      } catch (e: any) {
                        showToast(e?.message || 'Ошибка отправки', 'error')
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



