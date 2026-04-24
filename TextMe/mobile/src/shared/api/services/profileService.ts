import { api } from "./API";

export const profileService = {
    getMe: async () => {
        const response = await api.get("/Profile/me");
        return response.data;
    },

    updateMe: async (data: { userName: string; firstName: string; lastName: string; avatar?: any }) => {
        const formData = new FormData();
        formData.append("userName", data.userName);
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);

        if (data.avatar) {
            formData.append("avatar", data.avatar as any);
        }

        const response = await api.put("/Profile/me", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },

    changePassword: async (data: any) => {
        await api.post("/Profile/change-password", data);
    },

    updatePrivacy: async (data: { shareOnlineStatus: boolean }) => {
        const response = await api.put("/Profile/me/privacy", data);
        return response.data;
    }
};
