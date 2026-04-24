import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type {NewsArticle} from "../../../shared/api/types/news.ts";
import type { PrivateChatDTOResponse } from "../../../shared/api/types/chats.ts";
import {getUserId} from "../../../shared/lib/utils/getUserIdUtil.ts";
import {chatService} from "../../../shared/api/services/chatService.ts";
import {getErrorMessage} from "../../../shared/lib/utils/getErrorMessage.ts";
import {serializeNewsChatMessage} from "../../../shared/lib/utils/newsChatPayload.ts";
import chatHub from "../../../shared/api/hubs/chatHub.ts";
import Modal from "../../../shared/ui/components/Modal";
import {getPrivateChatPartnerName} from "../../../shared/lib/utils/chatDisplayName.ts";

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
