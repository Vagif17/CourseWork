import type { PrivateChatDTOResponse } from "../../../../../types/chats";
import { formatParticipantPresence } from "../../../../../utils/presenceFormat";
import "./ChatItem.css";

type Props = {
    chat: PrivateChatDTOResponse;
    currentUserId: string | null;
    selectedChatId: number | null;
    onSelectChat: (chat: PrivateChatDTOResponse) => void;
};

export default function ChatItem({ chat, currentUserId, selectedChatId, onSelectChat }: Props) {
    const other = chat.participants.find(p => p.userId !== currentUserId);

    return (
        <div
            className={`chat-item ${selectedChatId === chat.id ? "active" : ""}`}
            onClick={() => onSelectChat(chat)}
        >
            <div className="participant">
                <img src={other?.avatarUrl} alt="" className="avatar" />
                <div className="participant-text">
                    <span className="participant-name">{other?.userName || "Unknown"}</span>
                    <span className="participant-presence">{formatParticipantPresence(other)}</span>
                    {chat.lastMessage && <span className="participant-preview">{chat.lastMessage}</span>}
                </div>
            </div>
        </div>
    );
}
