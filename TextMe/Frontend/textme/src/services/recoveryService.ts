import { api } from "./API.ts";

interface ApiResponse<T = any> {
    message: string;
    data?: T;
}

export const recoveryService = {
    sendCode: async (email: string): Promise<ApiResponse> => {
        try {
            const response = await api.post("/User/recovery/send-code", { Email: email });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: "Failed to send code" };
        }
    },

    verifyCode: async (email: string, code: string): Promise<ApiResponse> => {
        try {
            const response = await api.post<ApiResponse>("/User/recovery/verify", { email, code });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: "Failed to verify code" };
        }
    },

    changePassword: async (email: string, code: string, newPassword: string): Promise<ApiResponse> => {
        try {
            const response = await api.post<ApiResponse>("/User/recovery/change-password", {
                email,
                code,
                newPassword
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: "Failed to reset password" };
        }
    }
};