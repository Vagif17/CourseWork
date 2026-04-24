import type { TabId } from "../../shared/api/types/tabs.ts";
import "./SidebarNav.css";

const items: { id: TabId; label: string; icon: "chats" | "settings" | "profile" | "news" }[] = [
    { id: "chats", label: "Chats", icon: "chats" },
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "profile", label: "Account", icon: "profile" },
    { id: "news", label: "News", icon: "news" },
];

function NavIcon({ name }: { name: (typeof items)[number]["icon"] }) {
    const stroke = "currentColor";
    const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
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
        default:
            return null;
    }
}

type Props = {
    activeTab: TabId;
    onSelect: (tab: TabId) => void;
};

export default function Index({ activeTab, onSelect }: Props) {
    return (
        <nav className="sidebar-nav" aria-label="Main">
            {items.map(({ id, label, icon }) => (
                <button
                    key={id}
                    type="button"
                    className={`sidebar-nav-item ${activeTab === id ? "active" : ""}`}
                    onClick={() => onSelect(id)}
                    title={label}
                >
                    <span className="sidebar-nav-icon">
                        <NavIcon name={icon} />
                    </span>
                    <span className="sidebar-nav-label">{label}</span>
                </button>
            ))}
        </nav>
    );
}
