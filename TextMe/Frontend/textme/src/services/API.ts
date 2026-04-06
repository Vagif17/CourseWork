import axios from "axios"
import { store } from "../store"
import { logout } from "../store/slices/authSlice"
import { tokenService } from "./tokenService"
export const API_URL = "https://coursework-1-1mjp.onrender.com"
//http://localhost:5243/api
export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(async (config) => {
    const token = await tokenService.getValidToken()
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const newToken = await tokenService.getValidToken()

            if (!newToken) {
                store.dispatch(logout())
                return Promise.reject(error)
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
        }

        return Promise.reject(error)
    }
)