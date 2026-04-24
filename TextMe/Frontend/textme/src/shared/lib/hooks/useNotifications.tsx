import { useEffect, useRef } from "react";
import chatHub from "../../api/hubs/chatHub";
import { toast } from "react-toastify";
import { getUserId } from "../utils/getUserIdUtil";
import NotificationToast from "../../ui/components/NotificationToast";

export const useNotifications = (activeChatId: number | null, activeTab: string) => {
    const currentUserId = getUserId();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("/sounds/messagenotificationsound.mp3");
    }, []);

    useEffect(() => {
        const handler = (message: any) => {
            if (message.senderId === currentUserId) return;

            const isChatActive = activeTab === "chats" && Number(activeChatId) === Number(message.chatId);
            const isWindowFocused = document.hasFocus();

            if (!isChatActive || !isWindowFocused) {
                audioRef.current?.play().catch(err => console.warn("Notification sound play failed", err));

                toast.info(<NotificationToast message={message} />, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            }
        };

        chatHub.onReceiveMessage(handler);

        return () => {
            chatHub.offReceiveMessage(handler);
        };
    }, [activeChatId, activeTab, currentUserId]);
};
