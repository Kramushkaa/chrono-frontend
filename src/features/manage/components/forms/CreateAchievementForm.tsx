import React, { useState, useMemo, useEffect } from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'
import { DraftModerationButtons } from 'shared/ui/DraftModerationButtons'
import 'shared/styles/FormControls.css'

type CountryOption = { id: number; name: string }

interface CreateAchievementFormProps {
  countryOptions: CountryOption[]
  personOptions: SelectOption[]
  personsSelectLoading: boolean
  onSearchPersons: (q: string) => Promise<void>
  onSubmit: (payload: {
    year: number
    description: string
    wikipedia_url: string | null
    image_url: string | null
    personId?: string
    countryId?: number | null
    saveAsDraft?: boolean
  }) => Promise<void>
}

export function CreateAchievementForm({
  countryOptions,
  personOptions,
  personsSelectLoading,
  onSearchPersons,
  onSubmit,
}: CreateAchievementFormProps) {
  const [isGlobal, setIsGlobal] = useState(false)
  const [selectedCountryId, setSelectedCountryId] = useState<string>('')
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')

  const countrySelectOptions = useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )

  useEffect(() => {
    if (!selectedPersonId && personOptions.length > 0) {
      const defaultId =
        typeof window !== 'undefined' && window && (window as any).__E2E_DEFAULT_PERSON__
          ? String((window as any).__E2E_DEFAULT_PERSON__)
          : personOptions[0].value
      const match = personOptions.find((opt) => opt.value === defaultId)
      setSelectedPersonId(match ? match.value : personOptions[0].value)
    } else if (!selectedPersonId && personOptions.length === 0 && !personsSelectLoading) {
      // Если опции пустые и не идет загрузка, пробуем перезагрузить
      onSearchPersons('')
    }
  }, [personOptions, selectedPersonId, personsSelectLoading, onSearchPersons])

  const extractFormData = () => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form) return null

    const fd = new FormData(form)
    const year = Number(fd.get('year') || 0)
    const description = String(fd.get('description') || '').trim()
    const wikipedia_url = String(fd.get('wikipedia_url') || '') || null
    const image_url = String(fd.get('image_url') || '') || null

    if (!description || year === 0) {
      return null
    }

    return { year, description, wikipedia_url, image_url }
  }

  const handleSubmit = async (saveAsDraft: boolean) => {
    const data = extractFormData()
    if (!data) return

    const payload = {
      ...data,
      personId: selectedPersonId || undefined,
      countryId: selectedCountryId ? Number(selectedCountryId) : null,
      saveAsDraft,
    }

    await onSubmit(payload)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(false)
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      aria-labelledby="create-achievement-title"
      className="formGrid"
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          id="achievement-is-global"
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
          <div style={{ flex: '1 1 260px', minWidth: 260 }}>
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
        <label htmlFor="achievement-year" className="formLabel">
          Год <span aria-label="обязательное поле" className="formRequired">*</span>
        </label>
        <input
          id="achievement-year"
          name="year"
          type="number"
          placeholder="Год"
          required
          aria-required="true"
          className="formInput"
        />
      </div>

      <div>
        <label htmlFor="achievement-description" className="formLabel">
          Описание <span aria-label="обязательное поле" className="formRequired">*</span>
        </label>
        <textarea
          id="achievement-description"
          name="description"
          placeholder="Описание достижения"
          rows={4}
          required
          aria-required="true"
          className="formTextarea"
        />
      </div>

      <div>
        <label htmlFor="achievement-wiki" className="formLabel">
          Ссылка на Википедию (необязательно)
        </label>
        <input
          id="achievement-wiki"
          name="wikipedia_url"
          type="url"
          placeholder="https://ru.wikipedia.org/wiki/..."
          className="formInput"
        />
      </div>

      <div>
        <label htmlFor="achievement-image" className="formLabel">
          URL изображения (необязательно)
        </label>
        <input
          id="achievement-image"
          name="image_url"
          type="url"
          placeholder="https://example.com/image.jpg"
          className="formInput"
        />
      </div>

      <DraftModerationButtons
        mode="create"
        onSaveDraft={() => handleSubmit(true)}
        onSubmitModeration={() => handleSubmit(false)}
        showDescription={true}
      />
    </form>
  )
}




