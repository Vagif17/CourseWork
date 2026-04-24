import { api } from "./API";

export const messageService = {
    getMessages: async (chatId: number) => {
        const response = await api.get(`/Message/${chatId}`);
        return response.data;
    },

    uploadMedia: async (files: any[]) => {
        const formData = new FormData();
        files.forEach(file => {
            // В React Native FormData ожидает объект с uri, name и type
            formData.append("files", file as any);
        });

        const response = await api.post<string[]>("/Message/upload-media", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }
};
