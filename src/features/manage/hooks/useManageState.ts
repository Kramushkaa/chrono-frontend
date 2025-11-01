import { useState, useRef, useEffect } from 'react'
import { Person } from 'shared/types'
import { CountryOption } from 'shared/api/api'

export type Tab = 'persons' | 'achievements' | 'periods'
export type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`
export type LifePeriod = { countryId: string; start: number | ''; end: number | '' }

export function useManageState() {
  const [isScrolled] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('persons')
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [mineCounts, setMineCounts] = useState<{ persons: number; achievements: number; periods: number }>({
    persons: 0,
    achievements: 0,
    periods: 0
  })
  const countsLoadKeyRef = useRef<string | null>(null)
  const countsLastTsRef = useRef(0)

  const [menuSelection, setMenuSelection] = useState<MenuSelection>('all')

  // Состояния для выбранной личности
  const [selected, setSelected] = useState<Person | null>(null)
  const lastSelectedRef = useRef<Person | null>(null)
  useEffect(() => {
    if (selected) lastSelectedRef.current = selected
  }, [selected])

  // Состояния для категорий и стран
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])

  // Состояния для редактирования личности
  const [editPersonCategory, setEditPersonCategory] = useState<string>('')
  const [lifePeriods, setLifePeriods] = useState<LifePeriod[]>([])
  const [editBirthYear, setEditBirthYear] = useState<number>(0)
  const [editDeathYear, setEditDeathYear] = useState<number>(0)

  // Состояния для создания новой личности
  const [newLifePeriods, setNewLifePeriods] = useState<LifePeriod[]>([])

  // Состояния для списков
  type MixedItem = {
    key: string
    listItemId: number
    type: 'person' | 'achievement' | 'period'
    person?: Person | null
    achievement?: any | null
    periodId?: number | null
    period?: any | null
    title: string
    subtitle?: string
  }
  const [listItems, setListItems] = useState<MixedItem[]>([])
  const listItemIdByDomainIdRef = useRef<Map<string, number>>(new Map())
  const [listLoading, setListLoading] = useState(false)

  // Управление sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Обработка выбора личности (ref для предотвращения ненужных загрузок)
  const fetchedDetailsIdsRef = useRef<Set<string>>(new Set())


  return {
    isScrolled,
    showControls,
    setShowControls,
    activeTab,
    setActiveTab,
    selectedListId,
    setSelectedListId,
    mineCounts,
    setMineCounts,
    countsLoadKeyRef,
    countsLastTsRef,
    menuSelection,
    setMenuSelection,
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
    listItems,
    setListItems,
    listItemIdByDomainIdRef,
    listLoading,
    setListLoading,
    sidebarCollapsed,
    setSidebarCollapsed,
    fetchedDetailsIdsRef,
  }
}




