import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import type { PrivateChatDTOResponse } from "../../../../types/chats.ts";
import { chatService } from "../../../../services/chatService.ts";
import Modal from "../../../../components/Modal";
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
    const [newContact, setNewContact] = useState("");

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatService.getAllPrivateChats();
                setChats(data);
            } catch (err: any) {
                toast.error(err?.message || "Error fetching chats");
            }
        };
        fetchChats();
    }, [currentUserId]);

    const filteredChats = chats.filter(chat => {
        const otherParticipant = chat.participants.find(p => p.userId !== currentUserId);
        return otherParticipant?.userName?.toLowerCase().includes(search.toLowerCase());
    });

    const handleAddContact = async () => {
        if (!newContact.trim()) {
            toast.error("Enter email or phone");
            return;
        }
        try {
            const newChat = await chatService.createChat(newContact.trim());
            setChats(prev => [newChat, ...prev]);
            setNewContact("");
            setIsModalOpen(false);
            toast.success("Chat successfully created!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || "Chat create failed");
        }
    };

    return (
        <div className="chat-list">
            <div className="chat-header">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="🔍 Search chats..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button className="add-chat-btn" onClick={() => setIsModalOpen(true)}>+</button>
            </div>

            {filteredChats.map(chat => {
                const otherParticipant = chat.participants.find(p => p.userId !== currentUserId);

                return (
                    <div
                        key={chat.id}
                        className={`chat-item ${selectedChatId === chat.id ? "active" : ""}`}
                        onClick={() => onSelectChat(chat.id)}
                    >
                        <div className="participant">
                            <img
                                src={otherParticipant?.avatarUrl}
                                alt={otherParticipant?.userName}
                                className="avatar"
                            />
                            <span>{otherParticipant?.userName || "Unknown"}</span>
                        </div>
                    </div>
                );
            })}

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <div className="add-chat-modal">
                        <h2>Add New Contact</h2>
                        <input
                            type="text"
                            placeholder="Enter phone or email"
                            value={newContact}
                            onChange={(e) => setNewContact(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="add-btn" onClick={handleAddContact}>Add Chat</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}