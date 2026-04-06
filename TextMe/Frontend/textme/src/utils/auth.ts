import { jwtDecode } from "jwt-decode"

type JwtPayload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string
}

export const getUserId = (): string | null => {
    const token = localStorage.getItem("token")

    if (!token) return null

    try {
        const decoded = jwtDecode<JwtPayload>(token)

        return decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ]
    } catch {
        return null
    }
}

