import { forwardRef, Fragment } from "react";
import { useAppSettings } from "../../../../shared/lib/context/AppSettingsContext";
import { MessageItem } from "../../../../entities/message";
import "./MessagesList.css";

type Props = {
    messages: any[];
    currentUserId: string | null;
    isGroup?: boolean;
    setSelectedImage: (url: string) => void;
    onReply: (message: any) => void;
    onEdit: (message: any) => void;
    onDelete: (messageId: number) => void;
};

const MessagesList = forwardRef<HTMLDivElement, Props>(
    ({ messages, currentUserId, isGroup, setSelectedImage, onReply, onEdit, onDelete }, ref) => {
        const { messageDensity } = useAppSettings();

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
            <div
                className={`messages-list${messageDensity === "compact" ? " messages-list--compact" : ""}`}
                ref={ref}
            >

                {messages.map((msg, index) => {

                    const prev = index > 0 ? messages[index - 1] : null;
                    const showDate = isNewDay(msg, prev);

                    const isMyMessage =
                        msg.senderId?.toLowerCase() ===
                        currentUserId?.toLowerCase();

                    return (
                        <Fragment key={msg.id}>
                            {showDate && (
                                <div className="date-separator">
                                    {formatDateLabel(new Date(msg.createdAt))}
                                </div>
                            )}

                            <MessageItem
                                message={msg}
                                isMyMessage={isMyMessage}
                                isGroup={isGroup}
                                setSelectedImage={setSelectedImage}
                                currentUserId={currentUserId}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </Fragment>
                    );
                })}

            </div>
        );
    }
);

export default MessagesList;