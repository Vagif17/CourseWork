import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useChat } from "../../../../../../hooks/useChat";
import chatHub from "../../../../../../hubs/chatHub";
import { messageService } from "../../../../../../services/messageService";
import { voiceRecorderService } from "../../../../../../services/voiceRecorderService";
import "./ChatWindow.css";
import "../../../../../../styles/Global.css";
import { validateFiles } from "../../../../../../utils/fileValidatorUtil.ts";

type Props = {
    currentUserId: string | null;
    selectedChatId: number | null;
};

export default function ChatWindow({ currentUserId, selectedChatId }: Props) {
    const typingAudioRef = useRef<HTMLAudioElement>(new Audio("/sounds/typesound.mp3"));
    const [text, setText] = useState("");
    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const recordIntervalRef = useRef<number | null>(null);

    const [previewImages, setPreviewImages] = useState<{ file: File; url: string }[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { messages } = useChat(selectedChatId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initHub = async () => {
            try {
                await chatHub.start();
                if (selectedChatId) await chatHub.joinChat(selectedChatId);
            } catch (err) {
                console.error("Error connecting to SignalR", err);
            }
        };
        initHub();

        return () => {
            if (selectedChatId) chatHub.leaveChat(selectedChatId);
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
                const urls = await messageService.uploadMedia(previewImages.map(p => p.file));
                for (let i = 0; i < urls.length; i++) {
                    await chatHub.sendMessage(selectedChatId, "", urls[i], previewImages[i].file.type);
                }
            }

            if (text.trim()) await chatHub.sendMessage(selectedChatId, text);

            setText("");
            setPreviewImages([]);
        } catch (err: any) {
            toast.error("Error sending message: " + err.message);
        }
    };

    const startRecording = async () => {
        if (recording) return;
        try {
            await voiceRecorderService.start();
            setRecording(true);
            setRecordTime(0);

            recordIntervalRef.current = window.setInterval(() => {
                setRecordTime(prev => prev + 1);
            }, 1000);
        } catch {
            toast.error("Microphone permission denied");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setRecording(false);

        if (recordIntervalRef.current) {
            clearInterval(recordIntervalRef.current);
            recordIntervalRef.current = null;
        }

        try {
            const result = await voiceRecorderService.stop();

            if (!result || result.file.size === 0) {
                throw new Error("Recorded audio is empty");
            }

            const audio = new Audio(URL.createObjectURL(result.file));
            audio.onloadedmetadata = async () => {
                const urls = await messageService.uploadMedia([result.file]);
                if (selectedChatId) {
                    await chatHub.sendMessage(selectedChatId, "", urls[0], "audio/webm");
                }
            };

            audio.onerror = () => {
                toast.error("Cannot read recorded audio");
            };
        } catch (err: any) {
            console.error(err);
            toast.error("Voice Message Error: " + (err.message || err));
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
                    const isMyMessage = msg.senderId?.toLowerCase() === currentUserId?.toLowerCase();
                    const messageClass = isMyMessage ? "my-message" : "other-message";

                    return (
                        <div key={msg.id} className={messageClass}>
                            {msg.text && <div>{msg.text}</div>}

                            {msg.mediaUrl && msg.mediaType?.startsWith("image") && (
                                <img
                                    src={msg.mediaUrl}
                                    className="message-image"
                                    onClick={() => setSelectedImage(msg.mediaUrl)}
                                    alt="message media"
                                />
                            )}

                            {msg.mediaUrl && msg.mediaType?.startsWith("video") && (
                                <video src={msg.mediaUrl} className="message-video" controls />
                            )}

                            {msg.mediaUrl && msg.mediaType?.startsWith("audio") && (
                                <div className="voice-message">
                                    <audio src={msg.mediaUrl} controls />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {previewImages.length > 0 && (
                <div className="preview-wrapper">
                    {previewImages.map((item, index) => (
                        <div key={index} className="single-preview">
                            {item.file.type.startsWith("image") ? (
                                <img src={item.url} className="preview-image" alt="preview" />
                            ) : (
                                <video src={item.url} className="preview-image" controls />
                            )}
                            <button className="remove-btn" onClick={() => removePreviewImage(index)}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="input-wrapper">
                <div className="input-container">
                    <button className="attach-btn" onClick={() => fileRef.current?.click()}>+</button>
                    <input ref={fileRef} type="file" multiple hidden onChange={handleFileChange} />

                    <input
                        className="message-input"
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={e => {
                            setText(e.target.value);
                            if (typingAudioRef.current) {
                                typingAudioRef.current.currentTime = 0;
                                typingAudioRef.current.play().catch(() => {});
                            }
                        }}
                        onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                    />

                    <div className="recording-wrapper">
                        {recording && (
                            <div className="progress-bar-wrapper">
                                <div className="progress-bar" style={{ width: `${recordTime * 10}px` }} />
                            </div>
                        )}

                        <button
                            className={recording ? "record-btn recording" : "record-btn"}
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={() => recording && stopRecording()}
                        >
                            🎤
                        </button>
                    </div>

                    <button className="send-btn" onClick={handleSend}>Send</button>
                </div>
            </div>

            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <span className="close-modal">×</span>
                    <img src={selectedImage} className="modal-image" onClick={e => e.stopPropagation()} alt="modal" />
                </div>
            )}
        </div>
    );
}