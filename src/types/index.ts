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
    achievementsWiki?: (string | null)[];
    achievementYear1?: number;
    achievementYear2?: number;
    achievementYear3?: number;
    imageUrl?: string;
    wikiLink?: string | null;
  } 