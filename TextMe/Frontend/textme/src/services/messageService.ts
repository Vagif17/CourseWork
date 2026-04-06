import { api } from "../services/API.ts";

export const messageService = {
    async getMessages(chatId: number) {
        const response = await api.get(`/Message/${chatId}`);
        return response.data;
    },

    async uploadMedia(files: File[]) {
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));

        const response = await api.post<string[]>("/Message/upload-media", formData);
        return response.data;
    }
};