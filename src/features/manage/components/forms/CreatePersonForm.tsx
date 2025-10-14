import React, { useState, useMemo } from 'react'
import { SearchableSelect } from 'shared/ui/SearchableSelect'
import { LifePeriodsEditor } from 'features/persons/components/LifePeriodsEditor'
import { validateLifePeriodsClient } from 'shared/utils/validation'
import { DraftModerationButtons } from 'shared/ui/DraftModerationButtons'

type CountryOption = { id: number; name: string }

type LifePeriod = { countryId: string; start: number | ''; end: number | '' }

interface CreatePersonFormProps {
  categories: string[]
  countryOptions: CountryOption[]
  onSubmit: (payload: {
    id: string
    name: string
    birthYear: number
    deathYear: number
    category: string
    description: string
    imageUrl: string | null
    wikiLink: string | null
    lifePeriods: LifePeriod[]
    saveAsDraft?: boolean
  }) => Promise<void>
}

export function CreatePersonForm({ categories, countryOptions, onSubmit }: CreatePersonFormProps) {
  const [lifePeriods, setLifePeriods] = useState<LifePeriod[]>([{ countryId: '', start: '', end: '' }])
  const [birthYear, setBirthYear] = useState<number | ''>('')
  const [deathYear, setDeathYear] = useState<number | ''>('')
  const [category, setCategory] = useState<string>('')
  const [periodsError, setPeriodsError] = useState<string | null>(null)

  const countrySelectOptions = useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )
  const categorySelectOptions = useMemo(() => categories.map((c) => ({ value: c, label: c })), [categories])

  const handleAddCountry = () => {
    const used = new Set(lifePeriods.map((lp) => lp.countryId))
    const next = countrySelectOptions.find((opt) => !used.has(opt.value))?.value || ''
    const by = typeof birthYear === 'number' ? birthYear : 0
    const dy = typeof deathYear === 'number' ? deathYear : 0
    setLifePeriods((prev) => [...prev, { countryId: next, start: by, end: dy }])
  }

  const extractFormData = () => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form) return null

    const fd = new FormData(form)
    const name = String(fd.get('name') || '').trim()
    const birthStr = String(fd.get('birthYear') || '').trim()
    const deathStr = String(fd.get('deathYear') || '').trim()
    const birthYearNum = Number(birthStr)
    const deathYearNum = Number(deathStr)
    const categoryVal = category || String(fd.get('category') || '').trim()
    const description = String(fd.get('description') || '').trim()
    const imageUrl = String(fd.get('imageUrl') || '') || null
    const wikiLink = String(fd.get('wikiLink') || '') || null

    if (!name || birthStr === '' || deathStr === '') {
      return null
    }

    return {
      name,
      birthYear: birthYearNum,
      deathYear: deathYearNum,
      category: categoryVal,
      description,
      imageUrl,
      wikiLink,
    }
  }

  const validateAndSubmit = async (saveAsDraft: boolean) => {
    const data = extractFormData()
    if (!data) return

    // Для черновиков валидация периодов не обязательна, но если есть - должны быть корректными
    const requirePeriods = !saveAsDraft
    if (lifePeriods.length > 0 || requirePeriods) {
      const periodsValidation = validateLifePeriodsClient(lifePeriods, data.birthYear, data.deathYear, requirePeriods)
      if (!periodsValidation.ok) {
        setPeriodsError(periodsValidation.message || 'Проверьте периоды жизни')
        return
      }
    }
    setPeriodsError(null)

    const payload = {
      id: '', // генерируется снаружи по slug
      ...data,
      lifePeriods,
      saveAsDraft,
    }

    await onSubmit(payload)
  }

  return (
    <form
      style={{
        display: 'grid',
        gap: 'clamp(8px, 2vw, 12px)',
        maxWidth: '100%',
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
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(8px, 2vw, 12px)',
        }}
      >
        <input
          name="birthYear"
          type="number"
          placeholder="Год рождения"
          required
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <input
          name="deathYear"
          type="number"
          placeholder="Год смерти"
          required
          value={deathYear}
          onChange={(e) => setDeathYear(e.target.value === '' ? '' : Number(e.target.value))}
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Род деятельности</label>
        <SearchableSelect
          placeholder="Выбрать род деятельности"
          value={category}
          options={categorySelectOptions}
          onChange={(val) => setCategory(val)}
          locale="ru"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Страны проживания</label>
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={handleAddCountry}>
            + Добавить страну проживания
          </button>
        </div>
        {lifePeriods.length > 0 && (
          <LifePeriodsEditor
            periods={lifePeriods}
            onChange={setLifePeriods}
            options={countrySelectOptions}
            minYear={typeof birthYear === 'number' ? birthYear : undefined}
            maxYear={typeof deathYear === 'number' ? deathYear : undefined}
            disableDeleteWhenSingle
          />
        )}
        {periodsError && (
          <div style={{ fontSize: 12, color: '#d32f2f', marginTop: 4 }}>{periodsError}</div>
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
          boxSizing: 'border-box',
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
          boxSizing: 'border-box',
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
          minHeight: '120px',
        }}
      />

      <DraftModerationButtons
        mode="create"
        onSaveDraft={() => validateAndSubmit(true)}
        onSubmitModeration={() => validateAndSubmit(false)}
        showDescription={true}
      />
    </form>
  )
}

