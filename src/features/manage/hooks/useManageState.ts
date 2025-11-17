import { useState, useRef, useEffect } from 'react'
import { Person, MixedListItem } from 'shared/types'
import type { CountryOption } from 'shared/api/meta'

export type Tab = 'persons' | 'achievements' | 'periods'
export type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`
export type LifePeriod = { countryId: string; start: number | ''; end: number | '' }

export interface ManageSidebarState {
  isScrolled: boolean
  showControls: boolean
  setShowControls: (show: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export interface ManageCountsState {
  mineCounts: { persons: number; achievements: number; periods: number }
  setMineCounts: (counts: { persons: number; achievements: number; periods: number }) => void
  countsLoadKeyRef: React.MutableRefObject<string | null>
  countsLastTsRef: React.MutableRefObject<number>
}

export interface ManageSelectionState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  menuSelection: MenuSelection
  setMenuSelection: (selection: MenuSelection) => void
  selectedListId: number | null
  setSelectedListId: (id: number | null) => void
  listItems: MixedListItem[]
  setListItems: React.Dispatch<React.SetStateAction<MixedListItem[]>>
  listItemIdByDomainIdRef: React.MutableRefObject<Map<string, number>>
  listLoading: boolean
  setListLoading: (loading: boolean) => void
}

export interface ManagePersonEditorState {
  selected: Person | null
  setSelected: React.Dispatch<React.SetStateAction<Person | null>>
  lastSelectedRef: React.MutableRefObject<Person | null>
  categories: string[]
  setCategories: React.Dispatch<React.SetStateAction<string[]>>
  countries: string[]
  setCountries: React.Dispatch<React.SetStateAction<string[]>>
  countryOptions: CountryOption[]
  setCountryOptions: React.Dispatch<React.SetStateAction<CountryOption[]>>
  editPersonCategory: string
  setEditPersonCategory: (category: string) => void
  lifePeriods: LifePeriod[]
  setLifePeriods: React.Dispatch<React.SetStateAction<LifePeriod[]>>
  editBirthYear: number
  setEditBirthYear: (year: number) => void
  editDeathYear: number
  setEditDeathYear: (year: number) => void
  newLifePeriods: LifePeriod[]
  setNewLifePeriods: React.Dispatch<React.SetStateAction<LifePeriod[]>>
  fetchedDetailsIdsRef: React.MutableRefObject<Set<string>>
}

export interface ManageStateSlices {
  sidebar: ManageSidebarState
  counts: ManageCountsState
  selection: ManageSelectionState
  personEditor: ManagePersonEditorState
}

export function useManageState(): ManageStateSlices {
  const [isScrolled] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('persons')
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [mineCounts, setMineCounts] = useState({ persons: 0, achievements: 0, periods: 0 })
  const countsLoadKeyRef = useRef<string | null>(null)
  const countsLastTsRef = useRef(0)

  const [menuSelection, setMenuSelection] = useState<MenuSelection>('all')

  const [selected, setSelected] = useState<Person | null>(null)
  const lastSelectedRef = useRef<Person | null>(null)
  useEffect(() => {
    if (selected) lastSelectedRef.current = selected
  }, [selected])

  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])

  const [editPersonCategory, setEditPersonCategory] = useState<string>('')
  const [lifePeriods, setLifePeriods] = useState<LifePeriod[]>([])
  const [editBirthYear, setEditBirthYear] = useState<number>(0)
  const [editDeathYear, setEditDeathYear] = useState<number>(0)
  const [newLifePeriods, setNewLifePeriods] = useState<LifePeriod[]>([])

  const [listItems, setListItems] = useState<MixedListItem[]>([])
  const listItemIdByDomainIdRef = useRef<Map<string, number>>(new Map())
  const [listLoading, setListLoading] = useState(false)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const fetchedDetailsIdsRef = useRef<Set<string>>(new Set())

  return {
    sidebar: {
      isScrolled,
      showControls,
      setShowControls,
      sidebarCollapsed,
      setSidebarCollapsed,
    },
    counts: {
      mineCounts,
      setMineCounts,
      countsLoadKeyRef,
      countsLastTsRef,
    },
    selection: {
      activeTab,
      setActiveTab,
      menuSelection,
      setMenuSelection,
      selectedListId,
      setSelectedListId,
      listItems,
      setListItems,
      listItemIdByDomainIdRef,
      listLoading,
      setListLoading,
    },
    personEditor: {
      selected,
      setSelected,
      lastSelectedRef,
      categories,
      setCategories,
      countries,
      setCountries,
      countryOptions,
      setCountryOptions,
      editPersonCategory,
      setEditPersonCategory,
      lifePeriods,
      setLifePeriods,
      editBirthYear,
      setEditBirthYear,
      editDeathYear,
      setEditDeathYear,
      newLifePeriods,
      setNewLifePeriods,
      fetchedDetailsIdsRef,
    },
  }
}

