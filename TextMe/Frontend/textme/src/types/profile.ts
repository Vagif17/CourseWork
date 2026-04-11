import type { AuthResponse } from "./auth";

/** Ответ GET /Profile/me */
export interface UserProfileResponse {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    createdAt: string;
    shareOnlineStatus?: boolean;
    lastSeenAt?: string | null;
}

/** PUT /Profile/me/privacy */
export interface UpdatePrivacyRequest {
    shareOnlineStatus: boolean;
}

/** Тело PUT /Profile/me (поля формы + опциональный файл в FormData) */
export interface UpdateProfileRequest {
    userName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: File | null;
}

/** Ответ PUT /Profile/me — профиль + новые JWT при смене никнейма */
export interface ProfileUpdateResult {
    profile: UserProfileResponse;
    newTokens?: AuthResponse | null;
}

/** POST /Profile/change-password */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
