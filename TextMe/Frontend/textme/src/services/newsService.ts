import { api, API_URL } from "./API";
import type { NewsArticle, NewsCategoryId } from "../types/news";

export function decodeNewsImageUrl(url: string): string {
    return url
        .trim()
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");
}

/** Same-origin image URL via API proxy (avoids hotlink / empty img from CDNs). */
export function newsImageDisplayUrl(remoteUrl: string | null | undefined): string | undefined {
    if (!remoteUrl?.trim()) return undefined;
    const clean = decodeNewsImageUrl(remoteUrl);
    const base = API_URL.replace(/\/$/, "");
    return `${base}/News/feed-image?url=${encodeURIComponent(clean)}`;
}

/** Absolute URL for `<img src>` (some browsers resolve relative paths inconsistently inside transforms). */
export function newsImageDisplayUrlAbsolute(remoteUrl: string | null | undefined): string | undefined {
    const rel = newsImageDisplayUrl(remoteUrl);
    if (!rel) return undefined;
    if (/^https?:\/\//i.test(rel)) return rel;
    if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}${rel.startsWith("/") ? "" : "/"}${rel}`;
    }
    return rel;
}

export const newsService = {
    getByCategory: async (category: NewsCategoryId): Promise<NewsArticle[]> => {
        const { data } = await api.get<NewsArticle[]>(`/News/${category}`);
        return data;
    },
};
