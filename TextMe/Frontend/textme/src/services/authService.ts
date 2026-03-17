import axios from "axios";
import type { AuthResponse } from "../types/auth";

const API_URL = "http://localhost:5160/api/User";

export const authService = {

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const payload = { Email: email, Password: password };

        const response = await axios.post<AuthResponse>(
            `${API_URL}/login`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    },

    register: async (formData: FormData): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>(
            `${API_URL}/register`,
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