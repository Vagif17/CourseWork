import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useChat } from "../../../../../../hooks/useChat";
import chatHub from "../../../../../../hubs/chatHub";
import { messageService } from "../../../../../../services/messageService";
import "./ChatWindow.css";
import {validateFiles} from "../../../../../../utils/fileValidatorUtil.ts";

type Props = {
    currentUserId: string | null;
    selectedChatId: number | null;
};

export default function ChatWindow({ currentUserId, selectedChatId }: Props) {

    const [text, setText] = useState("");
    const [previewImages, setPreviewImages] = useState<{ file: File; url: string }[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const { messages } = useChat(selectedChatId);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initHub = async () => {
            try {
                await chatHub.start();
                if (selectedChatId) {
                    await chatHub.joinChat(selectedChatId);
                }
            } catch (err) {
                console.error("Error connecting to SignalR", err);
            }
        };

        initHub();

        return () => {
            if (selectedChatId) {
                chatHub.leaveChat(selectedChatId);
            }
        };
    }, [selectedChatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileChange = () => {
        if (!fileRef.current?.files) return;

        const filesArray = validateFiles(Array.from(fileRef.current.files));
        setPreviewImages(prev => [...prev, ...filesArray]);

        fileRef.current.value = "";
    };

    const removePreviewImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {

        if (!selectedChatId) return;

        try {

            if (previewImages.length > 0) {

                const urls = await messageService.uploadMedia(
                    previewImages.map(p => p.file)
                );

                for (let i = 0; i < urls.length; i++) {

                    await chatHub.sendMessage(
                        selectedChatId,
                        "",
                        urls[i],
                        previewImages[i].file.type
                    );
                }
            }

            if (text.trim()) {

                await chatHub.sendMessage(
                    selectedChatId,
                    text
                );
            }

            setText("");
            setPreviewImages([]);

        } catch (err: any) {

            toast.error("Error sending message: " + err.message);

        }
    };

    if (!selectedChatId) {
        return (
            <div className="chat-window">
                <div className="empty-chat">
                    <div className="empty-chat-content">
                        <div className="empty-icon">💬</div>
                        <h2>Select a chat</h2>
                        <p>Choose a conversation to start messaging</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">

            <div className="messages">

                {messages.map(msg => {

                    const isMyMessage =
                        msg.senderId?.toLowerCase() === currentUserId?.toLowerCase();

                    return (
                        <div
                            key={msg.id}
                            className={isMyMessage ? "my-message" : "other-message"}
                        >

                            {msg.text && <div>{msg.text}</div>}

                            {msg.mediaUrl && msg.mediaType?.startsWith("image") && (
                                <img
                                    src={msg.mediaUrl}
                                    className="message-image"
                                />
                            )}

                            {msg.mediaUrl && msg.mediaType?.startsWith("video") && (
                                <video
                                    src={msg.mediaUrl}
                                    className="message-video"
                                    controls
                                />
                            )}

                        </div>
                    );

                })}

                <div ref={messagesEndRef} />

            </div>

            {previewImages.length > 0 && (

                <div className="preview-wrapper">

                    {previewImages.map((item, index) => (

                        <div
                            key={index}
                            className="single-preview"
                        >

                            {item.file.type.startsWith("image") ? (
                                <img
                                    src={item.url}
                                    className="preview-image"
                                />
                            ) : (
                                <video
                                    src={item.url}
                                    className="preview-image"
                                    controls
                                />
                            )}

                            <button
                                className="remove-btn"
                                onClick={() => removePreviewImage(index)}
                            >
                                ×
                            </button>

                        </div>

                    ))}

                </div>

            )}

            <div className="input-wrapper">

                <div className="input-container">

                    <button
                        className="attach-btn"
                        onClick={() => fileRef.current?.click()}
                    >
                        +
                    </button>

                    <input
                        ref={fileRef}
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileChange}
                    />

                    <input
                        className="message-input"
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") handleSend();
                        }}
                    />

                    <button
                        className="send-btn"
                        onClick={handleSend}
                    >
                        Send
                    </button>

                </div>

            </div>

        </div>
    );
}