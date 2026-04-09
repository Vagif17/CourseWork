import type { PrivateChatDTOResponse } from "../../../../../types/chats";
import "./ChatItem.css";

type Props = {
    chat: PrivateChatDTOResponse;
    currentUserId: string | null;
    selectedChatId: number | null;
    onSelectChat: (chatId: number) => void;
};

export default function ChatItem({
                                     chat,
                                     currentUserId,
                                     selectedChatId,
                                     onSelectChat
                                 }: Props) {

    const other = chat.participants.find(p => p.userId !== currentUserId);

    return (
        <div
            className={`chat-item ${selectedChatId === chat.id ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
        >

            <div className="participant">

                <img
                    src={other?.avatarUrl}
                    alt={other?.userName}
                    className="avatar"
                />

                <span>{other?.userName || "Unknown"}</span>

            </div>

        </div>
    );
}