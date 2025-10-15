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
  const [validationError, setValidationError] = useState<string>('')

  const countrySelectOptions = useMemo(
    () => countryOptions.map((c) => ({ value: String(c.id), label: c.name })),
    [countryOptions]
  )

  const validateAndSubmit = async (saveAsDraft: boolean) => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const startYearNum = Number(startYear)
    const endYearNum = Number(endYear)

    // Сброс ошибки валидации
    setValidationError('')

    if (!trimmedName || !trimmedDescription || startYear === '' || endYear === '') {
      setValidationError('Пожалуйста, заполните все обязательные поля')
      return
    }

    if (!personId) {
      setValidationError('Необходимо выбрать личность')
      return
    }

    // Для периодов типов "life" и "reign" обязательно привязка к личности
    if ((type === 'life' || type === 'reign') && !personId) {
      setValidationError('Для периодов типов "Жизнь" и "Правление" обязательно нужно выбрать личность')
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
      aria-labelledby="create-period-form-title"
      style={{
        display: 'grid',
        gap: 'clamp(8px, 2vw, 12px)',
        maxWidth: '100%',
      }}
    >
      <h2
        id="create-period-form-title"
        style={{
          fontSize: 'clamp(16px, 4vw, 20px)',
          fontWeight: '600',
          margin: '0 0 8px 0',
          color: '#f4e4c1',
        }}
      >
        Создание периода
      </h2>

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

      <div>
        <label
          htmlFor="period-name"
          style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Название периода <span aria-label="обязательное поле" style={{ color: '#e74c3c' }}>*</span>
        </label>
        <input
          id="period-name"
          name="name"
          placeholder="Введите название периода"
          required
          aria-required="true"
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(8px, 2vw, 12px)',
          }}
        >
          <div>
            <label
              htmlFor="period-start-year"
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                opacity: 0.8,
              }}
            >
              Год начала
            </label>
            <input
              id="period-start-year"
              name="startYear"
              type="number"
              placeholder="Год начала"
              required
              aria-required="true"
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
          </div>
          <div>
            <label
              htmlFor="period-end-year"
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                opacity: 0.8,
              }}
            >
              Год окончания
            </label>
            <input
              id="period-end-year"
              name="endYear"
              type="number"
              placeholder="Год окончания"
              required
              aria-required="true"
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
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="period-person"
          style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Личность <span aria-label="обязательное поле" style={{ color: '#e74c3c' }}>*</span>
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
        <label
          htmlFor="period-type"
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
          id="period-type"
          value={type}
          onChange={(e) => setType(e.target.value as 'reign' | 'life')}
          aria-label="Выберите тип периода"
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
          htmlFor="period-country"
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
          aria-label="Выбрать страну для периода"
        />
      </div>

      <div>
        <label
          htmlFor="period-description"
          style={{
            display: 'block',
            marginBottom: 'clamp(4px, 1vw, 8px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            opacity: 0.9,
            fontWeight: '500',
          }}
        >
          Описание периода <span aria-label="обязательное поле" style={{ color: '#e74c3c' }}>*</span>
        </label>
        <textarea
          id="period-description"
          name="description"
          placeholder="Введите описание периода"
          rows={4}
          required
          aria-required="true"
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
      </div>

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
          aria-label="Сохранить период как черновик"
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
          aria-label="Отправить период на модерацию"
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

      <div 
        style={{ fontSize: 12, opacity: 0.8, textAlign: 'center' }}
        role="note"
        aria-label="Информация о черновиках"
      >
        Черновик можно будет редактировать и отправить на модерацию позже
      </div>
    </form>
  )
}

