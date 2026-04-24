import type { ChatDTO } from "../types/chats";
import { api } from "./API.ts";

export const chatService = {

    getAllPrivateChats: async (): Promise<ChatDTO[]> => {
        const response = await api.get<ChatDTO[]>(
            "/Chat/getallchats"
        );
        return response.data;
    },

    createChat: async (emailOrNumber: string): Promise<ChatDTO> => {
        const response = await api.post<ChatDTO>("/Chat/createchat", null, {
            params: { emailOrNumber }
        });
        return response.data;
    },

    createGroupChat: async (name: string, participantIds: string[], avatarFile?: File): Promise<ChatDTO> => {
        const formData = new FormData();
        formData.append("name", name);
        participantIds.forEach(id => formData.append("participantIds", id));
        if (avatarFile) {
            formData.append("file", avatarFile);
        }

        const response = await api.post<ChatDTO>("/Chat/creategroup", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    deleteChat: async (chatId: number): Promise<void> => {
        await api.delete(`/Chat/${chatId}`);
    },

    leaveGroup: async (chatId: number): Promise<void> => {
        await api.post(`/Chat/${chatId}/leave`);
    }

};