import { store } from "../store"
import { login, logout } from "../store/slices/authSlice"
import axios from "axios"
import { API_URL } from "./API"

export const tokenService = {
    getToken: (): string | null => localStorage.getItem("token"),
    getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),

    getValidToken: async (): Promise<string | null> => {
        const token = localStorage.getItem("token")
        const refreshToken = localStorage.getItem("refreshToken")

        if (token) return token // токен есть, возвращаем его

        if (!refreshToken) {
            store.dispatch(logout())
            return null
        }

        try {
            const response = await axios.post(`${API_URL}/User/refresh`, { refreshToken })
            const newAccessToken = response.data.accessToken
            const newRefreshToken = response.data.refreshToken

            localStorage.setItem("token", newAccessToken)
            localStorage.setItem("refreshToken", newRefreshToken)
            store.dispatch(login(newAccessToken))

            return newAccessToken
        } catch (err) {
            store.dispatch(logout())
            return null
        }
    },
}