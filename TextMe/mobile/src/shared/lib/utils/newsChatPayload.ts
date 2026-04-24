export const NEWS_CHAT_PREFIX = "TMNEWS:";

export type NewsChatPayloadV1 = {
    v: 1;
    title: string;
    link: string;
    source?: string | null;
    summary?: string | null;
    imageUrl?: string | null;
    publishedAt?: string | null;
};

export function serializeNewsChatMessage(article: any): string {
    const payload: NewsChatPayloadV1 = {
        v: 1,
        title: article.title.slice(0, 400),
        link: article.link || article.url,
        source: article.source ?? null,
        summary: (article.summary || article.description) ? (article.summary || article.description).slice(0, 220) : null,
        imageUrl: article.imageUrl ?? null,
        publishedAt: article.publishedAt ?? null,
    };
    return NEWS_CHAT_PREFIX + JSON.stringify(payload);
}

export function tryParseNewsChatMessage(text: string | null | undefined): any | null {
    if (!text?.startsWith(NEWS_CHAT_PREFIX)) return null;
    try {
        const o = JSON.parse(text.slice(NEWS_CHAT_PREFIX.length)) as NewsChatPayloadV1;
        if (o.v !== 1 || typeof o.title !== "string" || typeof o.link !== "string") return null;
        return {
            title: o.title,
            link: o.link,
            source: o.source ?? "",
            summary: o.summary ?? undefined,
            imageUrl: o.imageUrl ?? undefined,
            publishedAt: o.publishedAt ?? undefined,
        };
    } catch {
        return null;
    }
}
