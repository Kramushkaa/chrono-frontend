import type { Person } from '../types'

/**
 * Type guards for runtime type checking
 * Use these for safe runtime type validation
 */

// Period types
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

// Status types with discriminated union
export type EntityStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface Achievement {
  id: number
  year: number
  description: string
  person_id?: string
  person_name?: string
  wikipedia_url?: string | null
  image_url?: string | null
  status?: EntityStatus
}

// Type guards
export function isPerson(obj: unknown): obj is Person {
  if (typeof obj !== 'object' || obj === null) return false
  const p = obj as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.birthYear === 'number' &&
    typeof p.category === 'string' &&
    typeof p.country === 'string'
  )
}

export function isPeriod(obj: unknown): obj is Period {
  if (typeof obj !== 'object' || obj === null) return false
  const p = obj as Record<string, unknown>
  return (
    typeof p.startYear === 'number' &&
    (p.endYear === null || typeof p.endYear === 'number') &&
    typeof p.type === 'string'
  )
}

export function isRulerPeriod(obj: unknown): obj is RulerPeriod {
  if (typeof obj !== 'object' || obj === null) return false
  const p = obj as Record<string, unknown>
  return typeof p.startYear === 'number' && typeof p.endYear === 'number'
}

export function isAchievement(obj: unknown): obj is Achievement {
  if (typeof obj !== 'object' || obj === null) return false
  const a = obj as Record<string, unknown>
  return (
    typeof a.id === 'number' &&
    typeof a.year === 'number' &&
    typeof a.description === 'string'
  )
}

export function isEntityStatus(value: unknown): value is EntityStatus {
  return (
    value === 'draft' ||
    value === 'pending' ||
    value === 'approved' ||
    value === 'rejected'
  )
}

export function isPeriodType(value: unknown): value is PeriodType {
  return value === 'life' || value === 'ruler' || value === 'other'
}

// Type narrowing helpers
export function assertPerson(obj: unknown): asserts obj is Person {
  if (!isPerson(obj)) {
    throw new Error('Invalid Person object')
  }
}

export function assertPeriod(obj: unknown): asserts obj is Period {
  if (!isPeriod(obj)) {
    throw new Error('Invalid Period object')
  }
}

export function assertAchievement(obj: unknown): asserts obj is Achievement {
  if (!isAchievement(obj)) {
    throw new Error('Invalid Achievement object')
  }
}

// Array type guards
export function isPersonArray(arr: unknown): arr is Person[] {
  return Array.isArray(arr) && arr.every(isPerson)
}

export function isPeriodArray(arr: unknown): arr is Period[] {
  return Array.isArray(arr) && arr.every(isPeriod)
}

export function isAchievementArray(arr: unknown): arr is Achievement[] {
  return Array.isArray(arr) && arr.every(isAchievement)
}

// Safe casting with fallback
export function asPersonOrNull(obj: unknown): Person | null {
  return isPerson(obj) ? obj : null
}

export function asPeriodOrNull(obj: unknown): Period | null {
  return isPeriod(obj) ? obj : null
}

export function asAchievementOrNull(obj: unknown): Achievement | null {
  return isAchievement(obj) ? obj : null
}

