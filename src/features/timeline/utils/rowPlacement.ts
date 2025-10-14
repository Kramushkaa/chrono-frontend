import { Person } from 'shared/types'
import { getFirstCountry } from 'features/persons/utils/getFirstCountry'

const OVERLAP_BUFFER = 20
const CURRENT_YEAR = new Date().getFullYear()

/**
 * Checks if two persons overlap in time considering a buffer
 */
function personsOverlap(person1: Person, person2: Person, buffer: number = OVERLAP_BUFFER): boolean {
  const person1End = person1.deathYear ?? CURRENT_YEAR
  const person2End = person2.deathYear ?? CURRENT_YEAR

  return (
    person1.birthYear - buffer <= person2End &&
    person1End + buffer >= person2.birthYear
  )
}

/**
 * Places persons into rows without overlaps
 */
function placePersonsInRows(people: Person[]): Person[][] {
  const rows: Person[][] = []

  for (const person of people) {
    let placed = false

    // Try to place in existing row
    for (const row of rows) {
      const canPlace = row.every((existingPerson) => !personsOverlap(person, existingPerson))

      if (canPlace) {
        row.push(person)
        placed = true
        break
      }
    }

    // Create new row if not placed
    if (!placed) {
      rows.push([person])
    }
  }

  return rows
}

/**
 * Calculate row placement without grouping
 */
function calculateRowPlacementNoGrouping(people: Person[]): Person[][] {
  return placePersonsInRows(people)
}

/**
 * Calculate row placement with grouping by category or country
 */
function calculateRowPlacementWithGrouping(
  people: Person[],
  groupingType: 'category' | 'country',
  allGroups: string[]
): Person[][] {
  const rows: Person[][] = []
  const groupField = groupingType === 'category' ? 'category' : 'country'

  // Group persons by field
  const groups: Record<string, Person[]> = {}

  for (const person of people) {
    const groupValue = groupField === 'country' 
      ? getFirstCountry(person.country)
      : person[groupField]

    if (!groups[groupValue]) {
      groups[groupValue] = []
    }
    groups[groupValue].push(person)
  }

  // Place each group
  for (let i = 0; i < allGroups.length; i++) {
    const groupValue = allGroups[i]
    const groupPeople = groups[groupValue]

    if (groupPeople && groupPeople.length > 0) {
      const groupRows = placePersonsInRows(groupPeople)
      rows.push(...groupRows)

      // Add separator row between groups (except after last group)
      if (i < allGroups.length - 1) {
        rows.push([])
      }
    }
  }

  return rows
}

/**
 * Main function to calculate row placement for timeline
 * Optimized with early returns and extracted helper functions
 */
export function calculateRowPlacement(
  people: Person[],
  groupingType: 'none' | 'category' | 'country',
  allCategories: string[],
  allCountries: string[]
): Person[][] {
  // Early return for empty data
  if (people.length === 0) {
    return []
  }

  // No grouping
  if (groupingType === 'none') {
    return calculateRowPlacementNoGrouping(people)
  }

  // With grouping
  const allGroups = groupingType === 'category' ? allCategories : allCountries
  return calculateRowPlacementWithGrouping(people, groupingType, allGroups)
}

