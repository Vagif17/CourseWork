import { useState, useMemo } from "react";
import { getUserId } from "../../shared/lib/utils/getUserIdUtil.ts";
import type { ChatDTO } from "../../shared/api/types/chats";
import "./ChatSection.css";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

type Props = {
    selectedChatId: number | null;
    setSelectedChatId: (id: number | null) => void;
    webrtc: any;
};

export default function ChatSection({ selectedChatId, setSelectedChatId, webrtc }: Props) {
    const currentUserId = getUserId();

    const [listChats, setListChats] = useState<ChatDTO[]>([]);

    const activeChat = useMemo(
        () => listChats.find(c => c.id === selectedChatId) ?? null,
        [listChats, selectedChatId]
    );

    const handleSelectChat = (chat: ChatDTO | null) => {
        setSelectedChatId(chat?.id ?? null);
    };

    return (
        <div className="chat-section">
            <div className="chat-list-wrapper">
                <ChatList
                    currentUserId={currentUserId}
                    selectedChatId={selectedChatId}
                    onChatsChange={setListChats}
                    onSelectChat={handleSelectChat}
                />
            </div>

            <div className="chat-window-wrapper">
                <ChatWindow
                    currentUserId={currentUserId}
                    selectedChatId={selectedChatId}
                    activeChat={activeChat}
                    onStartCall={webrtc.startCall}
                />
            </div>
        </div>
    );
}
