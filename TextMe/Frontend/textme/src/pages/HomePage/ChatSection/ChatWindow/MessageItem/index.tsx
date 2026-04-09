import "./MessageItem.css";

type Props = {
    message: any;
    isMyMessage: boolean;
    setSelectedImage: (url: string) => void;
};

export default function MessageItem({ message, isMyMessage, setSelectedImage }: Props) {
    const messageClass = isMyMessage ? "my-message" : "other-message";

    return (
        <div className={messageClass}>
            {message.text && <div>{message.text}</div>}

    {message.mediaUrl && message.mediaType?.startsWith("image") && (
        <img src={message.mediaUrl} className="message-image" onClick={() => setSelectedImage(message.mediaUrl)} alt="media" />
    )}

    {message.mediaUrl && message.mediaType?.startsWith("video") && (
        <video src={message.mediaUrl} className="message-video" controls />
    )}

    {message.mediaUrl && message.mediaType?.startsWith("audio") && (
        <div className="voice-message">
        <audio src={message.mediaUrl} controls />
    </div>
    )}
    </div>
);
}