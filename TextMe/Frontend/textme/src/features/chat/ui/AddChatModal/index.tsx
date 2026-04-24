import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "../../../../shared/ui/components/Modal";
import { chatService } from "../../../../shared/api/services/chatService";
import { authService } from "../../../../shared/api/services/authService";
import type { PrivateChatDTOResponse } from "../../../../shared/api/types/chats";
import { getErrorMessage } from "../../../../shared/lib/utils/getErrorMessage";
import { getUserId } from "../../../../shared/lib/utils/getUserIdUtil";

import "./AddChatModal.css";

type Props = {
    onClose: () => void;
    onCreated: (chat: PrivateChatDTOResponse) => void;
};

interface Suggestion {
    userId: string;
    userName: string;
    avatarUrl: string | null;
}

export default function AddChatModal({ onClose, onCreated }: Props) {

    const [newContact, setNewContact] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (newContact.trim().length > 2) {
            const delay = setTimeout(async () => {
                setLoading(true);
                try {
                    const users = await authService.searchUsers(newContact.trim());
                    const actualUserId = getUserId();
                    setSuggestions(users.filter(u => u.userId !== actualUserId));
                } catch (err) {
                    console.error("Search failed:", err);
                } finally {
                    setLoading(false);
                }
            }, 400);
            return () => clearTimeout(delay);
        } else {
            setSuggestions([]);
        }
    }, [newContact]);

    const handleAdd = async (contact?: string) => {
        const query = contact || newContact.trim();

        if (!query) {
            toast.error("Enter username, email or phone");
            return;
        }

        try {
            const chat = await chatService.createChat(query);
            onCreated(chat);
            setNewContact("");
            onClose();
            toast.success("Chat successfully created!");
        } catch (err: any) {
            toast.error(getErrorMessage(err));
        }
    };

    return (
        <Modal onClose={onClose}>

            <div className="add-chat-modal">

                <h2>Add New Contact</h2>

                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Enter username, phone or email"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                    />
                    {loading && <div className="input-spinner" />}
                </div>

                {suggestions.length > 0 && (
                    <div className="suggestions-list">
                        {suggestions.map(u => (
                            <div
                                key={u.userId}
                                className="suggestion-item"
                                onClick={() => handleAdd(u.userName)}
                            >
                                <img src={u.avatarUrl || "/default-avatar.png"} alt="" />
                                <div className="suggestion-info">
                                    <span className="suggestion-name">{u.userName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-buttons">

                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="add-btn" onClick={() => handleAdd()}>
                        Add Chat
                    </button>

                </div>

            </div>

        </Modal>
    );
}