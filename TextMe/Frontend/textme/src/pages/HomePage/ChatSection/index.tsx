import { useState, useMemo } from "react";
import { getUserId } from "../../../utils/getUserIdUtil.ts";
import type { ChatDTO } from "../../../types/chats";
import "./ChatSection.css";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import CallModal from "../../../components/CallModal";
import { useWebRTC } from "../../../hooks/useWebRTC";

export default function ChatSection() {
    const currentUserId = getUserId();
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [listChats, setListChats] = useState<ChatDTO[]>([]);
    const activeChat = useMemo(
        () => listChats.find(c => c.id === selectedChatId) ?? null,
        [listChats, selectedChatId]
    );

    const webrtc = useWebRTC(currentUserId);

    const handleSelectChat = (chat: ChatDTO) => {
        setSelectedChatId(chat.id);
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

            <CallModal webrtc={webrtc} />
        </div>
    );
}
