import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ImageCarousel from "../../../components/ImageCarousel/ImageCarousel.tsx";
import { newsService } from "../../../services/newsService";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { NewsArticle, NewsCategoryId } from "../../../types/news";
import NewsCategoryBar from "./NewsCategoryBar";
import NewsArticleReaderModal from "./NewsArticleReaderModal";
import ShareNewsToChatModal from "./ShareNewsToChatModal";
import "./NewsFeedSection.css";

function clipNewsDescription(text: string | null | undefined, maxChars = 180): string | undefined {
    const t = text?.trim();
    if (!t) return undefined;
    if (t.length <= maxChars) return t;
    return `${t.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

/** Short relative age for the meta strip (e.g. "2h ago"). */
function formatNewsPublishedAge(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return null;
    const diffSec = (Date.now() - then) / 1000;
    if (diffSec < 45) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NewsFeedSection() {
    const [category, setCategory] = useState<NewsCategoryId>("world");
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [readerArticle, setReaderArticle] = useState<NewsArticle | null>(null);
    const [shareArticle, setShareArticle] = useState<NewsArticle | null>(null);
    const [centerArticle, setCenterArticle] = useState<NewsArticle | null>(null);

    const carouselItems = useMemo(
        () =>
            articles.map(a => ({
                id: a.link,
                imageUrl: a.imageUrl ?? "",
                title: a.title,
                description: clipNewsDescription(a.summary),
                data: a,
            })),
        [articles]
    );

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const data = await newsService.getByCategory(category);
                if (!cancelled) setArticles(data);
            } catch (e) {
                if (!cancelled) {
                    setArticles([]);
                    toast.error(getErrorMessage(e, "Could not load news"));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [category]);

    useEffect(() => {
        if (articles.length === 0) setCenterArticle(null);
    }, [articles]);

    const centerArticleAge = centerArticle ? formatNewsPublishedAge(centerArticle.publishedAt) : null;

    return (
        <div className="news-feed">
            <h1>News feed</h1>
            <p className="news-feed-sub">
                Pick a category and browse the carousel: tap the front card for a summary, use the share icon to send to
                chat, or open the original on the publisher&apos;s site from the strip below. Cached for a few minutes.
            </p>

            <NewsCategoryBar active={category} onSelect={setCategory} />

            {loading ? (
                <p>Loading…</p>
            ) : (
                <>
                    <div className="news-feed-carousel-bleed">
                        <ImageCarousel<NewsArticle>
                            key={category}
                            className="image-carousel--bleed"
                            items={carouselItems}
                            cycleMs={26_000}
                            stepPx={72}
                            onActiveItemChange={it => setCenterArticle(it.data ?? null)}
                            onCenterClick={it => {
                                const a = it.data;
                                if (a) setReaderArticle(a);
                            }}
                            onShareCenter={it => {
                                const a = it.data;
                                if (a) setShareArticle(a);
                            }}
                        />
                    </div>
                    {centerArticle && (
                        <div className="news-feed-active-meta" aria-live="polite">
                            <div className="news-feed-active-meta-row">
                                <span className="news-feed-active-source">{centerArticle.source}</span>
                                {centerArticleAge && (
                                    <>
                                        <span className="news-feed-active-sep" aria-hidden>
                                            ·
                                        </span>
                                        <span className="news-feed-active-age">{centerArticleAge}</span>
                                    </>
                                )}
                                <span className="news-feed-active-sep" aria-hidden>
                                    ·
                                </span>
                                <a
                                    className="news-feed-original-link"
                                    href={centerArticle.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open original
                                </a>
                            </div>
                            <p className="news-feed-active-hint">Tap the center card for the in-app summary.</p>
                        </div>
                    )}
                </>
            )}

            {readerArticle && (
                <NewsArticleReaderModal
                    article={readerArticle}
                    onClose={() => setReaderArticle(null)}
                    onShare={() => {
                        setShareArticle(readerArticle);
                        setReaderArticle(null);
                    }}
                />
            )}

            {shareArticle && <ShareNewsToChatModal article={shareArticle} onClose={() => setShareArticle(null)} />}
        </div>
    );
}
