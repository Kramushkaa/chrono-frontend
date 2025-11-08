// Manually duplicated DTO types/descriptors (keep in sync with backend)
export const DTO_VERSION = '2025-11-08-2'
export type PersonLifePeriodInputDTO = {
  countryId: number
  start: number
  end: number
}
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
  lifePeriods?: PersonLifePeriodInputDTO[]
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
    id: 'string', name: 'string', birthYear: 'int', deathYear: 'int', category: 'string', description: 'string', imageUrl: 'url|null?', wikiLink: 'url|null?', saveAsDraft: 'boolean?', lifePeriods: 'PersonLifePeriodInput[]?'
  },
  PersonLifePeriodInput: {
    countryId: 'int+', start: 'int', end: 'int'
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
  },
  ListPublicationRequest: {
    description: 'string?'
  },
  ListModerationAction: {
    action: "enum('approve'|'reject')", comment: 'string?', slug: 'string?'
  }
} as const
// --- Lightweight runtime validation (dev only) ---
type DescriptorName = keyof typeof dtoDescriptors
function isInt(n: unknown): boolean {
  return typeof n === 'number' && Number.isInteger(n)
}
function isString(x: unknown): boolean {
  return typeof x === 'string'
}
function isUrlOrNull(x: unknown): boolean {
  if (x == null) return true
  if (typeof x !== 'string') return false
  try { new URL(x); return true } catch { return false }
}
function checkPrimitive(type: string, value: unknown): boolean {
  switch (type) {
    case 'int': return isInt(value)
    case 'string': return isString(value)
    case 'boolean': return typeof value === 'boolean'
    case 'url|null': return isUrlOrNull(value)
    default: return true
  }
}
function checkBySpec(spec: string, value: unknown): boolean {
  // spec examples: 'int', 'string?', 'url|null?', 'int+', 'LifePeriodItem[]', 'PersonLifePeriodInput[]?'
  const optional = spec.endsWith('?')
  const required = spec.endsWith('+')
  let base = spec
  if (optional || required) base = spec.slice(0, -1)
  if (optional && value === undefined) return true
  if (required && (value === undefined || value === null)) return false
  if (base.endsWith('[]')) {
    if (value === undefined) return !required
    if (!Array.isArray(value)) return false
    const itemSpec = base.slice(0, -2)
    return value.every(v => checkBySpec(itemSpec, v))
  }
  if ((base === 'url|null') || (base === 'url')) {
    return base === 'url' ? isUrlOrNull(value) && value != null : isUrlOrNull(value)
  }
  if (base.startsWith("enum(") && base.endsWith(")")) {
    if (typeof value !== 'string') return false
    const options = base
      .slice(5, -1)
      .split('|')
      .map(opt => opt.trim().replace(/^'|'$/g, ''))
      .filter(Boolean)
    return options.includes(value)
  }
  // nested descriptor
  if (base in dtoDescriptors) {
    return validateDto(base as DescriptorName, value).ok
  }
  return checkPrimitive(base, value)
}
export function validateDto(name: DescriptorName, obj: unknown): { ok: boolean; errors: string[] } {
  const desc = dtoDescriptors[name] as Record<string, string>
  if (!desc || typeof obj !== 'object' || obj === null) {
    return { ok: false, errors: [`${String(name)}: invalid object`] }
  }
  const errors: string[] = []
  for (const [key, spec] of Object.entries(desc)) {
    const val = (obj as Record<string, unknown>)[key]
    if (!checkBySpec(spec, val)) {
      errors.push(`${String(name)}.${key} expected ${spec}, got ${typeof val}`)
    }
  }
  return { ok: errors.length === 0, errors }
}
export type ListPublicationRequestDTO = {
  description?: string
}
export type ListModerationActionDTO = {
  action: 'approve' | 'reject'
  comment?: string
  slug?: string
}
