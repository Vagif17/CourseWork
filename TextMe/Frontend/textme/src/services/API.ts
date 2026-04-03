import axios from "axios"
import { store } from "../store"
import { logout, login } from "../store/slices/authSlice"

export const API_URL = "https://coursework-1-1mjp.onrender.com/api"

export const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token")

    if (token) {
        config.headers = config.headers || {}
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

            if (!refreshToken) {
                store.dispatch(logout())
                return Promise.reject(error)
            }

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

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return api(originalRequest)

            } catch (err) {

                store.dispatch(logout())

                return Promise.reject(err)
            }
        }

        return Promise.reject(error)
    }
)