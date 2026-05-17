import { useRef, useState, useLayoutEffect } from "react";
import { useAppSettings } from "../../../shared/lib/context/AppSettingsContext";
import { useChatWindow } from "../../../shared/lib/hooks/useChatWindow";
import type { ChatDTO } from "../../../shared/api/types/chats";
import { formatParticipantPresence } from "../../../shared/lib/utils/presenceFormat";
import MessagesList from "./MessagesList";
import { MessageInput } from "../../../features/chat";
import PreviewImages from "./PreviewImages";
import ImageModal from "./ImageModal";
import { calculateMood } from "../../../shared/lib/utils/moodAnalysis";
import ChatInfoSidebar from "../ChatInfoSidebar";
import { api } from "../../../shared/api/services/API";

import SummarizeOptionsModal from "./SummarizeOptionsModal";
import "./ChatWindow.css";

type Props = {
    currentUserId: string | null;
    selectedChatId: number | null;
    activeChat: ChatDTO | null;
    onStartCall?: (targetUserId: string, targetUserName: string, withVideo: boolean, targetAvatar?: string, callerAvatar?: string) => void;
    onBack?: () => void;
};

export default function ChatWindow({ currentUserId, selectedChatId, activeChat, onStartCall, onBack }: Props) {
    const { typingSoundEnabled, moodBasedUI } = useAppSettings();
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
        recordingType,
        recordingLocked,
        recordTime,
        previewStream,
        previewImages,
        handleFileChange,
        removePreviewImage,
        sendMessage,
        startRecording,
        stopRecording,
        lockRecording,
        cancelRecording,
        replyingMessage,
        setReplyingMessage,
        editingMessage,
        setEditingMessage,
        deleteMessage,
        reactToMessage,
        sendGeoDrop,
        sendCanvasMessage,
    } = useChatWindow(selectedChatId, currentUserId);

    const [showSidebar, setShowSidebar] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);
    const [showSummaryOptions, setShowSummaryOptions] = useState(false);

    const handleSummarize = async (mode?: "unread" | "today" | "custom", date?: string) => {
        if (!mode) {
            setShowSummaryOptions(true);
            return;
        }

        setShowSummaryOptions(false);
        setSummarizing(true);
        try {
            let filteredMessages = [...messages];

            if (mode === "unread") {
                filteredMessages = messages.filter(m => m.status !== "Read" && m.senderId !== currentUserId);
            } else if (mode === "today") {
                const today = new Date().toISOString().split('T')[0];
                filteredMessages = messages.filter(m => m.createdAt.startsWith(today));
            } else if (mode === "custom" && date) {
                filteredMessages = messages.filter(m => m.createdAt.startsWith(date));
            }

            if (filteredMessages.length === 0) {
                alert("No messages found for the selected period.");
                setSummarizing(false);
                return;
            }

            const chatHistory = filteredMessages.map(m => `${m.senderUserName || 'User'}: ${m.text || '[Media]'}`).join('\n');
            const res = await api.post("/ai/summary", { chatHistory });
            setSummary(res.data.text);
        } catch (e: any) {
            console.error("Summary error", e);
            const msg = e.response?.data?.error || e.message || "Unknown error";
            alert(`Failed to summarize chat: ${msg}`);
        } finally {
            setSummarizing(false);
        }
    };

    const prevMessagesLengthRef = useRef(messages.length);

    useLayoutEffect(() => {
        const list = messagesListRef.current;
        if (list && messages.length !== prevMessagesLengthRef.current) {
            prevMessagesLengthRef.current = messages.length;
            list.scrollTo({
                top: list.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages.length]);

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

    const isGroup = activeChat?.isGroup;
    const other = !isGroup ? activeChat?.participants.find(p => p.userId !== currentUserId) : null;

    const displayName = isGroup ? activeChat?.name : other?.userName ?? "Chat";
    const displayAvatar = (isGroup ? activeChat?.groupAvatarUrl : other?.avatarUrl) || "/default-avatar.png";
    const statusText = isGroup 
        ? `${activeChat?.participants.length} members` 
        : formatParticipantPresence(other ?? undefined);

    const currentUserAvatar = activeChat?.participants.find(p => p.userId === currentUserId)?.avatarUrl;

    const moodScore = moodBasedUI ? calculateMood(messages) : 0;
    const positiveIntensity = Math.max(0, moodScore);
    const negativeIntensity = Math.abs(Math.min(0, moodScore));

    return (
        <div 
            className="chat-window" 
            style={{ 
                '--mood-positive': positiveIntensity, 
                '--mood-negative': negativeIntensity 
            } as React.CSSProperties}
        >
            <div className="chat-window-mood-bg" aria-hidden />
            
            <div className="chat-window-main">
                <header className="chat-window-header" onClick={() => setShowSidebar(true)} style={{ cursor: "pointer" }}>
                    {onBack && (
                        <button className="back-btn mobile-only" onClick={(e) => { e.stopPropagation(); onBack(); }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                    )}
                    {displayAvatar ? (
                        <img src={displayAvatar} alt="" className="chat-window-header-avatar" />
                    ) : (
                        <div className="chat-window-header-avatar chat-window-header-avatar--ph" aria-hidden />
                    )}
                    <div className="chat-window-header-text">
                        <div className="chat-window-header-name">{displayName}</div>
                        <div className="chat-window-header-status">{statusText}</div>
                    </div>
                    
                    {!isGroup && other && onStartCall && (
                        <div className="chat-window-call-actions">
                            <button 
                                className={`call-btn-action summarize-btn-header ${summarizing ? 'loading' : ''}`} 
                                onClick={(e) => { e.stopPropagation(); handleSummarize(); }}
                                title="Summarize Chat"
                                disabled={summarizing}
                            >
                                {summarizing ? (
                                    <div className="spinner-sm" />
                                ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M13 8H7"></path><path d="M17 12H7"></path></svg>
                                )}
                            </button>
                            <button className="call-btn-action" onClick={(e) => { e.stopPropagation(); onStartCall(other.userId, other.userName || "User", false, other.avatarUrl, currentUserAvatar); }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </button>
                            <button className="call-btn-action" onClick={(e) => { e.stopPropagation(); onStartCall(other.userId, other.userName || "User", true, other.avatarUrl, currentUserAvatar); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                            </button>
                        </div>
                    )}
                </header>

                <MessagesList
                    messages={messages}
                    currentUserId={currentUserId}
                    isGroup={isGroup}
                    setSelectedImage={setSelectedImage}
                    ref={messagesListRef}
                    onReply={(msg) => { setReplyingMessage(msg); setEditingMessage(null); document.querySelector<HTMLInputElement>('.message-input')?.focus(); }}
                    onEdit={(msg) => { setEditingMessage(msg); setReplyingMessage(null); setText(msg.text || ''); document.querySelector<HTMLInputElement>('.message-input')?.focus(); }}
                    onDelete={deleteMessage}
                    onReact={reactToMessage}
                />
                
                {summary && (
                    <div className="chat-summary-inline">
                        <div className="summary-inline-header">
                            <span>✨ Chat Summary</span>
                            <button onClick={() => setSummary(null)}>✕</button>
                        </div>
                        <div className="summary-inline-content">
                            {(() => {
                                const parts = summary.split('IMPORTANT:');
                                return (
                                    <>
                                        <div className="summary-main-text">{parts[0]}</div>
                                        {parts[1] && (
                                            <div className="summary-important">
                                                <div className="important-badge">ВАЖНО</div>
                                                <div className="important-content">
                                                    {parts[1].trim()}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />

            <PreviewImages images={previewImages} removeImage={removePreviewImage} />

            {replyingMessage && (
                <div className="chat-action-banner">
                    <div className="banner-content">
                        <strong>Replying to {replyingMessage.senderId === currentUserId ? "You" : "Participant"}:</strong> {replyingMessage.text || "Media"}
                    </div>
                    <button className="banner-close" onClick={() => setReplyingMessage(null)}>✕</button>
                </div>
            )}
            {editingMessage && (
                <div className="chat-action-banner">
                    <div className="banner-content">
                        <strong>Editing message:</strong> {editingMessage.text || "Media"}
                    </div>
                    <button className="banner-close" onClick={() => { setEditingMessage(null); setText(''); }}>✕</button>
                </div>
            )}

            <MessageInput
                text={text}
                setText={setText}
                handleSend={() => sendMessage(fileRef)}
                fileRef={fileRef}
                handleFileChange={() => handleFileChange(fileRef.current?.files || null)}
                recording={recording}
                recordingType={recordingType}
                recordingLocked={recordingLocked}
                recordTime={recordTime}
                previewStream={previewStream}
                startRecording={startRecording}
                stopRecording={stopRecording}
                lockRecording={lockRecording}
                cancelRecording={cancelRecording}
                typingAudioRef={typingAudioRef}
                typingSoundEnabled={typingSoundEnabled}
                hasAttachments={previewImages.length > 0}
                onSendGeoDrop={sendGeoDrop}
                onSendCanvasMessage={sendCanvasMessage}
            />
            {showSummaryOptions && (
                <SummarizeOptionsModal 
                    onClose={() => setShowSummaryOptions(false)} 
                    onSelect={(mode, date) => handleSummarize(mode, date)}
                />
            )}
            </div>

            {showSidebar && (
                <div className="mobile-sidebar-overlay" onClick={() => setShowSidebar(false)} />
            )}
            <ChatInfoSidebar 
                isOpen={showSidebar} 
                onClose={() => setShowSidebar(false)} 
                messages={messages} 
                onSelectImage={setSelectedImage}
            />



            {selectedImage && <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
}
