import type { TabId } from "../../shared/api/types/tabs.ts";
import "./SidebarNav.css";
import { useTranslation } from "react-i18next";

const items: { id: TabId; labelKey: string; icon: "chats" | "settings" | "profile" | "news" | "location" }[] = [
    { id: "chats", labelKey: "nav.chats", icon: "chats" },
    { id: "settings", labelKey: "nav.settings", icon: "settings" },
    { id: "profile", labelKey: "nav.profile", icon: "profile" },
    { id: "news", labelKey: "nav.news", icon: "news" },
    { id: "location", labelKey: "nav.location", icon: "location" },
];

function NavIcon({ name }: { name: (typeof items)[number]["icon"] }) {
    const stroke = "currentColor";
    const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (name) {
        case "chats":
            return (
                <svg {...common} aria-hidden>
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            );
        case "settings":
            return (
                <svg {...common} aria-hidden>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            );
        case "profile":
            return (
                <svg {...common} aria-hidden>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case "news":
            return (
                <svg {...common} aria-hidden>
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z" />
                </svg>
            );
        case "location":
            return (
                <svg {...common} aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
            );
        default:
            return null;
    }
}

type Props = {
    activeTab: TabId;
    onSelect: (tab: TabId) => void;
    isChatOpen?: boolean;
};

export default function Index({ activeTab, onSelect, isChatOpen }: Props) {
    const { t } = useTranslation();

    return (
        <nav className={`sidebar-nav ${isChatOpen ? "is-chat-open" : ""}`} aria-label="Main">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => onSelect(item.id)}
                    title={t(item.labelKey)}
                >
                    <span className="sidebar-nav-icon">
                        <NavIcon name={item.icon} />
                    </span>
                    <span className="sidebar-item-label">{t(item.labelKey)}</span>
                </button>
            ))}
        </nav>
    );
}
