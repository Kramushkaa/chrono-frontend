import React from 'react'
import { Person } from 'shared/types'
import { AuthRequiredModal } from './AuthRequiredModal'
import { CreateEntityModal } from './CreateEntityModal'
import { PersonEditModal, type LifePeriod, type LifePeriodPayload, type PersonEditPayload } from './PersonEditModal'
import { CreateListModal } from './CreateListModal'
import { AddToListModal } from './AddToListModal'
import { EditWarningModal } from 'shared/ui/EditWarningModal'
import { CountryOption } from 'shared/api/api'
import {
  apiFetch,
  getPersonById,
  proposePersonEdit,
  updatePerson,
  submitPersonDraft,
  revertPersonToDraft,
  createPersonDraft,
  createAchievementDraft,
  createPeriodDraft,
  adminUpsertPerson,
  proposeNewPerson,
} from 'shared/api/api'
import { slugifyIdFromName } from 'shared/utils/slug'
import type { AuthUser } from 'features/auth/services/auth'

// Типы для списков
interface PersonList {
  id: number
  title: string
  items_count?: number
  readonly?: boolean
}

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

  // Functions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  resetPersons: () => void
  resetAchievements: () => void
  resetPeriods: () => void
  loadUserLists: (force?: boolean) => void
  navigate: (path: string) => void
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
  showToast,
  resetPersons,
  resetAchievements,
  resetPeriods,
  loadUserLists,
  navigate,
}: ManageModalsProps) {
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
              lifePeriods: payload.lifePeriods,
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
              showToast('Создание достижений пока не реализовано', 'info')
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
              showToast('Создание периодов пока не реализовано', 'info')
            }

            setShowCreate(false)
            resetPeriods()
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ошибка при создании периода'
            showToast(errorMessage, 'error')
          }
        }}
        personOptions={[]}
        personsSelectLoading={false}
        onSearchPersons={async (q: string) => {}}
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
    </div>
  )
}

