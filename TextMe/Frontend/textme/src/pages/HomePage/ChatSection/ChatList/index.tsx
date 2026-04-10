import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import type { PrivateChatDTOResponse } from "../../../../types/chats";
import { chatService } from "../../../../services/chatService";
import chatHub from "../../../../hubs/chatHub";
import { getErrorMessage } from "../../../../utils/getErrorMessage";

import ChatListHeader from "./ChatListHeader";
import ChatItem from "./ChatItem";
import AddChatModal from "./AddChatModal";

import "./ChatList.css";

type Props = {
    currentUserId: string | null;
    onSelectChat: (chatId: number) => void;
    selectedChatId: number | null;
};

export default function ChatList({ currentUserId, onSelectChat, selectedChatId }: Props) {

    const [chats, setChats] = useState<PrivateChatDTOResponse[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatService.getAllPrivateChats();
                setChats(data);
            } catch (err: any) {
                toast.error(getErrorMessage(err));
            }
        };

        fetchChats();
    }, [currentUserId]);

    useEffect(() => {

        const handler = (chat: PrivateChatDTOResponse) => {

            setChats(prev => {

                const exists = prev.some(c => c.id === chat.id);

                if (exists) return prev;

                return [chat, ...prev];

            });

        };

        const connect = async () => {

            if (!chatHub.isConnected())
                await chatHub.start();

            chatHub.onReceiveNewChat(handler);

        };

        connect();

        return () => {
            chatHub.offReceiveNewChat(handler);
        };

    }, []);

    const filteredChats = chats.filter(chat => {
        const other = chat.participants.find(p => p.userId !== currentUserId);
        return other?.userName?.toLowerCase().includes(search.toLowerCase());
    });

    const handleChatCreated = (chat: PrivateChatDTOResponse) => {
        setChats(prev => [chat, ...prev]);
    };

    return (
        <div className="chat-list">

            <ChatListHeader
                search={search}
                setSearch={setSearch}
                onAddClick={() => setIsModalOpen(true)}
            />

            <div className="chat-list-content">
                {filteredChats.map(chat => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        currentUserId={currentUserId}
                        selectedChatId={selectedChatId}
                        onSelectChat={onSelectChat}
                    />
                ))}
            </div>

            {isModalOpen && (
                <AddChatModal
                    onClose={() => setIsModalOpen(false)}
                    onCreated={handleChatCreated}
                />
            )}

        </div>
    );
}