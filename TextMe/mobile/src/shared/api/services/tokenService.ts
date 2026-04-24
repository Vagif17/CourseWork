import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "../../config/constants/Config";
import { Buffer } from "buffer";

// Полифилл для atob, так как в React Native его нет по умолчанию
const atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

interface RefreshResponse {
    accessToken?: string;
    refreshToken?: string;
}

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;
        return Date.now() >= exp;
    } catch {
        return true;
    }
};

const tokenService = {
    getToken: async () => await SecureStore.getItemAsync("token"),
    
    getRefreshToken: async () => await SecureStore.getItemAsync("refreshToken"),

    setTokens: async (token: string, refreshToken: string) => {
        await SecureStore.setItemAsync("token", token);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
    },

    clearTokens: async () => {
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("refreshToken");
    },

    getValidToken: async (): Promise<string | null> => {
        let token = await tokenService.getToken();
        const refreshToken = await tokenService.getRefreshToken();

        if (token && !isTokenExpired(token)) {
            return token;
        }

        if (!refreshToken) {
            await tokenService.clearTokens();
            return null;
        }

        try {
            const response = await axios.post<RefreshResponse>(
                `${API_URL}/User/refresh`,
                { refreshToken }
            );

            const newToken = response.data.accessToken ?? null;
            const newRefreshToken = response.data.refreshToken ?? null;

            if (!newToken) {
                await tokenService.clearTokens();
                return null;
            }

            await tokenService.setTokens(newToken, newRefreshToken ?? refreshToken);
            return newToken;
        } catch {
            await tokenService.clearTokens();
            return null;
        }
    }
};

export { tokenService };
export default tokenService;
