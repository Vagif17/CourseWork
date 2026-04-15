import "./ChatListHeader.css";

type Props = {
    search: string;
    setSearch: (value: string) => void;
    onAddClick: () => void;
    onAddGroupClick: () => void;
};

export default function ChatListHeader({ search, setSearch, onAddClick, onAddGroupClick }: Props) {
    return (
        <div className="chat-header">

            <div className="search-wrapper">
                <input
                    type="text"
                    placeholder="🔍 Search chats..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="header-actions">
                <button className="add-chat-btn" onClick={onAddClick} title="New Chat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button className="add-group-btn" onClick={onAddGroupClick} title="New Group">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </button>
            </div>

        </div>
    );
}