import { useState, useMemo } from "react";
import { getUserId } from "../../../utils/getUserIdUtil.ts";
import type { PrivateChatDTOResponse } from "../../../types/chats";
import "./ChatSection.css";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function ChatSection() {
    const currentUserId = getUserId();
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [listChats, setListChats] = useState<PrivateChatDTOResponse[]>([]);

    const activeChat = useMemo(
        () => listChats.find(c => c.id === selectedChatId) ?? null,
        [listChats, selectedChatId]
    );

    return (
        <div className="chat-section">
            <div className="chat-list-wrapper">
                <ChatList
                    currentUserId={currentUserId}
                    selectedChatId={selectedChatId}
                    onChatsChange={setListChats}
                    onSelectChat={chat => setSelectedChatId(chat.id)}
                />
            </div>

            <div className="chat-window-wrapper">
                <ChatWindow
                    currentUserId={currentUserId}
                    selectedChatId={selectedChatId}
                    activeChat={activeChat}
                />
            </div>
        </div>
    );
}
