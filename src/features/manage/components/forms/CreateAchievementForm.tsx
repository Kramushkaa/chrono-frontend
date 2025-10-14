import React, { useState, useMemo } from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'

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
      style={{
        display: 'grid',
        gap: 'clamp(8px, 2vw, 12px)',
        maxWidth: '100%',
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={isGlobal}
          disabled={!!selectedPersonId || !!selectedCountryId}
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

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', minWidth: 260 }}>
          <SearchableSelect
            placeholder="Выбрать личность"
            value={selectedPersonId}
            disabled={isGlobal || !!selectedCountryId}
            options={personOptions}
            isLoading={personsSelectLoading}
            locale="ru"
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
          <SearchableSelect
            placeholder="Выбрать страну"
            value={selectedCountryId}
            disabled={isGlobal || !!selectedPersonId}
            options={countrySelectOptions}
            locale="ru"
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
          boxSizing: 'border-box',
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
          minHeight: '100px',
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
          boxSizing: 'border-box',
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
          boxSizing: 'border-box',
        }}
      />

      <div
        className="modal-button-group"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(8px, 2vw, 12px)',
        }}
      >
        <button
          type="button"
          className="modal-button"
          onClick={() => handleSubmit(true)}
          style={{
            padding: 'clamp(12px, 3vw, 16px)',
            background: '#6c757d',
            border: '1px solid #6c757d',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            fontWeight: '500',
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
            fontWeight: '500',
          }}
        >
          Отправить на модерацию
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.8, textAlign: 'center' }}>
        Черновик можно будет редактировать и отправить на модерацию позже
      </div>
    </form>
  )
}

