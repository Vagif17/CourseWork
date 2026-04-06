import { api } from "./API.ts"
import type { AuthResponse, RegisterRequest, LoginRequest } from "../types/auth"

export const authService = {

    login: async (data: LoginRequest): Promise<AuthResponse> => {

        const response = await api.post<AuthResponse>(
            "/User/login",
            data
        )

        localStorage.setItem("token", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)

        return response.data
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {

        const formData = new FormData()

        formData.append("UserName", data.userName)
        formData.append("FirstName", data.firstName)
        formData.append("LastName", data.lastName)
        formData.append("Email", data.email)
        formData.append("PhoneNumber", data.phoneNumber)
        formData.append("Password", data.password)
        formData.append("ConfirmPassword", data.confirmPassword)

        if (data.avatar) {
            formData.append("avatar", data.avatar)
        }

        const response = await api.post<AuthResponse>(
            "/User/register",
            formData
        )

        localStorage.setItem("token", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)

        return response.data
    }

}