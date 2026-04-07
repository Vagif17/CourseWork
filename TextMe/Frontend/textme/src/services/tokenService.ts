import { store } from "../store";
import { login, logout } from "../store/slices/authSlice";
import axios from "axios";
import { API_URL } from "./API";

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

export const tokenService = {

    getToken: () => localStorage.getItem("token"),

    getRefreshToken: () => localStorage.getItem("refreshToken"),

    setTokens: (token: string, refreshToken: string) => {

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        store.dispatch(login(token));
    },

    clearTokens: () => {

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        store.dispatch(logout());
    },

    getValidToken: async (): Promise<string | null> => {

        let token = tokenService.getToken();
        const refreshToken = tokenService.getRefreshToken();

        if (token && !isTokenExpired(token)) {
            return token;
        }

        if (!refreshToken) {
            tokenService.clearTokens();
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
                tokenService.clearTokens();
                return null;
            }

            tokenService.setTokens(
                newToken,
                newRefreshToken ?? refreshToken
            );

            return newToken;

        } catch {

            tokenService.clearTokens();
            return null;

        }
    }
};