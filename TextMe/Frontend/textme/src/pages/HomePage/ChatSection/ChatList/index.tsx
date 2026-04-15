import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import type { ChatDTO } from "../../../../types/chats";
import { chatService } from "../../../../services/chatService";
import chatHub from "../../../../hubs/chatHub";
import { getErrorMessage } from "../../../../utils/getErrorMessage";

import ChatListHeader from "./ChatListHeader";
import ChatItem from "./ChatItem";
import AddChatModal from "./AddChatModal";
import CreateGroupModal from "./CreateGroupModal";

import "./ChatList.css";

type Props = {
    currentUserId: string | null;
    onSelectChat: (chat: ChatDTO) => void;
    selectedChatId: number | null;
    onChatsChange: (chats: ChatDTO[]) => void;
};

function chatSortKey(c: ChatDTO): number {
    if (c.lastMessageAt) return new Date(c.lastMessageAt).getTime();
    return new Date(c.createdAt).getTime();
}

export default function ChatList({ currentUserId, onSelectChat, selectedChatId, onChatsChange }: Props) {
    const [chats, setChats] = useState<ChatDTO[]>([]);
    const [search, setSearch] = useState("");
    const [isAddChatModalOpen, setIsAddChatModalOpen] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chat: ChatDTO } | null>(null);

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
        const handler = (chat: ChatDTO) => {
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

        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);

        return () => {
            chatHub.offReceiveNewChat(handler);
            chatHub.offChatListUpdated(onList);
            chatHub.offUserPresenceUpdated(onPresence);
            window.removeEventListener("click", handleClick);
        };
    }, []);

    const filteredChats = useMemo(() => {
        const filtered = chats.filter(chat => {
            let chatName = "";
            if (chat.isGroup) {
                chatName = chat.name || "Group Chat";
            } else {
                const other = chat.participants.find(p => p.userId !== currentUserId);
                chatName = other?.userName || "Chat";
            }
            return chatName.toLowerCase().includes(search.toLowerCase());
        });
        return [...filtered].sort((a, b) => chatSortKey(b) - chatSortKey(a));
    }, [chats, currentUserId, search]);

    const handleChatCreated = (chat: ChatDTO) => {
        setChats(prev => {
            if (prev.some(c => c.id === chat.id)) return prev;
            return [chat, ...prev];
        });
    };

    const handleContextMenu = (e: React.MouseEvent, chat: ChatDTO) => {
        setContextMenu({ x: e.clientX, y: e.clientY, chat });
    };

    const handleDeleteChat = async () => {
        if (!contextMenu) return;
        const chatId = contextMenu.chat.id;
        try {
            await chatService.deleteChat(chatId);
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (selectedChatId === chatId) onSelectChat(null as any); // Reset selected chat
            toast.success("Chat deleted for everyone");
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
        setContextMenu(null);
    };

    const handleLeaveGroup = async () => {
        if (!contextMenu) return;
        const chatId = contextMenu.chat.id;
        try {
            await chatService.leaveGroup(chatId);
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (selectedChatId === chatId) onSelectChat(null as any);
            toast.success("You left the group");
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
        setContextMenu(null);
    };

    return (
        <div className="chat-list">
            <ChatListHeader 
                search={search} 
                setSearch={setSearch} 
                onAddClick={() => setIsAddChatModalOpen(true)} 
                onAddGroupClick={() => setIsCreateGroupModalOpen(true)}
            />

            <div className="chat-list-content">
                {filteredChats.map(chat => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        currentUserId={currentUserId}
                        selectedChatId={selectedChatId}
                        onSelectChat={onSelectChat}
                        onContextMenu={handleContextMenu}
                    />
                ))}
            </div>

            {contextMenu && (
                <div 
                    className="context-menu" 
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    {contextMenu.chat.isGroup ? (
                        <button className="context-menu-item danger" onClick={handleLeaveGroup}>
                            Leave Group
                        </button>
                    ) : (
                        <button className="context-menu-item danger" onClick={handleDeleteChat}>
                            Delete Chat
                        </button>
                    )}
                </div>
            )}

            {isAddChatModalOpen && (
                <AddChatModal onClose={() => setIsAddChatModalOpen(false)} onCreated={handleChatCreated} />
            )}

            <CreateGroupModal 
                isOpen={isCreateGroupModalOpen} 
                onClose={() => setIsCreateGroupModalOpen(false)} 
            />
        </div>
    );
}
