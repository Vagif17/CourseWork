import { useState, useEffect, useRef, useCallback } from "react";
import chatHub from "../../api/hubs/chatHub";
import { messageService } from "../../api/services/messageService";
import { toast } from "react-toastify";
import { validateFiles } from "../utils/fileValidatorUtil";
import { voiceRecorderService } from "../../api/services/voiceRecorderService";

export function useChatWindow(selectedChatId: number | null, currentUserId: string | null) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [previewImages, setPreviewImages] = useState<{ file: File; url: string }[]>([]);
    
    // Message management state
    const [replyingMessage, setReplyingMessage] = useState<any | null>(null);
    const [editingMessage, setEditingMessage] = useState<any | null>(null);
    
    const recordIntervalRef = useRef<number | null>(null);
    const selectedChatIdRef = useRef(selectedChatId);
    selectedChatIdRef.current = selectedChatId;

    const mergeStatus = useCallback((messageId: number, status: string) => {
        setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, status } : m)));
    }, []);

    useEffect(() => {
        setReplyingMessage(null);
        setEditingMessage(null);
        setText("");
        setPreviewImages([]);

        if (!selectedChatId) return;

        const messageCallback = async (msg: any) => {
            if (msg.chatId !== selectedChatIdRef.current) return;
            setMessages(prev => [...prev, msg]);
            const uid = currentUserId?.toLowerCase();
            const mine = msg.senderId?.toLowerCase() === uid;
            if (!mine && typeof msg.id === "number") {
                try {
                    await chatHub.ackMessageDelivered(msg.id);
                } catch {
                    /* ignore */
                }
            }
        };

        const statusCallback = (payload: { messageId: number; chatId: number; status: string }) => {
            if (payload.chatId !== selectedChatIdRef.current) return;
            mergeStatus(payload.messageId, payload.status);
        };

        const editedCallback = (updatedMsg: any) => {
            if (updatedMsg.chatId !== selectedChatIdRef.current) return;
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        };

        const deletedCallback = (payload: { messageId: number; chatId: number }) => {
            if (payload.chatId !== selectedChatIdRef.current) return;
            setMessages(prev => prev.map(m => m.id === payload.messageId ? { ...m, isDeleted: true, text: "This message was deleted.", mediaUrl: null, mediaType: null } : m));
        };

        const init = async () => {
            try {
                if (!chatHub.isConnected()) await chatHub.start();
                await chatHub.joinChat(selectedChatId);

                chatHub.onReceiveMessage(messageCallback);
                chatHub.onMessageStatusUpdated(statusCallback);
                chatHub.onMessageEdited(editedCallback);
                chatHub.onMessageDeleted(deletedCallback);

                const oldMessages = await messageService.getMessages(selectedChatId);
                setMessages(oldMessages);
                try {
                    await chatHub.markChatAsRead(selectedChatId);
                } catch {
                    /* ignore */
                }
            } catch (err) {
                console.error("ChatHub init error:", err);
                toast.error("Failed to connect to chat");
            }
        };

        init();

        return () => {
            chatHub.leaveChat(selectedChatId);
            chatHub.offReceiveMessage(messageCallback);
            chatHub.offMessageStatusUpdated(statusCallback);
            chatHub.offMessageEdited(editedCallback);
            chatHub.offMessageDeleted(deletedCallback);
        };
    }, [selectedChatId, currentUserId, mergeStatus]);

    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const validated = validateFiles(Array.from(files));
        setPreviewImages(prev => [...prev, ...validated]);
    };

    const removePreviewImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const sendMessage = async (fileRef?: React.RefObject<HTMLInputElement | null>) => {
        if (!selectedChatId) return;
        try {
            if (editingMessage) {
                if (text.trim()) {
                    await chatHub.editMessage(editingMessage.id, text);
                }
                setEditingMessage(null);
                setText("");
                return;
            }

            if (previewImages.length > 0) {
                const urls = await messageService.uploadMedia(previewImages.map(p => p.file));
                for (let i = 0; i < urls.length; i++) {
                    await chatHub.sendMessage(selectedChatId, "", urls[i], previewImages[i].file.type);
                }
                // Очищаем физический input
                if (fileRef?.current) {
                    fileRef.current.value = "";
                }
            }
            if (text.trim()) {
                await chatHub.sendMessage(selectedChatId, text, undefined, undefined, undefined, replyingMessage?.id);
            }
            setText("");
            setPreviewImages([]);
            setReplyingMessage(null);
        } catch (err: any) {
            toast.error("Error sending message: " + err.message);
        }
    };

    const deleteMessage = async (messageId: number) => {
        try {
            await chatHub.deleteMessage(messageId);
        } catch (err: any) {
            toast.error("Failed to delete message: " + err.message);
        }
    };

    const startRecording = async () => {
        if (recording) return;
        try {
            await voiceRecorderService.start();
            setRecording(true);
            setRecordTime(0);
            recordIntervalRef.current = window.setInterval(() => setRecordTime(prev => prev + 1), 1000);
        } catch {
            toast.error("Microphone permission denied");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setRecording(false);
        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;

        try {
            const result = await voiceRecorderService.stop();
            if (!result || result.file.size === 0) throw new Error("Recorded audio is empty");
            const urls = await messageService.uploadMedia([result.file]);
            if (selectedChatId) await chatHub.sendMessage(selectedChatId, "", urls[0], result.type);
        } catch (err: any) {
            toast.error("Voice Message Error: " + (err.message || err));
        }
    };

    return {
        messages,
        text,
        setText,
        recording,
        recordTime,
        previewImages,
        handleFileChange,
        removePreviewImage,
        sendMessage,
        startRecording,
        stopRecording,
        replyingMessage,
        setReplyingMessage,
        editingMessage,
        setEditingMessage,
        deleteMessage,
    };
}
