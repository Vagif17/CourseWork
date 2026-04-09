import { useState, useEffect, useRef } from "react";
import chatHub from "../hubs/chatHub";
import { messageService } from "../services/messageService";
import { toast } from "react-toastify";
import { validateFiles } from "../utils/fileValidatorUtil";
import { voiceRecorderService } from "../services/voiceRecorderService";

export function useChatWindow(selectedChatId: number | null) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [previewImages, setPreviewImages] = useState<{ file: File; url: string }[]>([]);
    const recordIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!selectedChatId) return;

        const messageCallback = (msg: any) => setMessages(prev => [...prev, msg]);

        const init = async () => {
            try {
                if (!chatHub.isConnected()) await chatHub.start();
                await chatHub.joinChat(selectedChatId);

                chatHub.onReceiveMessage(messageCallback);

                const oldMessages = await messageService.getMessages(selectedChatId);
                setMessages(oldMessages);
            } catch (err) {
                console.error("ChatHub init error:", err);
                toast.error("Failed to connect to chat");
            }
        };

        init();

        return () => {
            chatHub.leaveChat(selectedChatId);
            chatHub.offReceiveMessage(messageCallback);
        };
    }, [selectedChatId]);

    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const validated = validateFiles(Array.from(files));
        setPreviewImages(prev => [...prev, ...validated]);
    };

    const removePreviewImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const sendMessage = async () => {
        if (!selectedChatId) return;
        try {
            if (previewImages.length > 0) {
                const urls = await messageService.uploadMedia(previewImages.map(p => p.file));
                for (let i = 0; i < urls.length; i++) {
                    await chatHub.sendMessage(selectedChatId, "", urls[i], previewImages[i].file.type);
                }
            }
            if (text.trim()) await chatHub.sendMessage(selectedChatId, text);
            setText("");
            setPreviewImages([]);
        } catch (err: any) {
            toast.error("Error sending message: " + err.message);
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
            if (selectedChatId) await chatHub.sendMessage(selectedChatId, "", urls[0], "audio/webm");
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
    };
}