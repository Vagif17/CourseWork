import type { NewsArticle } from "../../../../shared/api/types/news";
import { NewsFeedImage } from "../../../news";
import "./NewsChatCard.css";

type Props = {
    article: NewsArticle;
    isMine: boolean;
};

export default function NewsChatCard({ article, isMine }: Props) {
    return (
        <a
            className={`news-chat-card ${isMine ? "news-chat-card--mine" : "news-chat-card--other"}`}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
        >
            {article.imageUrl ? (
                <div className="news-chat-card-media">
                    <NewsFeedImage imageUrl={article.imageUrl} className="news-chat-card-img" eager />
                </div>
            ) : (
                <div className="news-chat-card-media news-chat-card-media--empty" aria-hidden />
            )}
            <div className="news-chat-card-body">
                <span className="news-chat-card-eyebrow">{article.source ?? "News"}</span>
                <span className="news-chat-card-title">{article.title}</span>
                {article.summary && <p className="news-chat-card-summary">{article.summary}</p>}
                <span className="news-chat-card-cta">Open article</span>
            </div>
        </a>
    );
}
