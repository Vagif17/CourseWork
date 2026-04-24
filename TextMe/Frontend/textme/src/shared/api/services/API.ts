import axios from "axios"
import { tokenService } from "./tokenService"

import { API_URL } from "../../config/constants/Config"
export { API_URL }

export const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use(async (config) => {

    const token = await tokenService.getValidToken()

    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {

            originalRequest._retry = true

            const token = await tokenService.getValidToken()

            if (!token) {
                return Promise.reject(error)
            }

            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${token}`

            return api(originalRequest)
        }

        return Promise.reject(error)
    }
)