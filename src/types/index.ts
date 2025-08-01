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