import { useEffect, useState } from "react";
import type { PrivateChatDTOResponse } from "../../../../types/chats";
import { chatService } from "../../../../services/chatService";
import { getUserId } from "../../../../utils/auth.ts";
import type { ReactNode } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import { useChat } from "../../../../hooks/useChat";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/index.ts';
import "./ChatSection.css";
import "../../../../styles/Global.css"
import chatHub from "../../../../hubs/chatHub.ts";

type ModalProps = {
    children: ReactNode;
    onClose: () => void;
};

function Modal({ children, onClose }: ModalProps) {
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.getElementById("modal-root") as HTMLElement
    );
}

function ChatSection() {

    const [chats, setChats] = useState<PrivateChatDTOResponse[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    const [search, setSearch] = useState("");
    const [text, setText] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newContact, setNewContact] = useState("");

    const currentUserId = getUserId();

    const { messages, sendMessage } = useChat(selectedChatId);

    const token = useSelector((state: RootState) => state.auth.token);

    // Сбрасываем selectedChatId при смене пользователя
    useEffect(() => {
        setSelectedChatId(null);
    }, [currentUserId]);

    useEffect(() => {
        if (!token) return;

        chatHub.start();
    }, [token]);

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

    const filteredChats = chats.filter((chat) => {
        const otherParticipant = chat.participants.find(
            (p) => p.userId !== currentUserId
        );

        return otherParticipant?.userName
            ?.toLowerCase()
            .includes(search.toLowerCase());
    });

    const handleCreateChat = () => setIsModalOpen(true);

    const handleAddContact = async () => {

        if (!newContact.trim()) {
            toast.error("Enter email or phone");
            return;
        }

        try {

            const newChat = await chatService.createChat(newContact.trim());

            setChats((prev) => [newChat, ...prev]);

            setNewContact("");
            setIsModalOpen(false);

            toast.success("Chat successfully created!");

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message || err.message || "Chat create failed"
            );

        }
    };

    const handleSend = async () => {

        if (!text.trim()) return;

        await sendMessage(text);

        setText("");

    };

    return (
        <>
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

                    <button className="add-chat-btn" onClick={handleCreateChat}>
                        +
                    </button>
                </div>

                {filteredChats.map((chat) => {

                    const otherParticipant = chat.participants.find(
                        (p) => p.userId !== currentUserId
                    );

                    return (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedChatId === chat.id ? "active" : ""}`}
                            onClick={() => setSelectedChatId(chat.id)}
                        >

                            <div className="participant">

                                <img
                                    src={otherParticipant?.avatarUrl}
                                    alt={otherParticipant?.userName}
                                    className="avatar"
                                />

                                <span>
                                    {otherParticipant?.userName || "Unknown"}
                                </span>

                            </div>

                        </div>
                    );
                })}
            </div>

            <div className="chat-window">

                {!selectedChatId ? (
                    <div className="empty-chat">
                        <div className="empty-chat-content">
                            <div className="empty-icon">💬</div>
                            <h2>Select a chat</h2>
                            <p>Choose a conversation from the list to start messaging</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="messages">

                            {messages.map((msg) => {
                                const isMyMessage = msg.senderId?.toLowerCase() === currentUserId?.toLowerCase();
                                return (
                                    <div
                                        key={msg.id}
                                        className={`message ${
                                            isMyMessage
                                                ? "my-message"
                                                : "other-message"
                                        }`}
                                    >

                                        {msg.text}

                                    </div>
                                );
                            })}

                        </div>

                        <div className="input-container">

                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSend();
                                }}
                            />

                            <button onClick={handleSend}>
                                Send
                            </button>

                        </div>
                    </>
                )}

            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>

                    <h2 style={{ textAlign: "center" }}>
                        Add Contact
                    </h2>

                    <input
                        type="text"
                        placeholder="Phone or Email"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                    />

                    <div className="modal-buttons">

                        <button
                            className="cancel-btn"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className="add-btn"
                            onClick={handleAddContact}
                        >
                            Add
                        </button>

                    </div>

                </Modal>
            )}
        </>
    );
}

export default ChatSection;