import { useRef, useState, useLayoutEffect } from "react";
import { useAppSettings } from "../../../../context/AppSettingsContext";
import { useChatWindow } from "../../../../hooks/useChatWindow";
import type { PrivateChatDTOResponse } from "../../../../types/chats";
import { formatParticipantPresence } from "../../../../utils/presenceFormat";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import PreviewImages from "./PreviewImages";
import ImageModal from "./ImageModal";

import "./ChatWindow.css";

type Props = {
    currentUserId: string | null;
    selectedChatId: number | null;
    activeChat: PrivateChatDTOResponse | null;
};

export default function ChatWindow({ currentUserId, selectedChatId, activeChat }: Props) {
    const { typingSoundEnabled } = useAppSettings();
    const typingAudioRef = useRef<HTMLAudioElement>(new Audio("/sounds/typesound.mp3"));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesListRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        text,
        setText,
        recording,
        recordTime,
        previewImages,
        handleFileChange,
        removePreviewImage,
        sendMessage,
        startRecording,
        stopRecording,
    } = useChatWindow(selectedChatId, currentUserId);

    useLayoutEffect(() => {
        const list = messagesListRef.current;
        if (list) {
            list.scrollTo({
                top: list.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    if (!selectedChatId)
        return (
            <div className="chat-window empty-chat">
                <div className="empty-chat-content">
                    <div className="empty-icon">💬</div>
                    <h2>Select a chat</h2>
                    <p>Choose a conversation to start messaging</p>
                </div>
            </div>
        );

    const other = activeChat?.participants.find(p => p.userId !== currentUserId);

    return (
        <div className="chat-window">
            <header className="chat-window-header">
                {other?.avatarUrl ? (
                    <img src={other.avatarUrl} alt="" className="chat-window-header-avatar" />
                ) : (
                    <div className="chat-window-header-avatar chat-window-header-avatar--ph" aria-hidden />
                )}
                <div className="chat-window-header-text">
                    <div className="chat-window-header-name">{other?.userName ?? "Chat"}</div>
                    <div className="chat-window-header-status">{formatParticipantPresence(other)}</div>
                </div>
            </header>

            <MessagesList
                messages={messages}
                currentUserId={currentUserId}
                setSelectedImage={setSelectedImage}
                ref={messagesListRef}
            />
            <div ref={messagesEndRef} />

            <PreviewImages images={previewImages} removeImage={removePreviewImage} />

            <MessageInput
                text={text}
                setText={setText}
                handleSend={sendMessage}
                fileRef={fileRef}
                handleFileChange={() => handleFileChange(fileRef.current?.files || null)}
                recording={recording}
                recordTime={recordTime}
                startRecording={startRecording}
                stopRecording={stopRecording}
                typingAudioRef={typingAudioRef}
                typingSoundEnabled={typingSoundEnabled}
            />

            {selectedImage && <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
}
