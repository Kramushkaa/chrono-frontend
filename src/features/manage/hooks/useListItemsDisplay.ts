import { useMemo } from 'react'

type MixedItem = { key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; person?: any | null; achievement?: any | null; periodId?: number | null; period?: any | null; title: string; subtitle?: string }

export function useListItemsDisplay(items: MixedItem[], itemType: 'person' | 'achievement' | 'period') {
  return useMemo(() => {
    const filtered = items.filter(i => i.type === itemType)
    return filtered.map((item) => {
      if (itemType === 'person') {
        const country = item.person?.country ?? item.person?.countryName ?? item.person?.country_name ?? ''
        return {
          id: item.listItemId,
          title: item.title,
          subtitle: country || item.subtitle,
          startYear: item.person?.birthYear ?? item.person?.birth_year,
          endYear: item.person?.deathYear ?? item.person?.death_year,
          type: item.person?.category,
          person: item.person
        }
      }
      if (itemType === 'achievement') {
        return {
          id: item.listItemId,
          title: item.title,
          achievement: item.achievement,
          description: item.achievement?.description,
          year: item.achievement?.year
        }
      }
      // period
      return {
        id: item.listItemId,
        title: item.title,
        type: item.period?.period_type === 'ruler' ? 'Правление' : item.period?.period_type === 'life' ? 'Жизнь' : (item.period?.period_type || undefined),
        startYear: item.period?.start_year,
        endYear: item.period?.end_year,
        period: item.period ?? (item.periodId ? { id: item.periodId } : undefined)
      }
    })
  }, [items, itemType])
}


