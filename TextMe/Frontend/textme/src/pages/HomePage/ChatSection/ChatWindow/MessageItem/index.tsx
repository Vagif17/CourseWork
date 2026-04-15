import { useState } from "react";
import { tryParseNewsChatMessage } from "../../../../../utils/newsChatPayload";
import NewsChatCard from "./NewsChatCard";
import AudioPlayer from "./AudioPlayer";
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
};

export default function MessageItem({
                                        message,
                                        isMyMessage,
                                        isGroup,
                                        setSelectedImage,
                                        currentUserId,
                                        onReply,
                                        onEdit,
                                        onDelete
                                    }: Props) {
    const [showActions, setShowActions] = useState(false);

    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const newsArticle = tryParseNewsChatMessage(message.text);
    const showSenderInfo = isGroup && !isMyMessage;

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
                                {message.replyToMessage.senderId === currentUserId ? "You" : "Participant"}
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
                            <div className="message-text">
                                {message.text}
                                {message.isEdited && <span className="message-edited-flag"> (edited)</span>}
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

                    {showActions && !message.isDeleted && (
                        <div className="message-actions">
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