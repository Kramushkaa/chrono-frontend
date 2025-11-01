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
      aria-labelledby="create-person-title"
      style={{
        display: 'grid',
        gap: 'clamp(8px, 2vw, 12px)',
        maxWidth: '100%',
      }}
    >
      <div>
        <label htmlFor="person-name" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
          Имя <span aria-label="обязательное поле">*</span>
        </label>
        <input
          id="person-name"
          name="name"
          placeholder="Имя"
          required
          aria-required="true"
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(8px, 2vw, 12px)',
        }}
      >
        <div>
          <label htmlFor="person-birth-year" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
            Год рождения <span aria-label="обязательное поле">*</span>
          </label>
          <input
            id="person-birth-year"
            name="birthYear"
            type="number"
            placeholder="Год рождения"
            required
            aria-required="true"
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
        </div>
        <div>
          <label htmlFor="person-death-year" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
            Год смерти <span aria-label="обязательное поле">*</span>
          </label>
          <input
            id="person-death-year"
            name="deathYear"
            type="number"
            placeholder="Год смерти"
            required
            aria-required="true"
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
        <label htmlFor="life-periods-section" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
          Страны проживания
        </label>
        <div style={{ marginTop: 8 }}>
          <button 
            type="button" 
            onClick={handleAddCountry}
            aria-label="Добавить страну проживания в список"
          >
            + Добавить страну проживания
          </button>
        </div>
        {lifePeriods.length > 0 && (
          <div id="life-periods-section" aria-label="Список периодов проживания">
            <LifePeriodsEditor
              periods={lifePeriods}
              onChange={setLifePeriods}
              options={countrySelectOptions}
              minYear={typeof birthYear === 'number' ? birthYear : undefined}
              maxYear={typeof deathYear === 'number' ? deathYear : undefined}
              disableDeleteWhenSingle
            />
          </div>
        )}
        {periodsError && (
          <div 
            role="alert" 
            aria-live="polite"
            style={{ fontSize: 12, color: '#d32f2f', marginTop: 4 }}
          >
            {periodsError}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="person-image-url" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
          URL изображения (необязательно)
        </label>
        <input
          id="person-image-url"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          aria-describedby="image-url-hint"
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <span id="image-url-hint" style={{ fontSize: 11, opacity: 0.7, display: 'block', marginTop: 2 }}>
          Ссылка на изображение личности
        </span>
      </div>

      <div>
        <label htmlFor="person-wiki-link" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
          Ссылка на Википедию (необязательно)
        </label>
        <input
          id="person-wiki-link"
          name="wikiLink"
          type="url"
          placeholder="https://ru.wikipedia.org/wiki/..."
          aria-describedby="wiki-link-hint"
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <span id="wiki-link-hint" style={{ fontSize: 11, opacity: 0.7, display: 'block', marginTop: 2 }}>
          Ссылка на статью в Википедии
        </span>
      </div>

      <div>
        <label htmlFor="person-description" style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>
          Описание
        </label>
        <textarea
          id="person-description"
          name="description"
          placeholder="Краткое описание личности и её вклада"
          rows={6}
          aria-describedby="description-hint"
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
        <span id="description-hint" style={{ fontSize: 11, opacity: 0.7, display: 'block', marginTop: 2 }}>
          Опишите основные достижения и вклад личности
        </span>
      </div>

      <DraftModerationButtons
        mode="create"
        onSaveDraft={() => validateAndSubmit(true)}
        onSubmitModeration={() => validateAndSubmit(false)}
        showDescription={true}
      />
    </form>
  )
}




