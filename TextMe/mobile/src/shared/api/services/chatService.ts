import { api } from "./API";

export const chatService = {
    getChats: async () => {
        const response = await api.get("/Chat/getallchats");
        return response.data;
    },

    getChat: async (id: number) => {
        const response = await api.get(`/Chat/${id}`);
        return response.data;
    },

    createPrivateChat: async (emailOrNumber: string) => {
        const response = await api.post(`/Chat/createchat?emailOrNumber=${emailOrNumber}`);
        return response.data;
    },

    createGroup: async (name: string, participantIds: string[], avatarUri?: string | null) => {
        const formData = new FormData();
        formData.append("Name", name);
        participantIds.forEach(id => {
            formData.append("ParticipantIds", id);
        });

        if (avatarUri) {
            const filename = avatarUri.split('/').pop() || 'avatar.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            formData.append("File", {
                uri: avatarUri,
                name: filename,
                type: type
            } as any);
        }

        const response = await api.post("/Chat/creategroup", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    leaveGroup: async (chatId: number) => {
        const response = await api.post(`/Chat/${chatId}/leave`);
        return response.data;
    },

    deleteChat: async (chatId: number) => {
        await api.delete(`/Chat/${chatId}`);
    }
};
