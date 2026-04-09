import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../../../../components/Modal";
import { chatService } from "../../../../../services/chatService";
import type { PrivateChatDTOResponse } from "../../../../../types/chats";

import "./AddChatModal.css";

type Props = {
    onClose: () => void;
    onCreated: (chat: PrivateChatDTOResponse) => void;
};

export default function AddChatModal({ onClose, onCreated }: Props) {

    const [newContact, setNewContact] = useState("");

    const handleAdd = async () => {

        if (!newContact.trim()) {
            toast.error("Enter email or phone");
            return;
        }

        try {

            const chat = await chatService.createChat(newContact.trim());

            onCreated(chat);
            setNewContact("");
            onClose();

            toast.success("Chat successfully created!");

        } catch (err: any) {

            toast.error(
                err?.response?.data?.message ||
                err.message ||
                "Chat create failed"
            );

        }
    };

    return (
        <Modal onClose={onClose}>

            <div className="add-chat-modal">

                <h2>Add New Contact</h2>

                <input
                    type="text"
                    placeholder="Enter phone or email"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                />

                <div className="modal-buttons">

                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="add-btn" onClick={handleAdd}>
                        Add Chat
                    </button>

                </div>

            </div>

        </Modal>
    );
}