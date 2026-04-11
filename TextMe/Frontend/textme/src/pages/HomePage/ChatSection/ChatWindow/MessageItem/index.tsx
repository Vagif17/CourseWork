import { tryParseNewsChatMessage } from "../../../../../utils/newsChatPayload";
import NewsChatCard from "./NewsChatCard";
import "./MessageItem.css";

type Props = {
    message: any;
    isMyMessage: boolean;
    setSelectedImage: (url: string) => void;
};

export default function MessageItem({
                                        message,
                                        isMyMessage,
                                        setSelectedImage
                                    }: Props) {

    const formatTime = (dateString: string) => {
        if (!dateString) return "";

        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const newsArticle = tryParseNewsChatMessage(message.text);

    return (
        <div className={`message-row ${isMyMessage ? "mine" : "other"}`}>

            <div className={`message-bubble${newsArticle ? " message-bubble--news" : ""}`}>

                {newsArticle ? (
                    <NewsChatCard article={newsArticle} isMine={isMyMessage} />
                ) : (
                    message.text && <div className="message-text">{message.text}</div>
                )}

                {message.mediaUrl && message.mediaType?.startsWith("image") && (
                    <img
                        src={message.mediaUrl}
                        className="message-image"
                        onClick={() => setSelectedImage(message.mediaUrl)}
                    />
                )}

                {message.mediaUrl && message.mediaType?.startsWith("video") && (
                    <video src={message.mediaUrl} className="message-video" controls />
                )}

                {message.mediaUrl && message.mediaType?.startsWith("audio") && (
                    <audio src={message.mediaUrl} controls />
                )}

                <div className="message-meta">
                    <div className="message-time">{formatTime(message.createdAt)}</div>
                    {isMyMessage && (
                        <span className="message-status" aria-label={message.status ?? "Sent"}>
                            {message.status === "Read" ? (
                                <span className="message-status--read">✓✓</span>
                            ) : message.status === "Delivered" ? (
                                <span className="message-status--delivered">✓✓</span>
                            ) : (
                                <span className="message-status--sent">✓</span>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}