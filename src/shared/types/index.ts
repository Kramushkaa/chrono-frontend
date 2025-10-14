// Entity status - discriminated union
export type EntityStatus = 'draft' | 'pending' | 'approved' | 'rejected'

// Period types - unified
export type PeriodType = 'life' | 'ruler' | 'other'

export interface Period {
  startYear: number
  endYear: number | null
  type: PeriodType
  countryId?: number
  countryName?: string
  comment?: string | null
}

export interface RulerPeriod {
  startYear: number
  endYear: number
  countryId?: number
  countryName?: string
}

export interface Achievement {
  id: number
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  person_id?: string | null
  country_id?: number | null
  status?: EntityStatus
  created_by?: number
  created_at?: string
  updated_at?: string
}

export interface Person {
  id: string
  name: string
  birthYear: number
  deathYear: number | null
  reignStart?: number | null
  reignEnd?: number | null
  rulerPeriods?: RulerPeriod[]
  category: string
  country: string
  description: string | null
  achievements: string[]
  achievementYears?: number[]
  achievementsWiki?: (string | null)[]
  imageUrl?: string | null
  wikiLink?: string | null
  periods?: Period[]
  status?: EntityStatus
} 

// Filters and UI shared types
export type GroupingType = 'category' | 'country' | 'none'

export interface TimeRange {
  start: number
  end: number
}

export interface FiltersState {
  showAchievements: boolean
  hideEmptyCenturies: boolean
  categories: string[]
  countries: string[]
  timeRange: TimeRange
}

export type SetFilters = (
  next:
    | FiltersState
    | ((prev: FiltersState) => FiltersState)
) => void

// Re-export API types
export type {
  AuthUser,
  ListItem,
  PersonList,
  SharedListMeta,
  MixedListItem,
  ApiResponse,
  ApiError,
  CountResponse,
  PaginationMeta,
  UpsertPersonPayload,
  CreateAchievementPayload,
  CreatePeriodPayload,
  PersonDraft,
  AchievementDraft,
  PeriodDraft,
} from './api'