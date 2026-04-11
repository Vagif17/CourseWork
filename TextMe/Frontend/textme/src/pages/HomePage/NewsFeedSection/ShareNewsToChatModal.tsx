import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../../../components/Modal";
import chatHub from "../../../hubs/chatHub";
import { chatService } from "../../../services/chatService";
import { getUserId } from "../../../utils/getUserIdUtil";
import { getPrivateChatPartnerName } from "../../../utils/chatDisplayName";
import { serializeNewsChatMessage } from "../../../utils/newsChatPayload";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { NewsArticle } from "../../../types/news";
import type { PrivateChatDTOResponse } from "../../../types/chats";
import "./NewsFeedSection.css";

type Props = {
    article: NewsArticle;
    onClose: () => void;
};

export default function ShareNewsToChatModal({ article, onClose }: Props) {
    const [chats, setChats] = useState<PrivateChatDTOResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUserId = getUserId();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const list = await chatService.getAllPrivateChats();
                if (!cancelled) setChats(list);
            } catch (e) {
                toast.error(getErrorMessage(e, "Could not load chats"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const sendTo = async (chatId: number) => {
        const text = serializeNewsChatMessage(article);
        try {
            if (!chatHub.isConnected()) await chatHub.start();
            await chatHub.sendMessage(chatId, text);
            toast.success("Sent to chat");
            onClose();
        } catch (e) {
            toast.error(getErrorMessage(e, "Could not send"));
        }
    };

    return (
        <Modal onClose={onClose}>
            <h3 style={{ marginTop: 0 }}>Share to chat</h3>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
                Pick a conversation. A rich news card is sent — your friend can tap it to open the article.
            </p>
            {loading && <p>Loading…</p>}
            {!loading && chats.length === 0 && (
                <p>No chats yet — add someone from the Chats tab first.</p>
            )}
            <div className="news-share-list">
                {chats.map(c => (
                    <button key={c.id} type="button" className="news-share-chat" onClick={() => sendTo(c.id)}>
                        {getPrivateChatPartnerName(c, currentUserId)}
                    </button>
                ))}
            </div>
        </Modal>
    );
}
