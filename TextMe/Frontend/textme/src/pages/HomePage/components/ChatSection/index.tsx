import { useState } from "react";
import { getUserId } from "../../../../utils/getUserIdUtil.ts";
import "./ChatSection.css";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

export default function ChatSection() {
    const currentUserId = getUserId();
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    return (
        <>
            <ChatList
                currentUserId={currentUserId}
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
            />

            <ChatWindow
                currentUserId={currentUserId}
                selectedChatId={selectedChatId}
            />
        </>
    );
}