import Modal from "../../../components/Modal";
import type { NewsArticle } from "../../../types/news";
import NewsFeedImage from "./NewsFeedImage";
import "./NewsFeedSection.css";

type Props = {
    article: NewsArticle;
    onClose: () => void;
    onShare: () => void;
};

export default function NewsArticleReaderModal({ article, onClose, onShare }: Props) {
    return (
        <Modal onClose={onClose}>
            <h2 style={{ marginTop: 0, fontSize: 18, lineHeight: 1.35 }}>{article.title}</h2>
            <p style={{ fontSize: 12, opacity: 0.65, margin: "6px 0 12px" }}>
                {article.source}
                {article.publishedAt && ` · ${new Date(article.publishedAt).toLocaleString()}`}
            </p>
            {article.imageUrl && (
                <div style={{ width: "100%", maxHeight: 200, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                    <NewsFeedImage imageUrl={article.imageUrl} className="news-reader-hero-img" eager />
                </div>
            )}
            {article.summary && (
                <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9, margin: "0 0 12px" }}>{article.summary}</p>
            )}
            <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>
                Full articles open on the publisher&apos;s site. RSS only provides a title and summary here.
            </p>
            <div className="news-reader-actions">
                <a className="news-reader-btn primary" href={article.link} target="_blank" rel="noopener noreferrer">
                    Open source
                </a>
                <button type="button" className="news-reader-btn secondary" onClick={onShare}>
                    Share to chat
                </button>
            </div>
        </Modal>
    );
}
