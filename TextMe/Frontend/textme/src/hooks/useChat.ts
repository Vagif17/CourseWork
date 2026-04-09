import {messageService} from "../services/messageService.ts";
import {useEffect, useState} from "react";
import {getUserId} from "../utils/getUserIdUtil.ts";
import chatHub from "../hubs/chatHub.ts";

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

                if (!chatHub.isConnected()) await chatHub.start();

                await chatHub.joinChat(chatId);
                chatHub.onReceiveMessage(handler);
            } catch (error) {
                console.error("Error loading messages:", error);
            }
        };

        load();

        return () => {
            chatHub.leaveChat(chatId);
            chatHub.offReceiveMessage(handler);
        };
    }, [chatId, currentUserId]);

    return { messages };
};