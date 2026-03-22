import axios from "axios"
import { store } from "../store"
import { logout } from "../store/slices/authSlice"

export const API_URL = axios.create({
    baseURL: "http://localhost:5160/api",
})

API_URL.interceptors.request.use((config) => {

    const token = localStorage.getItem("token")

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

API_URL.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401) {
            console.log("JWT expired → logout")
            store.dispatch(logout())
        }

        return Promise.reject(error)
    }
)