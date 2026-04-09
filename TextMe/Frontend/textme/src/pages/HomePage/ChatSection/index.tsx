import { useState } from "react";
import { getUserId } from "../../../utils/getUserIdUtil.ts";
import "./ChatSection.css";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function ChatSection() {
    const currentUserId = getUserId();
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    return (
        <div className="chat-section">
            <div className="chat-list-wrapper">
                <ChatList
                    currentUserId={currentUserId}
                    selectedChatId={selectedChatId}
                    onSelectChat={setSelectedChatId}
                />
            </div>

            <div className="chat-window-wrapper">
                <ChatWindow
                    currentUserId={currentUserId}
                    selectedChatId={selectedChatId}
                />
            </div>
        </div>
    );
}