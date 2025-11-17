import React, { createContext, useContext } from 'react'
import type {
  ManageCountsState,
  ManagePersonEditorState,
  ManageSelectionState,
  ManageSidebarState,
  ManageStateSlices,
} from '../hooks/useManageState'

const SidebarContext = createContext<ManageSidebarState | null>(null)
const CountsContext = createContext<ManageCountsState | null>(null)
const SelectionContext = createContext<ManageSelectionState | null>(null)
const PersonEditorContext = createContext<ManagePersonEditorState | null>(null)

export function ManageStateProvider({ value, children }: { value: ManageStateSlices; children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={value.sidebar}>
      <CountsContext.Provider value={value.counts}>
        <SelectionContext.Provider value={value.selection}>
          <PersonEditorContext.Provider value={value.personEditor}>
            {children}
          </PersonEditorContext.Provider>
        </SelectionContext.Provider>
      </CountsContext.Provider>
    </SidebarContext.Provider>
  )
}

const createHook =
  <T,>(ctx: React.Context<T | null>, hookName: string) =>
  () => {
    const value = useContext(ctx)
    if (!value) {
      throw new Error(`${hookName} must be used within ManageStateProvider`)
    }
    return value
  }

export const useManageSidebar = createHook(SidebarContext, 'useManageSidebar')
export const useManageCounts = createHook(CountsContext, 'useManageCounts')
export const useListSelection = createHook(SelectionContext, 'useListSelection')
export const usePersonEditorState = createHook(PersonEditorContext, 'usePersonEditorState')

