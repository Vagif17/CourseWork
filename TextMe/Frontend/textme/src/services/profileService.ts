import { api } from "./API";
import type {
    UserProfileResponse,
    UpdateProfileRequest,
    ProfileUpdateResult,
    ChangePasswordRequest,
    UpdatePrivacyRequest,
} from "../types/profile";

export const profileService = {
    getMe: async (): Promise<UserProfileResponse> => {
        const { data } = await api.get<UserProfileResponse>("/Profile/me");
        return data;
    },

    updateMe: async (body: UpdateProfileRequest): Promise<ProfileUpdateResult> => {
        const form = new FormData();
        if (body.userName != null) form.append("userName", body.userName);
        if (body.firstName != null) form.append("firstName", body.firstName);
        if (body.lastName != null) form.append("lastName", body.lastName);
        if (body.avatar) form.append("avatar", body.avatar);

        const { data } = await api.put<ProfileUpdateResult>("/Profile/me", form);
        return data;
    },

    changePassword: async (body: ChangePasswordRequest): Promise<void> => {
        await api.post("/Profile/change-password", body);
    },

    updatePrivacy: async (body: UpdatePrivacyRequest): Promise<UserProfileResponse> => {
        const { data } = await api.put<UserProfileResponse>("/Profile/me/privacy", body);
        return data;
    },
};
