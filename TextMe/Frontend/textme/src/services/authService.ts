import { api } from "./API.ts"
import type { AuthResponse } from "../types/auth"

export const authService = {

    login: async (email: string, password: string): Promise<AuthResponse> => {

        const payload = {
            Email: email,
            Password: password
        }

        const response = await api.post<AuthResponse>(
            "/User/login",
            payload
        )

        localStorage.setItem("token", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)

        return response.data
    },

    register: async (formData: FormData): Promise<AuthResponse> => {

        const response = await api.post<AuthResponse>(
            "/User/register",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )

        localStorage.setItem("token", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)

        return response.data
    }

}