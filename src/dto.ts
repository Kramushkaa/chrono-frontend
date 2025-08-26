// Manually duplicated DTO types/descriptors (keep in sync with backend)

export const DTO_VERSION = '2025-08-26-1'

export type UpsertPersonDTO = {
  id: string
  name: string
  birthYear: number
  deathYear: number
  category: string
  description: string
  imageUrl?: string | null
  wikiLink?: string | null
  saveAsDraft?: boolean
}

export type LifePeriodItemDTO = {
  country_id: number
  start_year: number
  end_year: number
  period_type?: string
}
export type LifePeriodsDTO = { periods: LifePeriodItemDTO[] }

export type PersonEditPayloadDTO = Partial<{
  name: string
  birthYear: number
  deathYear: number
  category: string
  description: string
  imageUrl: string | null
  wikiLink: string | null
}>

export type AchievementGenericDTO = {
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  country_id?: number | null
}

export type AchievementPersonDTO = {
  year: number
  description: string
  wikipedia_url?: string | null
  image_url?: string | null
  saveAsDraft?: boolean
}

// Lightweight descriptor to detect drift via runtime check (optional)
export const dtoDescriptors = {
  UpsertPerson: {
    id: 'string', name: 'string', birthYear: 'int', deathYear: 'int', category: 'string', description: 'string', imageUrl: 'url|null?', wikiLink: 'url|null?', saveAsDraft: 'boolean?'
  },
  LifePeriodItem: {
    country_id: 'int+', start_year: 'int', end_year: 'int', period_type: 'string?'
  },
  LifePeriods: { periods: 'LifePeriodItem[]' },
  PersonEditPayload: {
    name: 'string?', birthYear: 'int?', deathYear: 'int?', category: 'string?', description: 'string?', imageUrl: 'url|null?', wikiLink: 'url|null?'
  },
  AchievementGeneric: {
    year: 'int', description: 'string', wikipedia_url: 'url|null?', image_url: 'url|null?', country_id: 'int|null?'
  },
  AchievementPerson: {
    year: 'int', description: 'string', wikipedia_url: 'url|null?', image_url: 'url|null?', saveAsDraft: 'boolean?'
  }
} as const


