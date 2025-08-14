import React, { useEffect, useRef, useState } from 'react'
import { Person } from 'shared/types'
import { PersonEditor } from './PersonEditor'
import { validateLifePeriodsClient } from 'shared/utils/validation'
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
}

export function PersonEditModal(props: Props) {
  const { isOpen, onClose, person, isModerator, editBirthYear, setEditBirthYear, editDeathYear, setEditDeathYear, editPersonCategory, setEditPersonCategory, categorySelectOptions, lifePeriods, setLifePeriods, countrySelectOptions, showToast, onPersonUpdated, onProposeEdit } = props
  const [saving, setSaving] = useState(false)
  const [yearErrors, setYearErrors] = useState<{ birth?: string; death?: string }>({})
  const [periodsError, setPeriodsError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedBeforeModalRef = useRef<HTMLElement | null>(null)

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
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const form = e.currentTarget as HTMLFormElement
            const fd = new FormData(form)
            const payload = {
              id: person.id,
              name: String(fd.get('name') || '').trim(),
              birthYear: Number(editBirthYear),
              deathYear: Number(editDeathYear),
              category: editPersonCategory || String(fd.get('category') || person.category),
              country: (() => {
                const chosen = countrySelectOptions.find(c => String(c.value) === String(fd.get('countryId') || ''))?.label
                return chosen || person.country
              })(),
              description: String(fd.get('description') || person.description),
              imageUrl: String(fd.get('imageUrl') || person.imageUrl || '') || null,
              wikiLink: String(fd.get('wikiLink') || person.wikiLink || '') || null,
            }
            const errs: { birth?: string; death?: string } = {}
            if (!Number.isInteger(editBirthYear)) errs.birth = 'Введите целое число'
            if (!Number.isInteger(editDeathYear)) errs.death = 'Введите целое число'
            if (Number.isInteger(editBirthYear) && Number.isInteger(editDeathYear) && editBirthYear > editDeathYear) {
              errs.birth = 'Год рождения > года смерти'
              errs.death = 'Год смерти < года рождения'
            }
            setYearErrors(errs)
            if (errs.birth || errs.death) return
            if (lifePeriods.length > 0) {
              const v = validateLifePeriodsClient(lifePeriods as any, payload.birthYear, payload.deathYear)
              if (!v.ok) { setPeriodsError(v.message || 'Проверьте периоды'); return }
              setPeriodsError(null)
            }
            setSaving(true)
            try {
              if (isModerator) {
                await adminUpsertPerson(payload)
                if (lifePeriods.length > 0) {
                  const normalized = lifePeriods.map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                  await apiFetch(`/api/persons/${encodeURIComponent(person.id)}/life-periods`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: normalized }) })
                }
                const fresh = await getPersonById(person.id)
                if (fresh) onPersonUpdated(fresh as any)
                showToast('Личность сохранена', 'success')
              } else {
                const next = lifePeriods.map(lp => ({ country_id: Number(lp.countryId), start_year: Number(lp.start), end_year: Number(lp.end) }))
                await onProposeEdit(person.id, payload, next)
                showToast('Личность отправлена на модерацию', 'success')
              }
              onClose()
            } catch (e: any) {
              showToast(e?.message || 'Ошибка сохранения', 'error')
            } finally {
              setSaving(false)
            }
          }}
          style={{ display: 'grid', gap: 8 }}
        >
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
          <button type="submit" disabled={saving || Boolean(yearErrors.birth || yearErrors.death || periodsError)}>
            {saving ? 'Сохраняем…' : isModerator ? 'Сохранить (модератор)' : 'Отправить на модерацию'}
          </button>
        </form>
      </div>
    </div>
  )
}



