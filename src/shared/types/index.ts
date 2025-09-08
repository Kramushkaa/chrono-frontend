export interface Person {
    id: string;
    name: string;
    birthYear: number;
    deathYear: number;
    reignStart?: number;
    reignEnd?: number;
    rulerPeriods?: Array<{
      startYear: number;
      endYear: number;
      countryId?: number;
      countryName?: string;
    }>;
    category: string;
    country: string;
    description: string;
    achievements: string[];
    achievementYears?: number[];
    achievementsWiki?: (string | null)[];
    imageUrl?: string;
    wikiLink?: string | null;
    periods?: Array<{
      startYear: number;
      endYear: number;
      type?: string;
      countryId?: number;
      countryName?: string;
      comment?: string | null;
    }>;
    // Поля для модерации (не всегда присутствуют)
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
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