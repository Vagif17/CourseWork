import axios from "axios"
import { store } from "../store"
import { logout, login } from "../store/slices/authSlice"

export const API_URL = "http://localhost:5160/api"

export const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token")

    if (token) {
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

            const refreshToken = localStorage.getItem("refreshToken")

            try {

                const response = await axios.post(
                    `${API_URL}/User/refresh`,
                    { refreshToken }
                )

                const newAccessToken = response.data.accessToken
                const newRefreshToken = response.data.refreshToken

                localStorage.setItem("token", newAccessToken)
                localStorage.setItem("refreshToken", newRefreshToken)

                store.dispatch(login(newAccessToken))

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`

                return axios(originalRequest)

            } catch (err) {

                store.dispatch(logout())

                return Promise.reject(err)
            }
        }

        return Promise.reject(error)
    }
)