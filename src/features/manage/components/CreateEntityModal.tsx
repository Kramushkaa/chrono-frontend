import React from 'react'
import { SelectOption } from 'shared/ui/SearchableSelect'
import { Modal } from 'shared/ui/Modal'
import { CreatePersonForm, PersonLifePeriodFormValue } from './forms/CreatePersonForm'
import { CreateAchievementForm } from './forms/CreateAchievementForm'
import { CreatePeriodForm } from './forms/CreatePeriodForm'

type CountryOption = { id: number; name: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  type: 'person' | 'achievement' | 'period'

  // Person form
  categories: string[]
  countryOptions: CountryOption[]
  lifePeriods: PersonLifePeriodFormValue[]
  onLifePeriodsChange: React.Dispatch<React.SetStateAction<PersonLifePeriodFormValue[]>>
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
  const {
    isOpen,
    onClose,
    type,
    categories,
    countryOptions,
    lifePeriods,
    onLifePeriodsChange,
    onCreatePerson,
    personOptions,
    personsSelectLoading,
    onSearchPersons,
    onCreateAchievement,
    onCreatePeriod,
  } = props

  if (!isOpen) return null

  const getTitle = () => {
    switch (type) {
      case 'person':
        return 'Новая личность'
      case 'achievement':
        return 'Новое достижение'
      case 'period':
        return 'Новый период'
      default:
        return ''
    }
  }

  const renderForm = () => {
    switch (type) {
      case 'person':
        return (
          <CreatePersonForm
            categories={categories}
            countryOptions={countryOptions}
          lifePeriods={lifePeriods}
          setLifePeriods={onLifePeriodsChange}
            onSubmit={onCreatePerson}
          />
        )
      case 'achievement':
        return (
          <CreateAchievementForm
            countryOptions={countryOptions}
            personOptions={personOptions}
            personsSelectLoading={personsSelectLoading}
            onSearchPersons={onSearchPersons}
            onSubmit={onCreateAchievement}
          />
        )
      case 'period':
        return (
          <CreatePeriodForm
            countryOptions={countryOptions}
            personOptions={personOptions}
            personsSelectLoading={personsSelectLoading}
            onSearchPersons={onSearchPersons}
            onSubmit={onCreatePeriod}
          />
        )
      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" title={getTitle()}>
      <div
        className="modal-form"
        style={{ 
          display: 'grid', 
          gap: 'clamp(8px, 2vw, 12px)',
          maxWidth: '100%',
        }}
      >
        {renderForm()}
      </div>
    </Modal>
  )
}






