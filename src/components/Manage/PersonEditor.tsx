import React from 'react'
import { Person } from '../../types'
import { SearchableSelect, SelectOption } from '../SearchableSelect'
import { LifePeriodsEditor, LifePeriodDraft } from '../Persons/LifePeriodsEditor'

type Props = {
  person: Person
  editBirthYear: number
  setEditBirthYear: (v: number) => void
  editDeathYear: number
  setEditDeathYear: (v: number) => void
  editPersonCategory: string
  setEditPersonCategory: (v: string) => void
  categorySelectOptions: SelectOption[]
  lifePeriods: LifePeriodDraft[]
  setLifePeriods: (v: LifePeriodDraft[]) => void
  countrySelectOptions: SelectOption[]
}

export function PersonEditor({ person, editBirthYear, setEditBirthYear, editDeathYear, setEditDeathYear, editPersonCategory, setEditPersonCategory, categorySelectOptions, lifePeriods, setLifePeriods, countrySelectOptions }: Props) {
  return (
    <>
      <input name="name" placeholder="Имя" defaultValue={person.name} required />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          name="birthYear"
          type="number"
          placeholder="Год рождения"
          value={editBirthYear}
          onChange={(e) => setEditBirthYear(Number(e.target.value))}
          required
        />
        <input
          name="deathYear"
          type="number"
          placeholder="Год смерти"
          value={editDeathYear}
          onChange={(e) => setEditDeathYear(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Род деятельности</label>
        <SearchableSelect
          placeholder="Выбрать род деятельности"
          value={editPersonCategory}
          options={categorySelectOptions}
          onChange={(val) => setEditPersonCategory(val)}
          locale="ru"
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.9 }}>Страны проживания</label>
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={() => {
            const next = countrySelectOptions[0]?.value || ''
            setLifePeriods([ ...lifePeriods, { countryId: next, start: editBirthYear, end: editDeathYear }])
          }}>+ Добавить страну проживания</button>
        </div>
        {lifePeriods.length > 0 && (
          <LifePeriodsEditor
            periods={lifePeriods}
            onChange={setLifePeriods}
            options={countrySelectOptions}
            minYear={editBirthYear}
            maxYear={editDeathYear}
            disableDeleteWhenSingle
          />
        )}
      </div>
      <input name="imageUrl" placeholder="URL изображения" defaultValue={person.imageUrl || ''} />
      <input name="wikiLink" placeholder="Ссылка на Википедию" defaultValue={person.wikiLink || ''} />
      <textarea name="description" placeholder="Описание" defaultValue={person.description} rows={6} />
    </>
  )
}



