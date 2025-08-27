import React, { useEffect, useMemo, useState } from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'
import { LifePeriodsEditor } from 'features/persons/components/LifePeriodsEditor'
import { validateLifePeriodsClient } from 'shared/utils/validation'
import { DraftModerationButtons } from 'shared/ui/DraftModerationButtons'
import { Modal } from 'shared/ui/Modal'

type CountryOption = { id: number; name: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  type: 'person' | 'achievement' | 'period'

  // Person form
  categories: string[]
  countryOptions: CountryOption[]
  onCreatePerson: (payload: {
    id: string
    name: string
    birthYear: number
    deathYear: number
    category: string
    description: string
    imageUrl: string | null
    wikiLink: string | null
    lifePeriods: Array<{ countryId: string; start: number | ''; end: number | '' }>
    saveAsDraft?: boolean
  }) => Promise<void>

  // Achievement form
  personOptions: SelectOption[]
  personsSelectLoading: boolean
  onSearchPersons: (q: string) => Promise<void>
  onCreateAchievement: (payload: {
    year: number
    description: string
    wikipedia_url: string | null
    image_url: string | null
    personId?: string
    countryId?: number | null
    saveAsDraft?: boolean
  }) => Promise<void>

  // Period form
  onCreatePeriod: (payload: {
    name: string
    startYear: number
    endYear: number
    description: string
    type: 'reign' | 'life'
    countryId?: number | null
    personId?: string
    saveAsDraft?: boolean
  }) => Promise<void>
}

export function CreateEntityModal(props: Props) {
  const { isOpen, onClose, type, categories, countryOptions, onCreatePerson, personOptions, personsSelectLoading, onSearchPersons, onCreateAchievement, onCreatePeriod } = props
  const [newLifePeriods, setNewLifePeriods] = useState<Array<{ countryId: string; start: number | ''; end: number | '' }>>([])
  const [newBirthYear, setNewBirthYear] = useState<number | ''>('')
  const [newDeathYear, setNewDeathYear] = useState<number | ''>('')
  const [periodsError, setPeriodsError] = useState<string | null>(null)
  // Local inline validation removed; rely on parent handlers
  const [newPersonCategory, setNewPersonCategory] = useState<string>('')

  const [achIsGlobal, setAchIsGlobal] = useState(false)
  const [achSelectedCountryId, setAchSelectedCountryId] = useState<string>('')
  const [achSelectedPersonId, setAchSelectedPersonId] = useState<string>('')

  // Period form state
  const [periodName, setPeriodName] = useState<string>('')
  const [periodStartYear, setPeriodStartYear] = useState<number | ''>('')
  const [periodEndYear, setPeriodEndYear] = useState<number | ''>('')
  const [periodType, setPeriodType] = useState<'reign' | 'life'>('reign')
  const [periodDescription, setPeriodDescription] = useState<string>('')
  const [periodCountryId, setPeriodCountryId] = useState<string>('')
  const [periodPersonId, setPeriodPersonId] = useState<string>('')

  const countrySelectOptions = useMemo(() => countryOptions.map(c => ({ value: String(c.id), label: c.name })), [countryOptions])
  const categorySelectOptions = useMemo(() => categories.map(c => ({ value: c, label: c })), [categories])

  useEffect(() => {
    if (isOpen) {
      if (type === 'person' && newLifePeriods.length === 0) setNewLifePeriods([{ countryId: '', start: '', end: '' }])
      setPeriodsError(null) // Очистить ошибки при открытии
    }
  }, [isOpen, type, newLifePeriods.length])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title={type === 'person' ? 'Новая личность' : type === 'achievement' ? 'Новое достижение' : 'Новый период'}
    >
      <div
        className="modal-form"
        style={{ 
          display: 'grid', 
          gap: 'clamp(8px, 2vw, 12px)',
          maxWidth: '100%'
        }}
      >
        {type === 'person' ? (
          <form style={{ 
            display: 'grid', 
            gap: 'clamp(8px, 2vw, 12px)',
            maxWidth: '100%'
          }}
          >
            <input 
              name="name" 
              placeholder="Имя" 
              required 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(8px, 2vw, 12px)'
            }}>
              <input 
                name="birthYear" 
                type="number" 
                placeholder="Год рождения" 
                required 
                value={newBirthYear} 
                onChange={(e) => setNewBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <input 
                name="deathYear" 
                type="number" 
                placeholder="Год смерти" 
                required 
                value={newDeathYear} 
                onChange={(e) => setNewDeathYear(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {/* Inline errors removed; parent handles validation */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Род деятельности</label>
              <SearchableSelect
                placeholder="Выбрать род деятельности"
                value={newPersonCategory}
                options={categorySelectOptions}
                onChange={(val) => setNewPersonCategory(val)}
                locale="ru"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Страны проживания</label>
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={() => {
                  const used = new Set(newLifePeriods.map(lp => lp.countryId))
                  const next = countrySelectOptions.find(opt => !used.has(opt.value))?.value || ''
                  const by = typeof newBirthYear === 'number' ? newBirthYear : 0
                  const dy = typeof newDeathYear === 'number' ? newDeathYear : 0
                  setNewLifePeriods(prev => [...prev, { countryId: next, start: by, end: dy }])
                }}>+ Добавить страну проживания</button>
              </div>
              {newLifePeriods.length > 0 && (
                <LifePeriodsEditor
                  periods={newLifePeriods}
                  onChange={setNewLifePeriods}
                  options={countrySelectOptions}
                  minYear={typeof newBirthYear === 'number' ? newBirthYear : undefined}
                  maxYear={typeof newDeathYear === 'number' ? newDeathYear : undefined}
                  disableDeleteWhenSingle
                />
              )}
              {periodsError && (
                <div style={{ fontSize: 12, color: '#d32f2f', marginTop: 4 }}>
                  {periodsError}
                </div>
              )}
            </div>
            <input 
              name="imageUrl" 
              placeholder="URL изображения (необязательно)" 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <input 
              name="wikiLink" 
              placeholder="Ссылка на Википедию (необязательно)" 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <textarea 
              name="description" 
              placeholder="Описание" 
              rows={6} 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '120px'
              }}
            />
            <DraftModerationButtons
              mode="create"
              onSaveDraft={async () => {
                const fd = new FormData(document.querySelector('form') as HTMLFormElement)
                const name = String(fd.get('name') || '').trim()
                const birthStr = String(fd.get('birthYear') || '').trim()
                const deathStr = String(fd.get('deathYear') || '').trim()
                const birthYear = Number(birthStr)
                const deathYear = Number(deathStr)
                const category = (newPersonCategory || String(fd.get('category') || '').trim())
                const description = String(fd.get('description') || '').trim()
                const imageUrl = String(fd.get('imageUrl') || '') || null
                const wikiLink = String(fd.get('wikiLink') || '') || null
                if (!name) return
                if (birthStr === '' || deathStr === '') return
                
                // Для черновиков валидация периодов не обязательна, но если есть - должны быть корректными
                if (newLifePeriods.length > 0) {
                  const periodsValidation = validateLifePeriodsClient(newLifePeriods, birthYear, deathYear, false)
                  if (!periodsValidation.ok) {
                    setPeriodsError(periodsValidation.message || 'Проверьте периоды жизни')
                    return
                  }
                }
                setPeriodsError(null)
                
                const payload = {
                  id: '', // генерируется снаружи по slug
                  name, birthYear, deathYear, category, description, imageUrl, wikiLink, lifePeriods: newLifePeriods, saveAsDraft: true
                }
                await onCreatePerson(payload)
              }}
              onSubmitModeration={async () => {
                // Используем логику из onSubmit формы
                const fd = new FormData(document.querySelector('form') as HTMLFormElement)
                const name = String(fd.get('name') || '').trim()
                const birthStr = String(fd.get('birthYear') || '').trim()
                const deathStr = String(fd.get('deathYear') || '').trim()
                const birthYear = Number(birthStr)
                const deathYear = Number(deathStr)
                const category = (newPersonCategory || String(fd.get('category') || '').trim())
                const description = String(fd.get('description') || '').trim()
                const imageUrl = String(fd.get('imageUrl') || '') || null
                const wikiLink = String(fd.get('wikiLink') || '') || null
                if (!name) return
                if (birthStr === '' || deathStr === '') return
                
                // Валидация периодов жизни (требуется для отправки на модерацию)
                const periodsValidation = validateLifePeriodsClient(newLifePeriods, birthYear, deathYear, true)
                if (!periodsValidation.ok) {
                  setPeriodsError(periodsValidation.message || 'Проверьте периоды жизни')
                  return
                }
                setPeriodsError(null)
                
                const payload = {
                  id: '', // генерируется снаружи по slug
                  name, birthYear, deathYear, category, description, imageUrl, wikiLink, lifePeriods: newLifePeriods, saveAsDraft: false
                }
                await onCreatePerson(payload)
              }}
              showDescription={true}
            />
          </form>
        ) : type === 'achievement' ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget as HTMLFormElement)
              const year = Number(fd.get('year') || 0)
              const description = String(fd.get('description') || '').trim()
              const wikipedia_url = String(fd.get('wikipedia_url') || '') || null
              const image_url = String(fd.get('image_url') || '') || null
              const personId = achSelectedPersonId || undefined
              const countryId = achSelectedCountryId ? Number(achSelectedCountryId) : null
              await onCreateAchievement({ year, description, wikipedia_url, image_url, personId, countryId, saveAsDraft: false })
            }}
            style={{ 
              display: 'grid', 
              gap: 'clamp(8px, 2vw, 12px)',
              maxWidth: '100%'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={achIsGlobal} disabled={!!achSelectedPersonId || !!achSelectedCountryId} onChange={(e) => { const v = e.target.checked; setAchIsGlobal(v); if (v) { setAchSelectedPersonId(''); setAchSelectedCountryId(''); } }} /> Глобальное событие
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', minWidth: 260 }}>
                <SearchableSelect
                  placeholder="Выбрать личность"
                  value={achSelectedPersonId}
                  disabled={achIsGlobal || !!achSelectedCountryId}
                  options={personOptions}
                  isLoading={personsSelectLoading}
                  locale="ru"
                  onChange={(val) => { setAchSelectedPersonId(val); if (val) { setAchIsGlobal(false); setAchSelectedCountryId('') } }}
                  onSearchChange={(q) => onSearchPersons(q)}
                />
              </div>
              <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                <SearchableSelect
                  placeholder="Выбрать страну"
                  value={achSelectedCountryId}
                  disabled={achIsGlobal || !!achSelectedPersonId}
                  options={countrySelectOptions}
                  locale="ru"
                  onChange={(val) => { setAchSelectedCountryId(val); if (val) { setAchIsGlobal(false); setAchSelectedPersonId('') } }}
                />
              </div>
            </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Можно выбрать только одно: «Глобальное событие», «Выбрать личность» или «Выбрать страну».
              </div>
            <input 
              name="year" 
              type="number" 
              placeholder="Год" 
              required 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <textarea 
              name="description" 
              placeholder="Описание" 
              rows={4} 
              required 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
            <input 
              name="wikipedia_url" 
              placeholder="Ссылка на Википедию (необязательно)" 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <input 
              name="image_url" 
              placeholder="URL изображения (необязательно)" 
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <div className="modal-button-group" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(8px, 2vw, 12px)'
            }}>
              <button 
                type="button"
                className="modal-button"
                onClick={async () => {
                  const fd = new FormData(document.querySelector('form') as HTMLFormElement)
                  const year = Number(fd.get('year') || 0)
                  const description = String(fd.get('description') || '').trim()
                  const wikipedia_url = String(fd.get('wikipedia_url') || '') || null
                  const image_url = String(fd.get('image_url') || '') || null
                  const personId = achSelectedPersonId || undefined
                  const countryId = achSelectedCountryId ? Number(achSelectedCountryId) : null
                  await onCreateAchievement({ year, description, wikipedia_url, image_url, personId, countryId, saveAsDraft: true })
                }}
                style={{ 
                  padding: 'clamp(12px, 3vw, 16px)', 
                  background: '#6c757d', 
                  border: '1px solid #6c757d', 
                  borderRadius: '8px', 
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '500'
                }}
              >
                Сохранить как черновик
              </button>
              <button 
                type="submit"
                className="modal-button"
                style={{ 
                  padding: 'clamp(12px, 3vw, 16px)', 
                  background: '#4CAF50', 
                  border: '1px solid #4CAF50', 
                  borderRadius: '8px', 
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '500'
                }}
              >
                Отправить на модерацию
              </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, textAlign: 'center' }}>
              Черновик можно будет редактировать и отправить на модерацию позже
            </div>
          </form>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const name = periodName.trim()
              const startYear = Number(periodStartYear)
              const endYear = Number(periodEndYear)
              const description = periodDescription.trim()
              const type = periodType
              const countryId = periodCountryId ? Number(periodCountryId) : null
              const personId = periodPersonId

              if (!personId) {
                alert('Необходимо выбрать личность')
                return
              }

              // Для периодов типов "life" и "ruler" обязательно привязка к личности
              if ((type === 'life' || type === 'reign') && !personId) {
                alert('Для периодов типов "Жизнь" и "Правление" обязательно нужно выбрать личность')
                return
              }

              await onCreatePeriod({ name, startYear, endYear, description, type, countryId, personId, saveAsDraft: false })
            }}
            style={{ 
              display: 'grid', 
              gap: 'clamp(8px, 2vw, 12px)',
              maxWidth: '100%'
            }}
          >
            <input 
              name="name" 
              placeholder="Название периода" 
              required 
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(8px, 2vw, 12px)'
            }}>
              <input 
                name="startYear" 
                type="number" 
                placeholder="Год начала" 
                required 
                value={periodStartYear}
                onChange={(e) => setPeriodStartYear(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <input 
                name="endYear" 
                type="number" 
                placeholder="Год окончания" 
                required 
                value={periodEndYear}
                onChange={(e) => setPeriodEndYear(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'clamp(4px, 1vw, 8px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                opacity: 0.9,
                fontWeight: '500'
              }}>Личность <span style={{ color: 'red' }}>*</span></label>
              <SearchableSelect
                placeholder="Выбрать личность"
                value={periodPersonId}
                options={personOptions}
                isLoading={personsSelectLoading}
                onChange={(val) => setPeriodPersonId(val)}
                onSearchChange={(q) => onSearchPersons(q)}
                locale="ru"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'clamp(4px, 1vw, 8px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                opacity: 0.9,
                fontWeight: '500'
              }}>Тип периода</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as 'reign' | 'life')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              >
                <option value="reign">Правление</option>
                <option value="life">Жизнь</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: 'clamp(4px, 1vw, 8px)', 
                fontSize: 'clamp(12px, 3vw, 14px)', 
                opacity: 0.9,
                fontWeight: '500'
              }}>Страна (необязательно)</label>
              <SearchableSelect
                placeholder="Выбрать страну"
                value={periodCountryId}
                options={countrySelectOptions}
                onChange={(val) => setPeriodCountryId(val)}
                locale="ru"
              />
            </div>
            <textarea 
              name="description" 
              placeholder="Описание периода" 
              rows={4} 
              required 
              value={periodDescription}
              onChange={(e) => setPeriodDescription(e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
            <div className="modal-button-group" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(8px, 2vw, 12px)'
            }}>
              <button 
                type="button"
                className="modal-button"
                onClick={async () => {
                  const name = periodName.trim()
                  const startYear = Number(periodStartYear)
                  const endYear = Number(periodEndYear)
                  const description = periodDescription.trim()
                  const type = periodType
                  const countryId = periodCountryId ? Number(periodCountryId) : null
                  const personId = periodPersonId

                  if (!personId) {
                    alert('Необходимо выбрать личность')
                    return
                  }

                  // Для периодов типов "life" и "ruler" обязательно привязка к личности
                  if ((type === 'life' || type === 'reign') && !personId) {
                    alert('Для периодов типов "Жизнь" и "Правление" обязательно нужно выбрать личность')
                    return
                  }

                  await onCreatePeriod({ name, startYear, endYear, description, type, countryId, personId, saveAsDraft: true })
                }}
                style={{ 
                  padding: 'clamp(12px, 3vw, 16px)', 
                  background: '#6c757d', 
                  border: '1px solid #6c757d', 
                  borderRadius: '8px', 
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '500'
                }}
              >
                Сохранить как черновик
              </button>
              <button 
                type="submit"
                className="modal-button"
                style={{ 
                  padding: 'clamp(12px, 3vw, 16px)', 
                  background: '#4CAF50', 
                  border: '1px solid #4CAF50', 
                  borderRadius: '8px', 
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '500'
                }}
              >
                Отправить на модерацию
              </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, textAlign: 'center' }}>
              Черновик можно будет редактировать и отправить на модерацию позже
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}



