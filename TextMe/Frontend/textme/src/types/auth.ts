export interface AuthResponse {
    accessToken: string;
    expiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
    userName: string;
    email: string;
    avatarUrl: string;
    roles: string[];
}