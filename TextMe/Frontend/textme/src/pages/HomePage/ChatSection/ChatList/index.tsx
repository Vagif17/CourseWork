import { useState, useEffect, useMemo } from "react";
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
    onSelectChat: (chat: PrivateChatDTOResponse) => void;
    selectedChatId: number | null;
    onChatsChange: (chats: PrivateChatDTOResponse[]) => void;
};

function chatSortKey(c: PrivateChatDTOResponse): number {
    if (c.lastMessageAt) return new Date(c.lastMessageAt).getTime();
    return new Date(c.createdAt).getTime();
}

export default function ChatList({ currentUserId, onSelectChat, selectedChatId, onChatsChange }: Props) {
    const [chats, setChats] = useState<PrivateChatDTOResponse[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        onChatsChange(chats);
    }, [chats, onChatsChange]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatService.getAllPrivateChats();
                setChats(data);
            } catch (err: unknown) {
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

        const onList = (payload: { chatId: number; lastMessage?: string | null; lastMessageAt?: string | null }) => {
            setChats(prev => {
                const i = prev.findIndex(c => c.id === payload.chatId);
                if (i === -1) return prev;
                const next = [...prev];
                const cur = next[i]!;
                next[i] = {
                    ...cur,
                    lastMessage: payload.lastMessage ?? cur.lastMessage,
                    lastMessageAt: payload.lastMessageAt ?? cur.lastMessageAt,
                };
                next.sort((a, b) => chatSortKey(b) - chatSortKey(a));
                return next;
            });
        };

        const onPresence = (payload: {
            userId: string;
            presenceHidden: boolean;
            isOnline?: boolean | null;
            lastSeenAt?: string | null;
        }) => {
            setChats(prev =>
                prev.map(chat => ({
                    ...chat,
                    participants: chat.participants.map(p =>
                        p.userId === payload.userId
                            ? {
                                  ...p,
                                  presenceHidden: payload.presenceHidden,
                                  isOnline: payload.isOnline ?? null,
                                  lastSeenAt: payload.lastSeenAt ?? null,
                              }
                            : p
                    ),
                }))
            );
        };

        const connect = async () => {
            if (!chatHub.isConnected()) await chatHub.start();
            chatHub.onReceiveNewChat(handler);
            chatHub.onChatListUpdated(onList);
            chatHub.onUserPresenceUpdated(onPresence);
        };

        connect();

        return () => {
            chatHub.offReceiveNewChat(handler);
            chatHub.offChatListUpdated(onList);
            chatHub.offUserPresenceUpdated(onPresence);
        };
    }, []);

    const filteredChats = useMemo(() => {
        const filtered = chats.filter(chat => {
            const other = chat.participants.find(p => p.userId !== currentUserId);
            return other?.userName?.toLowerCase().includes(search.toLowerCase());
        });
        return [...filtered].sort((a, b) => chatSortKey(b) - chatSortKey(a));
    }, [chats, currentUserId, search]);

    const handleChatCreated = (chat: PrivateChatDTOResponse) => {
        setChats(prev => {
            if (prev.some(c => c.id === chat.id)) return prev;
            return [chat, ...prev];
        });
    };

    return (
        <div className="chat-list">
            <ChatListHeader search={search} setSearch={setSearch} onAddClick={() => setIsModalOpen(true)} />

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
                <AddChatModal onClose={() => setIsModalOpen(false)} onCreated={handleChatCreated} />
            )}
        </div>
    );
}
