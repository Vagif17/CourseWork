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

        const isNewDay = (curr: any, prev: any) => {
            if (!prev) return true;

            return new Date(curr.createdAt).toDateString() !==
                new Date(prev.createdAt).toDateString();
        };

        const formatDateLabel = (date: Date) => {
            const now = new Date();

            if (date.toDateString() === now.toDateString()) return "Today";

            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);

            if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

            return date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        };

        return (
            <div className="messages-list" ref={ref}>

                {messages.map((msg, index) => {

                    const prev = index > 0 ? messages[index - 1] : null;
                    const showDate = isNewDay(msg, prev);

                    const isMyMessage =
                        msg.senderId?.toLowerCase() ===
                        currentUserId?.toLowerCase();

                    return (
                        <div key={msg.id}>

                            {showDate && (
                                <div className="date-separator">
                                    {formatDateLabel(new Date(msg.createdAt))}
                                </div>
                            )}

                            <MessageItem
                                message={msg}
                                isMyMessage={isMyMessage}
                                setSelectedImage={setSelectedImage}
                            />

                        </div>
                    );
                })}

            </div>
        );
    }
);

export default MessagesList;