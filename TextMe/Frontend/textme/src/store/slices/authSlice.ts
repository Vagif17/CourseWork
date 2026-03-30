import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
    token: string | null
    isLoggedIn: boolean
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    isLoggedIn: !!localStorage.getItem("token")
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

        login: (state, action: PayloadAction<string>) => {
            state.token = action.payload
            state.isLoggedIn = true

            localStorage.setItem("token", action.payload)

        },

        logout: (state) => {
            state.token = null
            state.isLoggedIn = false

            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
        }

    }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer