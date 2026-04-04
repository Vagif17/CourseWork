export interface RegisterRequest {
    userName: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string
    avatar?: File
}

export interface LoginRequest {
    email: string
    password: string
}

export interface AuthResponse {
    accessToken: string
    expiresAt: string
    refreshToken: string
    refreshTokenExpiresAt: string
    userName: string
    email: string
    avatarUrl: string
    roles: string[]
}