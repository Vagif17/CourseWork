import { useRef, useState, useLayoutEffect } from "react";
import { useChatWindow } from "../../../../hooks/useChatWindow";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import PreviewImages from "./PreviewImages";
import ImageModal from "./ImageModal";

import "./ChatWindow.css";

type Props = {
    currentUserId: string | null;
    selectedChatId: number | null;
};

export default function ChatWindow({ currentUserId, selectedChatId }: Props) {
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
    } = useChatWindow(selectedChatId);

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

    return (
        <div className="chat-window">
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
            />

            {selectedImage && (
                <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
            )}
        </div>
    );
}