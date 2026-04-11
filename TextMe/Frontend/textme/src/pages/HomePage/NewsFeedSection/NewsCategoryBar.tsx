import type { NewsCategoryId } from "../../../types/news";
import "./NewsFeedSection.css";

const CATS: { id: NewsCategoryId; label: string }[] = [
    { id: "sports", label: "Sports" },
    { id: "world", label: "World" },
    { id: "popculture", label: "Pop culture" },
    { id: "games", label: "Games" },
];

type Props = {
    active: NewsCategoryId;
    onSelect: (id: NewsCategoryId) => void;
};

export default function NewsCategoryBar({ active, onSelect }: Props) {
    return (
        <div className="news-category-bar" role="tablist" aria-label="News categories">
            {CATS.map(c => (
                <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={active === c.id}
                    className={`news-cat-btn ${active === c.id ? "active" : ""}`}
                    onClick={() => onSelect(c.id)}
                >
                    {c.label}
                </button>
            ))}
        </div>
    );
}
