export type ItemType = 'person' | 'achievement' | 'period'

export function adaptToItemCard(item: any, itemType: ItemType) {
  if (itemType === 'person') {
    return {
      id: item.id,
      title: item.name || '—',
      subtitle: item.country || item.country_name || item.countryName || '',
      startYear: item.birthYear ?? item.birth_year,
      endYear: item.deathYear ?? item.death_year,
      type: item.category || '',
      person: item
    }
  }
  if (itemType === 'achievement') {
    const title = item.title || item.person_name || item.country_name || ''
    return {
      id: item.id,
      title: title || '—',
      year: item.year,
      description: item.description,
      achievement: item
    }
  }
  const personName = item.person_name ?? item.personName ?? ''
  const countryName = item.country_name ?? item.countryName ?? ''
  const type = item.period_type ?? item.periodType
  const start = item.start_year ?? item.startYear
  const end = item.end_year ?? item.endYear
  const headerParts: string[] = []
  if (personName) headerParts.push(personName)
  if (countryName) headerParts.push(countryName)
  const header = headerParts.join(' • ')
  return {
    id: item.id ?? `${personName}-${start}-${end}`,
    title: header || '—',
    type: type === 'ruler' ? 'Правление' : type === 'life' ? 'Жизнь' : (type || '—'),
    startYear: start,
    endYear: end,
    period: item
  }
}





