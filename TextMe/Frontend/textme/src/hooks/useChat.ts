import { useEffect, useState } from "react";
import chatHub from "../hubs/chatHub.ts";
import { messageService } from "../services/messageService";
import { getUserId } from "../utils/getUserIdUtil.ts";

export const useChat = (chatId: number | null) => {
    const [messages, setMessages] = useState<any[]>([]);
    const currentUserId = getUserId();

    useEffect(() => {
        if (!chatId) return;

        const handler = (msg: any) => {
            setMessages(prev => [...prev, msg]);
        };

        const load = async () => {
            setMessages([]);
            try {
                const msgs = await messageService.getMessages(chatId);
                setMessages(msgs);
            } catch (error) {
                console.error("Error loading messages:", error);
            }

            await chatHub.joinChat(chatId);
            chatHub.onReceiveMessage(handler);
        };

        load();

        return () => {
            chatHub.leaveChat(chatId);
            chatHub.offReceiveMessage(handler);
        };
    }, [chatId, currentUserId]);

    useEffect(() => {
        if (chatId) setMessages([]);
    }, [currentUserId]);

    return { messages };
};