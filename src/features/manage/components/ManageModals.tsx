import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Person, type UserList } from 'shared/types'

import { AuthRequiredModal } from './AuthRequiredModal'

import { CreateEntityModal } from './CreateEntityModal'

import { PersonEditModal, type LifePeriod, type LifePeriodPayload, type PersonEditPayload } from './PersonEditModal'

import { CreateListModal } from './CreateListModal'

import { AddToListModal } from './AddToListModal'

import { EditWarningModal } from 'shared/ui/EditWarningModal'

import { ListPublicationModal } from './ListPublicationModal'

import type { CountryOption } from 'shared/api/meta'

import { apiFetch } from 'shared/api/core'
import { getPersonById, proposePersonEdit, updatePerson, submitPersonDraft, revertPersonToDraft, createPersonDraft, adminUpsertPerson, proposeNewPerson } from 'shared/api/persons'
import { createAchievementDraft, createAchievement } from 'shared/api/achievements'
import { createPeriodDraft, createPeriod } from 'shared/api/periods'

import { slugifyIdFromName } from 'shared/utils/slug'

import type { AuthUser } from 'features/auth/services/auth'



// Типы для списков
type PersonList = UserList & { readonly?: boolean }



// Тип для addToList hook result

interface AddToListActions {

  isOpen: boolean

  openForPerson: (person: { id: string }) => void

  openForAchievement: (achievementId: number) => void

  openForPeriod: (periodId: number) => void

  close: () => void

  includeLinked: boolean

  setIncludeLinked: (value: boolean) => void

  onAdd: (listId: number) => Promise<void>

}



interface ManageModalsProps {

  // Modal states

  showAuthModal: boolean

  setShowAuthModal: (show: boolean) => void

  showCreate: boolean

  setShowCreate: (show: boolean) => void

  createType: 'person' | 'achievement' | 'period'

  isEditing: boolean

  setIsEditing: (editing: boolean) => void

  showCreateList: boolean

  setShowCreateList: (show: boolean) => void

  showEditWarning: boolean

  setShowEditWarning: (show: boolean) => void

  isReverting: boolean

  setIsReverting: (reverting: boolean) => void

  showListPublication: boolean

  setShowListPublication: (show: boolean) => void



  // Data

  categories: string[]

  countryOptions: CountryOption[]

  categorySelectOptions: Array<{ value: string; label: string }>

  countrySelectOptions: Array<{ value: string; label: string }>

  selected: Person | null

  setSelected: (person: Person | null) => void

  lifePeriods: LifePeriod[]

  setLifePeriods: (periods: LifePeriod[] | ((prev: LifePeriod[]) => LifePeriod[])) => void

  editBirthYear: number

  setEditBirthYear: (year: number) => void

  editDeathYear: number

  setEditDeathYear: (year: number) => void

  editPersonCategory: string

  setEditPersonCategory: (category: string) => void

  personLists: PersonList[]

  isAuthenticated: boolean

  user: AuthUser | null

  isModerator: boolean

  addToList: AddToListActions

  selectedListId: number | null

  currentUserId?: number | null



  // Functions

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void

  resetPersons: () => void

  resetAchievements: () => void

  resetPeriods: () => void

  loadUserLists: (force?: boolean) => void

  navigate: (path: string) => void

  onListUpdated?: (list: any) => void

}



export function ManageModals({

  showAuthModal,

  setShowAuthModal,

  showCreate,

  setShowCreate,

  createType,

  isEditing,

  setIsEditing,

  showCreateList,

  setShowCreateList,

  showEditWarning,

  setShowEditWarning,

  isReverting,

  setIsReverting,

  showListPublication,

  setShowListPublication,

  categories,

  countryOptions,

  categorySelectOptions,

  countrySelectOptions,

  selected,

  setSelected,

  lifePeriods,

  setLifePeriods,

  editBirthYear,

  setEditBirthYear,

  editDeathYear,

  setEditDeathYear,

  editPersonCategory,

  setEditPersonCategory,

  personLists,

  isAuthenticated,

  user,

  isModerator,

  addToList,

  selectedListId,

  currentUserId,

  showToast,

  resetPersons,

  resetAchievements,

  resetPeriods,

  loadUserLists,

  navigate,

  onListUpdated,

}: ManageModalsProps) {

  const [personOptions, setPersonOptions] = useState<Array<{ value: string; label: string }>>([])

  const [personsSelectLoading, setPersonsSelectLoading] = useState(false)

  const [lastPersonQuery, setLastPersonQuery] = useState('')



  const ensurePersonOption = useCallback((person?: Person | null) => {

    if (!person || !person.id) return

    setPersonOptions((prev) => {

      if (prev.some((opt) => opt.value === person.id)) {

        return prev

      }

      return [{ value: person.id, label: person.name }, ...prev]

    })

  }, [])



  useEffect(() => {

    ensurePersonOption(selected)

  }, [selected, ensurePersonOption])



  useEffect(() => {

    if (typeof window !== 'undefined') {

      const preset = (window as any).__E2E_PERSON_OPTIONS__

      if (Array.isArray(preset) && preset.length > 0) {

        setPersonOptions(preset)

      }

    }

  }, [])



  const handleSearchPersons = useCallback(

    async (rawQuery: string) => {

      const query = rawQuery.trim()

      if (query === lastPersonQuery && personOptions.length > 0) {

        return

      }

      setLastPersonQuery(query)



      try {

        setPersonsSelectLoading(true)

        const params = new URLSearchParams({ limit: '10' })

        if (query) {

          params.set('q', query)

        }

        const response = await apiFetch(`/api/persons?${params.toString()}`)

        const json = await response.json().catch(() => null)

        // Более надежная обработка ответа API
        let items: Array<{ id: string; name: string }> = []
        
        if (json?.success && Array.isArray(json?.data)) {
          // API вернул успешный ответ с данными
          items = json.data
        } else if (Array.isArray(json?.data)) {
          // Альтернативный формат ответа
          items = json.data
        } else if (Array.isArray(json)) {
          // Прямой массив
          items = json
        }

        
        // Фильтруем и маппим опции
        const options = items
          .filter(item => item && item.id && item.name)
          .map((item) => ({ value: item.id, label: item.name }))
        
        setPersonOptions(options)
        
        // Если нет опций и это не поиск, показываем предупреждение
        if (options.length === 0 && !query) {
          console.warn('Не найдено личностей для выбора в модалке')
        }

      } catch (error) {

        console.error('Не удалось загрузить список личностей для модалки', error)

      } finally {

        setPersonsSelectLoading(false)

      }

    },

    [lastPersonQuery, personOptions.length]

  )



  useEffect(() => {

    if (showCreate && (createType === 'achievement' || createType === 'period')) {

      handleSearchPersons(lastPersonQuery || '')

    }

    if (!showCreate) {

      setLastPersonQuery('')

    }

  }, [showCreate, createType, handleSearchPersons, lastPersonQuery])

  // Предзагрузка личностей при первом открытии модалки создания
  useEffect(() => {
    if (showCreate && (createType === 'achievement' || createType === 'period')) {
      // Если опции пустые, загружаем их без поискового запроса
      if (personOptions.length === 0) {
        handleSearchPersons('')
      }
    }
  }, [showCreate, createType])



  const memoizedPersonOptions = useMemo(() => personOptions, [personOptions])



  return (

    <div className="manage-page__modals">

      <AuthRequiredModal

        isOpen={showAuthModal}

        onClose={() => setShowAuthModal(false)}

        isAuthenticated={isAuthenticated}

        emailVerified={!!user?.email_verified}

        onGoToProfile={() => navigate('/profile')}

      />



      <CreateEntityModal

        isOpen={showCreate}

        onClose={() => setShowCreate(false)}

        type={createType}

        categories={categories}

        countryOptions={countryOptions}

        onCreatePerson={async (payload) => {

          try {

            if (!user?.email_verified) {

              showToast('Требуется подтверждение email для создания личностей', 'error')

              return

            }



            let id = slugifyIdFromName(payload.name)

            if (!id || id.length < 2) id = `person-${Date.now()}`



            const lifePeriods = (payload.lifePeriods || []).map((lp) => ({

              countryId: Number(lp.countryId),

              start: typeof lp.start === 'number' ? lp.start : Number(lp.start),

              end: typeof lp.end === 'number' ? lp.end : Number(lp.end),

            }))



            const personPayload = {

              id,

              name: payload.name,

              birthYear: payload.birthYear,

              deathYear: payload.deathYear,

              category: payload.category,

              description: payload.description,

              imageUrl: payload.imageUrl,

              wikiLink: payload.wikiLink,

              saveAsDraft: payload.saveAsDraft,

              lifePeriods,

            }



            if (payload.saveAsDraft) {

              await createPersonDraft(personPayload)

              showToast('Черновик личности сохранен', 'success')

            } else if (isModerator) {

              await adminUpsertPerson(personPayload)

              showToast('Личность создана', 'success')

            } else {

              await proposeNewPerson(personPayload)

              showToast('Предложение на создание личности отправлено', 'success')

            }



            setShowCreate(false)

            resetPersons()

          } catch (e) {

            const errorMessage = e instanceof Error ? e.message : 'Ошибка при создании личности'

            showToast(errorMessage, 'error')

          }

        }}

        onCreateAchievement={async (payload) => {

          try {

            if (!user?.email_verified) {

              showToast('Требуется подтверждение email для создания достижений', 'error')

              return

            }



            if (payload.saveAsDraft) {

              if (!payload.personId) {

                showToast('Необходимо выбрать личность для достижения', 'error')

                return

              }

              await createAchievementDraft(payload.personId, payload)

              showToast('Черновик достижения сохранен', 'success')

            } else {

              if (!payload.personId) {
                showToast('Необходимо выбрать личность для достижения', 'error')
                return
              }

              await createAchievement(payload.personId, payload)
            
            if (payload.saveAsDraft) {
              showToast('Черновик достижения сохранен', 'success')
            } else {
              showToast('Достижение отправлено на модерацию', 'success')
            }

            }



            setShowCreate(false)

            resetAchievements()

          } catch (e) {

            const errorMessage = e instanceof Error ? e.message : 'Ошибка при создании достижения'

            showToast(errorMessage, 'error')

          }

        }}

        onCreatePeriod={async (payload) => {

          try {

            if (!user?.email_verified) {

              showToast('Требуется подтверждение email для создания периодов', 'error')

              return

            }



            if (payload.saveAsDraft) {

              if (!payload.personId) {

                showToast('Необходимо выбрать личность для периода', 'error')

                return

              }

              await createPeriodDraft(payload.personId, {

                start_year: payload.startYear,

                end_year: payload.endYear,

                period_type: payload.type,

                country_id: payload.countryId,

                comment: payload.description,

              })

              showToast('Черновик периода сохранен', 'success')

            } else {

              if (!payload.personId) {
                showToast('Необходимо выбрать личность для периода', 'error')
                return
              }

              await createPeriod(payload.personId, {
                start_year: payload.startYear,
                end_year: payload.endYear,
                period_type: payload.type,
                country_id: payload.countryId,
                comment: payload.description,
              })
              
              if (payload.saveAsDraft) {
                showToast('Черновик периода сохранен', 'success')
              } else {
                showToast('Период отправлен на модерацию', 'success')
              }

            }



            setShowCreate(false)

            resetPeriods()

          } catch (e) {

            const errorMessage = e instanceof Error ? e.message : 'Ошибка при создании периода'

            showToast(errorMessage, 'error')

          }

        }}

        personOptions={memoizedPersonOptions}

        personsSelectLoading={personsSelectLoading}

        onSearchPersons={handleSearchPersons}

      />



      <PersonEditModal

        isOpen={isEditing && !!selected}

        onClose={() => setIsEditing(false)}

        person={selected!}

        isModerator={isModerator}

        editBirthYear={editBirthYear}

        setEditBirthYear={setEditBirthYear}

        editDeathYear={editDeathYear}

        setEditDeathYear={setEditDeathYear}

        editPersonCategory={editPersonCategory}

        setEditPersonCategory={setEditPersonCategory}

        categorySelectOptions={categorySelectOptions}

        lifePeriods={lifePeriods}

        setLifePeriods={setLifePeriods}

        countrySelectOptions={countrySelectOptions}

        showToast={showToast}

        onPersonUpdated={(fresh: Person) => setSelected(fresh)}

        onProposeEdit={async (

          id: string,

          payload: PersonEditPayload,

          next: LifePeriodPayload[]

        ) => {

          await proposePersonEdit(id, payload)

          const orig = (selected && Array.isArray(selected.periods) ? selected.periods : [])

            .filter((pr) => (pr.type || '').toLowerCase() === 'life' && pr.countryId)

            .map((pr) => ({

              country_id: Number(pr.countryId),

              start_year: Number(pr.startYear),

              end_year: Number(pr.endYear),

            }))

            .sort(

              (a, b) => a.start_year - b.start_year || a.end_year - b.end_year || a.country_id - b.country_id

            )

          const changed = JSON.stringify(orig) !== JSON.stringify(next)

          if (changed) {

            await apiFetch(`/api/persons/${encodeURIComponent(id)}/life-periods`, {

              method: 'POST',

              headers: { 'Content-Type': 'application/json' },

              body: JSON.stringify({ periods: next }),

            })

          }

        }}

        onUpdateDraft={async (

          id: string,

          payload: PersonEditPayload,

          next: LifePeriodPayload[]

        ) => {

          const lifePeriods = next.map((p) => ({

            countryId: String(p.country_id),

            start: p.start_year,

            end: p.end_year,

          }))

          await updatePerson(id, { ...payload, lifePeriods })

          const fresh = await getPersonById(id)

          if (fresh) setSelected(fresh)

        }}

        onSubmitDraft={async (

          id: string,

          payload: PersonEditPayload,

          next: LifePeriodPayload[]

        ) => {

          const lifePeriods = next.map((p) => ({

            countryId: String(p.country_id),

            start: p.start_year,

            end: p.end_year,

          }))

          await updatePerson(id, { ...payload, lifePeriods })

          await submitPersonDraft(id)

          const fresh = await getPersonById(id)

          if (fresh) setSelected(fresh)

        }}

        onSuccess={async () => {

          if (selected) {

            const fresh = await getPersonById(selected.id)

            if (fresh) setSelected(fresh)

          }

        }}

      />



      <CreateListModal

        isOpen={showCreateList}

        onClose={() => setShowCreateList(false)}

        onCreate={async (title: string) => {

          try {

            const res = await apiFetch(`/api/lists`, {

              method: 'POST',

              headers: { 'Content-Type': 'application/json' },

              body: JSON.stringify({ title }),

            })

            const data = await res.json().catch(() => null)

            if (res.ok && data?.data) {

              loadUserLists(true)

            }

          } catch {}

        }}

      />



      <AddToListModal

        isOpen={addToList.isOpen}

        onClose={() => addToList.close()}

        lists={isAuthenticated ? personLists : []}

        onCreateList={() => {

          addToList.close()

          setShowCreateList(true)

        }}

        extraControls={

          selected ? (

            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

              <input

                type="checkbox"

                checked={addToList.includeLinked}

                onChange={(e) => addToList.setIncludeLinked(e.target.checked)}

              />{' '}

              Добавить все связанные периоды и достижения

            </label>

          ) : null

        }

        onAdd={(listId: number) => addToList.onAdd(listId)}

      />



      <EditWarningModal

        isOpen={showEditWarning}

        personName={selected?.name || ''}

        onRevertToDraft={async () => {

          if (!selected || isReverting) return

          setIsReverting(true)

          try {

            await revertPersonToDraft(selected.id)

            showToast('Личность возвращена в черновики', 'success')

            const fresh = await getPersonById(selected.id)

            if (fresh) setSelected(fresh)

            setShowEditWarning(false)

          } catch (e) {

            const errorMessage = e instanceof Error ? e.message : 'Ошибка при возврате в черновики'

            showToast(errorMessage, 'error')

          } finally {

            setIsReverting(false)

          }

        }}

        onCancel={() => setShowEditWarning(false)}

        isReverting={isReverting}

      />



      <ListPublicationModal

        isOpen={showListPublication}

        onClose={() => setShowListPublication(false)}

        list={personLists.find((list) => list.id === selectedListId) || null}

        isOwner={typeof currentUserId === 'number' && personLists.find((list) => list.id === selectedListId)?.owner_user_id === currentUserId}

        onUpdated={onListUpdated}

        onReload={(force?: boolean) => Promise.resolve(loadUserLists(force))}

        showToast={showToast}

      />

    </div>

  )

}









