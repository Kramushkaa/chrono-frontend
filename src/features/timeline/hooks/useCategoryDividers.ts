import { useMemo } from 'react'
import { Person } from 'shared/types'
import { getPersonGroup } from 'features/persons/utils/groupingUtils'
import type { GroupingType } from 'shared/types'

interface CategoryDivider {
  category: string
  top: number
}

/**
 * Calculate category dividers for timeline based on row placement
 * Optimized with useMemo
 */
export function useCategoryDividers(
  rowPlacement: Person[][],
  groupingType: GroupingType
): CategoryDivider[] {
  return useMemo(() => {
    if (groupingType === 'none') {
      return []
    }

    const dividers: CategoryDivider[] = []
    let runningTop = 0
    let lastGroup: string | null = null

    for (const row of rowPlacement) {
      const rowHeight = row.length === 0 ? 20 : 70

      if (row.length > 0) {
        const currentGroup = getPersonGroup(row[0], groupingType)

        if (lastGroup === null || currentGroup !== lastGroup) {
          dividers.push({ category: currentGroup, top: runningTop })
          lastGroup = currentGroup
        }
      }

      runningTop += rowHeight
    }

    return dividers
  }, [rowPlacement, groupingType])
}

