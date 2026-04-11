import type { NewsArticle } from "../types/news";

export function formatNewsShareMessage(article: NewsArticle): string {
    const line = article.summary ? `\n${article.summary.slice(0, 200)}${article.summary.length > 200 ? "…" : ""}` : "";
    return `News: ${article.title}${line}\nLink: ${article.link}`;
}
