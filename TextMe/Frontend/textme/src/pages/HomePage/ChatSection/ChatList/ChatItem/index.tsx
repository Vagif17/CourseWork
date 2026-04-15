import type { ChatDTO } from "../../../../../types/chats";
import { formatParticipantPresence } from "../../../../../utils/presenceFormat";
import "./ChatItem.css";

type Props = {
    chat: ChatDTO;
    currentUserId: string | null;
    selectedChatId: number | null;
    onSelectChat: (chat: ChatDTO) => void;
    onContextMenu: (e: React.MouseEvent, chat: ChatDTO) => void;
};

export default function ChatItem({ chat, currentUserId, selectedChatId, onSelectChat, onContextMenu }: Props) {
    const isGroup = chat.isGroup;
    const other = !isGroup ? chat.participants.find(p => p.userId !== currentUserId) : null;

    const displayName = isGroup ? chat.name : other?.userName || "Unknown";
    const displayAvatar = (isGroup ? chat.groupAvatarUrl : other?.avatarUrl) || "/default-avatar.png";
    const presenceText = isGroup 
        ? `${chat.participants.length} members` 
        : formatParticipantPresence(other ?? undefined);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        onContextMenu(e, chat);
    };

    return (
        <div
            className={`chat-item ${selectedChatId === chat.id ? "active" : ""}`}
            onClick={() => onSelectChat(chat)}
            onContextMenu={handleContextMenu}
        >
            <div className="participant">
                <img src={displayAvatar} alt="" className="avatar" />
                <div className="participant-text">
                    <span className="participant-name">{displayName}</span>
                    <span className="participant-presence">{presenceText}</span>
                    {chat.lastMessage && <span className="participant-preview">{chat.lastMessage}</span>}
                </div>
            </div>
        </div>
    );
}
