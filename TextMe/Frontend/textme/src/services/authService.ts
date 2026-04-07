import { api } from "./API";
import { store } from "../store";
import { login, logout } from "../store/slices/authSlice";
import { tokenService } from "./tokenService";
import type { AuthResponse, RegisterRequest, LoginRequest } from "../types/auth";

export const authService = {

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/User/login", data);

        const { accessToken, refreshToken } = response.data;

        tokenService.setTokens(accessToken, refreshToken);

        store.dispatch(login(accessToken));

        return response.data;
    },

    logout: async (): Promise<void> => {
        const refreshToken = tokenService.getRefreshToken();

        try {
            if (refreshToken) {
                await api.post("/User/revoke", { refreshToken });
            }
        } catch {
        }

        tokenService.clearTokens();

        store.dispatch(logout());
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append("UserName", data.userName);
        formData.append("FirstName", data.firstName);
        formData.append("LastName", data.lastName);
        formData.append("Email", data.email);
        formData.append("PhoneNumber", data.phoneNumber);
        formData.append("Password", data.password);
        formData.append("ConfirmPassword", data.confirmPassword);
        if (data.avatar) formData.append("avatar", data.avatar);

        const response = await api.post<AuthResponse>("/User/register", formData);

        const { accessToken, refreshToken } = response.data;

        tokenService.setTokens(accessToken, refreshToken);

        store.dispatch(login(accessToken));

        return response.data;
    }
};