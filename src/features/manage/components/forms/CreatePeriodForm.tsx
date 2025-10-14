import React, { useState, useMemo } from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'

type CountryOption = { id: number; name: string }

interface CreatePeriodFormProps {
  countryOptions: CountryOption[]
  personOptions: SelectOption[]
  personsSelectLoading: boolean
  onSearchPersons: (q: string) => Promise<void>
  onSubmit: (payload: {
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

export function CreatePeriodForm({
  countryOptions,
  personOptions,
  personsSelectLoading,
  onSearchPersons,
  onSubmit,
}: CreatePeriodFormProps) {
  const [name, setName] = useState<string>('')
  const [startYear, setStartYear] = useState<number | ''>('')
  const [endYear, setEndYear] = useState<number | ''>('')
  const [type, setType] = useState<'reign' | 'life'>('reign')
  const [description, setDescription] = useState<string>('')
  const [countryId, setCountryId] = useState<string>('')
  const [personId, setPersonId] = useState<string>('')

  const countrySelectOptions = useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )

  const validateAndSubmit = async (saveAsDraft: boolean) => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const startYearNum = Number(startYear)
    const endYearNum = Number(endYear)

    if (!trimmedName || !trimmedDescription || startYear === '' || endYear === '') {
      return
    }

    if (!personId) {
      alert('Необходимо выбрать личность')
      return
    }

    // Для периодов типов "life" и "reign" обязательно привязка к личности
    if ((type === 'life' || type === 'reign') && !personId) {
      alert('Для периодов типов "Жизнь" и "Правление" обязательно нужно выбрать личность')
      return
    }

    const payload = {
      name: trimmedName,
      startYear: startYearNum,
      endYear: endYearNum,
      description: trimmedDescription,
      type,
      countryId: countryId ? Number(countryId) : null,
      personId,
      saveAsDraft,
    }

    await onSubmit(payload)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await validateAndSubmit(false)
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
      <input
        name="name"
        placeholder="Название периода"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
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
          name="startYear"
          type="number"
          placeholder="Год начала"
          required
          value={startYear}
          onChange={(e) => setStartYear(e.target.value === '' ? '' : Number(e.target.value))}
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
          name="endYear"
          type="number"
          placeholder="Год окончания"
          required
          value={endYear}
          onChange={(e) => setEndYear(e.target.value === '' ? '' : Number(e.target.value))}
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
        <label
          style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Личность <span style={{ color: 'red' }}>*</span>
        </label>
        <SearchableSelect
          placeholder="Выбрать личность"
          value={personId}
          options={personOptions}
          isLoading={personsSelectLoading}
          onChange={(val) => setPersonId(val)}
          onSearchChange={(q) => onSearchPersons(q)}
          locale="ru"
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Тип периода
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'reign' | 'life')}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        >
          <option value="reign">Правление</option>
          <option value="life">Жизнь</option>
        </select>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Страна (необязательно)
        </label>
        <SearchableSelect
          placeholder="Выбрать страну"
          value={countryId}
          options={countrySelectOptions}
          onChange={(val) => setCountryId(val)}
          locale="ru"
        />
      </div>

      <textarea
        name="description"
        placeholder="Описание периода"
        rows={4}
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
          onClick={() => validateAndSubmit(true)}
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

