import "./ChatListHeader.css";

type Props = {
    search: string;
    setSearch: (value: string) => void;
    onAddClick: () => void;
};

export default function ChatListHeader({ search, setSearch, onAddClick }: Props) {
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

            <button className="add-chat-btn" onClick={onAddClick}>
                +
            </button>

        </div>
    );
}