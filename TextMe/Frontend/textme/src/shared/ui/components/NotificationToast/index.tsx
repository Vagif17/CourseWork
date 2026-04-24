import "./NotificationToast.css";

type Props = {
    message: any;
};

export default function NotificationToast({ message }: Props) {
    const isGroup = !!message.chatName;
    const mainAvatar = isGroup ? (message.chatAvatarUrl || "/default-group.png") : (message.senderAvatarUrl || "/default-avatar.png");
    const mainTitle = isGroup ? message.chatName : (message.senderUserName || "New Message");
    const text = message.text || (message.mediaUrl ? "Sent a media" : "New message");

    return (
        <div className={`notification-toast ${isGroup ? "is-group" : ""}`}>
            <img src={mainAvatar} alt="" className="noti-avatar" />
            <div className="noti-content">
                <div className="noti-main-title">{mainTitle}</div>
                {isGroup && (
                    <div className="noti-sender-sub">
                        <span className="noti-sender-name">{message.senderUserName}: </span>
                        <span className="noti-text">{text}</span>
                    </div>
                )}
                {!isGroup && <div className="noti-text">{text}</div>}
            </div>
        </div>
    );
}
