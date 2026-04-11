/** Ключи категорий совпадают с API: GET /News/{category} */
export type NewsCategoryId = "sports" | "world" | "popculture" | "games";

export interface NewsArticle {
    title: string;
    summary?: string | null;
    link: string;
    imageUrl?: string | null;
    publishedAt?: string | null;
    source: string;
}
