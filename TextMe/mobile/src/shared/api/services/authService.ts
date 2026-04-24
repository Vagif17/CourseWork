import { api } from "./API";
import tokenService from "./tokenService";

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    login: async (email: string, password: string): Promise<void> => {
        const response = await api.post<LoginResponse>("/User/login", { email, password });
        await tokenService.setTokens(response.data.accessToken, response.data.refreshToken);
    },

    register: async (data: FormData): Promise<void> => {
        // multipart/form-data for avatar support
        const response = await api.post<LoginResponse>("/User/register", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        await tokenService.setTokens(response.data.accessToken, response.data.refreshToken);
    },

    logout: async () => {
        await tokenService.clearTokens();
    },

    sendRecoveryCode: async (email: string) => {
        await api.post("/User/recovery/send-code", { email });
    },

    verifyRecoveryCode: async (email: string, code: string) => {
        await api.post("/User/recovery/verify", { email, code });
    },

    resetPassword: async (data: any) => {
        // data: { email, code, newPassword }
        await api.post("/User/recovery/change-password", data);
    }
};
