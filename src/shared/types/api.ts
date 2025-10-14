/**
 * Strict types for API responses
 * Use these instead of 'any' for better type safety
 */

import type { Person, Period, Achievement, EntityStatus, PeriodType } from './index'

// Re-export AuthUser from auth service
export type { AuthUser } from '../../features/auth/services/auth'

// List types
export interface ListItem {
  id: number
  list_id: number
  item_type: 'person' | 'achievement' | 'period'
  person_id?: string | null
  achievement_id?: number | null
  period_id?: number | null
  added_at: string
}

export interface PersonList {
  id: number
  user_id: number
  title: string
  is_public: boolean
  share_code?: string | null
  code?: string
  created_at: string
  updated_at: string
  persons_count?: number
  achievements_count?: number
  periods_count?: number
  items_count?: number
  readonly?: boolean
}

export interface SharedListMeta {
  code: string
  title: string
  listId?: number
}

// Mixed list item (for rendering)
export interface MixedListItem {
  key: string
  listItemId: number
  type: 'person' | 'achievement' | 'period'
  person?: Person | null
  achievement?: Achievement | null
  periodId?: number | null
  period?: Period | null
  title: string
  subtitle?: string
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  status?: number
}

// Count responses
export interface CountResponse {
  count: number
}

// Pagination metadata
export interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

// API payloads (for requests)
export interface UpsertPersonPayload {
  id: string
  name: string
  birthYear: number
  deathYear: number
  category: string
  description: string
  imageUrl?: string | null
  wikiLink?: string | null
  lifePeriods?: Array<{
    countryId: string
    start: number | ''
    end: number | ''
  }>
}

export interface CreateAchievementPayload {
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
}

export interface CreatePeriodPayload {
  startYear: number
  endYear: number
  type: PeriodType
  countryId?: string | null
  comment?: string | null
}

// Draft types
export interface PersonDraft extends Person {
  status: 'draft' | 'pending'
  created_by: number
  created_at: string
  updated_at: string
}

export interface AchievementDraft extends Achievement {
  status: 'draft' | 'pending'
  created_by: number
  person_id?: string | null
  created_at: string
  updated_at: string
}

export interface PeriodDraft extends Period {
  id: number
  status: 'draft' | 'pending'
  created_by: number
  person_id?: string | null
  created_at: string
  updated_at: string
}

// Type guards for API responses
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value
  )
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as Record<string, unknown>).success === false &&
    'error' in value
  )
}

export function isCountResponse(value: unknown): value is CountResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'count' in value &&
    typeof (value as Record<string, unknown>).count === 'number'
  )
}

