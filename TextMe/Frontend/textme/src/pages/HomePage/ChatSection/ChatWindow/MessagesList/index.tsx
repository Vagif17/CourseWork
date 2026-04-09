import { forwardRef } from "react";
import MessageItem from "../MessageItem";
import "./MessagesList.css";

type Props = {
    messages: any[];
    currentUserId: string | null;
    setSelectedImage: (url: string) => void;
};

const MessagesList = forwardRef<HTMLDivElement, Props>(
    ({ messages, currentUserId, setSelectedImage }, ref) => {
        return (
            <div className="messages-list" ref={ref}>
                {messages.map(msg => (
                    <MessageItem
                        key={msg.id}
                        message={msg}
                        isMyMessage={msg.senderId?.toLowerCase() === currentUserId?.toLowerCase()}
                        setSelectedImage={setSelectedImage}
                    />
                ))}
            </div>
        );
    }
);

export default MessagesList;