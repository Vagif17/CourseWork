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

    return (
        <div className={`message-row ${isMyMessage ? "mine" : "other"}`}>

            <div className="message-bubble">

                {message.text && <div className="message-text">{message.text}</div>}

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

                <div className="message-time">
                    {formatTime(message.createdAt)}
                </div>

            </div>

        </div>
    );
}