import { useState, useRef, useEffect } from "react";
import { tryParseNewsChatMessage } from "../../../../shared/lib/utils/newsChatPayload";
import NewsChatCard from "./NewsChatCard";
import AudioPlayer from "./AudioPlayer";
import LocationMessage from "./LocationMessage";
import LiveCanvas from "../../../../features/chat/ui/LiveCanvas";
import { useUserLocation } from "../../../../shared/lib/context/UserLocationContext";
import { getDistance } from "../../../../shared/lib/utils/geoUtils";
import { api } from "../../../../shared/api/services/API";
import "./MessageItem.css";

type Props = {
    message: any;
    isMyMessage: boolean;
    isGroup?: boolean;
    setSelectedImage: (url: string) => void;
    currentUserId: string | null;
    onReply?: (message: any) => void;
    onEdit?: (message: any) => void;
    onDelete?: (messageId: number) => void;
    onReact?: (messageId: number, emoji: string) => void;
};

export default function MessageItem({
                                        message,
                                        isMyMessage,
                                        isGroup,
                                        setSelectedImage,
                                        currentUserId,
                                        onReply,
                                        onEdit,
                                        onDelete,
                                        onReact
                                    }: Props) {
    const [showActions, setShowActions] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const pickerTimeoutRef = useRef<number | null>(null);
    const { position } = useUserLocation();


    const handleMouseEnterPicker = () => {
        if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
        setShowReactionPicker(true);
    };

    const handleMouseLeavePicker = () => {
        pickerTimeoutRef.current = setTimeout(() => {
            setShowReactionPicker(false);
        }, 300);
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const newsArticle = tryParseNewsChatMessage(message.text);
    const showSenderInfo = isGroup && !isMyMessage;

    const reactionGroups = (message.reactions || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.emoji]) acc[curr.emoji] = { count: 0, userIds: [] };
        acc[curr.emoji].count++;
        acc[curr.emoji].userIds.push(curr.userId);
        return acc;
    }, {});

    const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

    if (message.isSystem) {
        return (
            <div className="message-row system">
                <div className="system-message">
                    {message.text}
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`message-row ${isMyMessage ? "mine" : "other"}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {showSenderInfo && (
                <div className="sender-avatar">
                   <img src={message.senderAvatarUrl || "/default-avatar.png"} alt="sender" />
                </div>
            )}

            <div className="message-content-wrapper">
                {showSenderInfo && (
                    <div className="sender-name">{message.senderUserName || "User"}</div>
                )}
                
                <div className={`message-bubble${newsArticle ? " message-bubble--news" : ""}${message.isDeleted ? " message-deleted" : ""}`}>
                    
                    {message.replyToMessage && !message.isDeleted && (
                        <div className="message-reply-block" onClick={() => {
                            
                        }}>
                            <div className="reply-author">
                                {message.replyToMessage.senderId === currentUserId ? "You" : (message.replyToMessage.senderUserName || "Participant")}
                            </div>
                            <div className="reply-text">
                                {message.replyToMessage.text || (message.replyToMessage.mediaType ? "Media" : "Message")}
                            </div>
                        </div>
                    )}

                    {message.isDeleted ? (
                        <div className="message-text deleted-text">This message was deleted</div>
                    ) : newsArticle ? (
                        <NewsChatCard article={newsArticle} isMine={isMyMessage} />
                    ) : (
                        message.text && (
                            <div className={`message-text ${message.mediaType === 'geodrop' ? 'geodrop-text' : ''}`}>
                                {message.mediaType === 'geodrop' ? (
                                    (() => {
                                        if (isMyMessage) return message.text;
                                        if (!position || !message.mediaUrl) {
                                            return <span className="geodrop-locked"><span className="geodrop-icon">🔒</span> Get closer to unlock</span>;
                                        }
                                        const [latStr, lonStr] = message.mediaUrl.split(',');
                                        const dist = getDistance(position[0], position[1], parseFloat(latStr), parseFloat(lonStr));
                                        if (dist > 50) {
                                            return <span className="geodrop-locked"><span className="geodrop-icon">🔒</span> Get closer to unlock ({Math.round(dist)}m away)</span>;
                                        }
                                        return (
                                            <>
                                                <span className="geodrop-icon unlock-anim">🔓</span> {message.text}
                                            </>
                                        );
                                    })()
                                ) : (
                                    message.text
                                )}
                            </div>
                        )
                    )}

                    {!message.isDeleted && message.mediaUrl && message.mediaType?.startsWith("image") && (
                        <img
                            src={message.mediaUrl}
                            className="message-image"
                            onClick={() => setSelectedImage(message.mediaUrl)}
                        />
                    )}

                    {!message.isDeleted && message.mediaUrl && message.mediaType?.startsWith("video") && (
                        <video src={message.mediaUrl} className="message-video" controls />
                    )}

                    {!message.isDeleted && message.mediaUrl && message.mediaType?.startsWith("audio") && (
                        <AudioPlayer src={message.mediaUrl} />
                    )}

                    {!message.isDeleted && message.mediaUrl && 
                     !message.mediaType?.startsWith("image") && 
                     !message.mediaType?.startsWith("video") && 
                     !message.mediaType?.startsWith("audio") && 
                     message.mediaType !== "location" && 
                     message.mediaType !== "geodrop" && 
                     message.mediaType !== "canvas" && (
                        <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="message-file-attachment">
                            <div className="file-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <div className="file-details">
                                <span className="file-name" title={message.mediaUrl.split('/').pop() || "Document"}>
                                    {message.mediaUrl.split('/').pop() || "Document"}
                                </span>
                                <span className="file-action">Download</span>
                            </div>
                        </a>
                    )}

                    {!message.isDeleted && message.mediaUrl && message.mediaType === "location" && (
                        <LocationMessage 
                            latitude={parseFloat(message.mediaUrl.split(',')[0])} 
                            longitude={parseFloat(message.mediaUrl.split(',')[1])} 
                        />
                    )}

                    {!message.isDeleted && message.mediaType === "canvas" && (
                        <LiveCanvas chatId={message.chatId} messageId={message.id} />
                    )}

                    <div className="message-meta">
                        <div className="message-time">{formatTime(message.createdAt)}</div>
                        {isMyMessage && (
                            <span className="message-status" aria-label={message.status ?? "Sent"}>
                                {message.status === "Read" ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="status-icon read">
                                        <path d="M18 6L7 17l-5-5" />
                                        <path d="M22 10L13 19l-5-5" style={{ opacity: 0.8 }} />
                                    </svg>
                                ) : message.status === "Delivered" ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="status-icon delivered">
                                        <path d="M18 6L7 17l-5-5" />
                                        <path d="M22 10L13 19l-5-5" style={{ opacity: 0.8 }} />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="status-icon sent">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </span>
                        )}
                    </div>

                    {Object.keys(reactionGroups).length > 0 && !message.isDeleted && (
                        <div className="message-reactions-row">
                            {Object.entries(reactionGroups).map(([emoji, data]: [string, any]) => {
                                const hasReacted = data.userIds.includes(currentUserId);
                                return (
                                    <button 
                                        key={emoji} 
                                        className={`reaction-pill ${hasReacted ? 'active' : ''}`}
                                        onClick={() => onReact?.(message.id, emoji)}
                                    >
                                        <span className="reaction-emoji">{emoji}</span>
                                        <span className="reaction-count">{data.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {showActions && !message.isDeleted && (
                        <div className="message-actions">
                            <div className="reaction-quick-picker" onMouseEnter={handleMouseEnterPicker} onMouseLeave={handleMouseLeavePicker}>
                                <button className="action-btn-sm" title="React">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                </button>
                                {showReactionPicker && (
                                    <div className="reaction-tooltip">
                                        {commonEmojis.map(emoji => (
                                            <button key={emoji} className="quick-emoji-btn" onClick={() => { onReact?.(message.id, emoji); setShowReactionPicker(false); }}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="action-btn-sm" onClick={() => onReply?.(message)} title="Reply">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            </button>
                            {isMyMessage && (
                                <button className="action-btn-sm" onClick={() => onEdit?.(message)} title="Edit">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            )}
                            {isMyMessage && (
                                <button className="action-btn-sm danger" onClick={() => onDelete?.(message.id)} title="Delete">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}