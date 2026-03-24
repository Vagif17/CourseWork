import { useEffect, useState } from "react";
import type { PrivateChatDTOResponse } from "../../../../types/chats";
import { chatService } from "../../../../services/chatService";
import { getUserId } from "../../../../utils/auth.ts";
import  "./ChatSection.css"

function ChatSection() {
    const [chats, setChats] = useState<PrivateChatDTOResponse[]>([]);
    const currentUserId = getUserId();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatService.getAllPrivateChats();
                setChats(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchChats();
    }, []);

    return (
        <>
            <div className="chat-list">
                {chats.map((chat) => {
                    const otherParticipant = chat.participants.find(
                        (p) => p.userId !== currentUserId
                    );

                    return (
                        <div key={chat.id} className="chat-item">
                            <div className="participant">
                                <img
                                    src={otherParticipant?.avatarUrl || "/default-avatar.png"}
                                    alt={otherParticipant?.userName}
                                    className="avatar"
                                />
                                <span>{otherParticipant?.userName || "Unknown"}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="chat-window">
                <div className="messages">
                    <div className="message">Hello!</div>
                    <div className="message">Hi, how are you?</div>
                    <div className="message">I'm good, thanks!</div>
                </div>

                <div className="input-container">
                    <input type="text" placeholder="Type a message..." />
                    <button>Send</button>
                </div>
            </div>
        </>
    );
}

export default ChatSection;