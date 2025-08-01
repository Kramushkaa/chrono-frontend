export interface Person {
    id: string;
    name: string;
    birthYear: number;
    deathYear: number;
    reignStart?: number;
    reignEnd?: number;
    category: string;
    country: string;
    description: string;
    achievements: string[];
    achievementYear1?: number;
    achievementYear2?: number;
    achievementYear3?: number;
    imageUrl?: string;
  }

export interface FilterOptions {
  categories: string[]
  countries: string[]
  timeRange: {
    start: number
    end: number
  }
}

export interface TimelineProps {
  data: Person[]
  timeRange: {
    start: number
    end: number
  }
}

export interface FilterPanelProps {
  data: Person[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
} 