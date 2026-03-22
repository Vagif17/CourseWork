import type { AuthResponse } from "../types/auth";
import { API_URL } from "./API.ts";

export const authService = {

    login: async (email: string, password: string): Promise<AuthResponse> => {

        const payload = { Email: email, Password: password };

        const response = await API_URL.post<AuthResponse>(
            "/User/login",
            payload
        );

        return response.data;
    },

    register: async (formData: FormData): Promise<AuthResponse> => {

        const response = await API_URL.post<AuthResponse>(
            "/User/register",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
};