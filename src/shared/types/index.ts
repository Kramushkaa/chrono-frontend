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