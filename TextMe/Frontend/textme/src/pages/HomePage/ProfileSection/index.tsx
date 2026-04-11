import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { profileService } from "../../../services/profileService";
import { tokenService } from "../../../services/tokenService";
import { getUserId } from "../../../utils/getUserIdUtil";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import type { UserProfileResponse } from "../../../types/profile";
import ProfileAvatarBlock from "./ProfileAvatarBlock";
import ProfileFieldsForm from "./ProfileFieldsForm";
import PasswordChangeForm from "./PasswordChangeForm";
import ProfileExtras from "./ProfileExtras";
import "./ProfileSection.css";

export default function ProfileSection() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pwdBusy, setPwdBusy] = useState(false);
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);

    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const fileRef = useRef<HTMLInputElement>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const userId = getUserId();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const p = await profileService.getMe();
                if (cancelled) return;
                setProfile(p);
                setUserName(p.userName);
                setFirstName(p.firstName);
                setLastName(p.lastName);
                setEmail(p.email);
                setAvatarPreview(p.avatarUrl || "");
            } catch (e) {
                toast.error(getErrorMessage(e, "Could not load profile"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!pendingAvatar) return;
        const url = URL.createObjectURL(pendingAvatar);
        setAvatarPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [pendingAvatar]);

    const onFieldChange = (field: "userName" | "firstName" | "lastName", value: string) => {
        if (field === "userName") setUserName(value);
        if (field === "firstName") setFirstName(value);
        if (field === "lastName") setLastName(value);
    };

    const saveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const result = await profileService.updateMe({
                userName,
                firstName,
                lastName,
                avatar: pendingAvatar,
            });
            setProfile(result.profile);
            setPendingAvatar(null);
            if (result.profile.avatarUrl) setAvatarPreview(result.profile.avatarUrl);
            if (result.newTokens) {
                tokenService.setTokens(result.newTokens.accessToken, result.newTokens.refreshToken);
                toast.success("Profile saved. Session refreshed (nickname changed).");
            } else {
                toast.success("Profile saved");
            }
        } catch (e) {
            toast.error(getErrorMessage(e, "Could not save profile"));
        } finally {
            setSaving(false);
        }
    };

    const submitPassword = async () => {
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setPwdBusy(true);
        try {
            await profileService.changePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated");
        } catch (e) {
            toast.error(getErrorMessage(e, "Could not change password"));
        } finally {
            setPwdBusy(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="profile-section">
                <div className="profile-section-inner">Loading profile…</div>
            </div>
        );
    }

    return (
        <div className="profile-section">
            <div className="profile-section-inner">
                <h1>Account</h1>
                <p className="profile-subtitle">Profile details and security</p>

                <section className="profile-card">
                    <h2>Photo & name</h2>
                    <ProfileAvatarBlock
                        previewUrl={avatarPreview || profile.avatarUrl || "/images/TextMeLogo.png"}
                        fileInputRef={fileRef}
                        onFileChange={setPendingAvatar}
                    />
                    <div style={{ marginTop: 18 }}>
                        <ProfileFieldsForm
                            userName={userName}
                            firstName={firstName}
                            lastName={lastName}
                            email={email}
                            onChange={onFieldChange}
                        />
                    </div>
                    <div className="profile-actions">
                        <button type="button" className="profile-btn-primary" disabled={saving} onClick={saveProfile}>
                            {saving ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </section>

                <section className="profile-card">
                    <h2>Password</h2>
                    <PasswordChangeForm
                        currentPassword={currentPassword}
                        newPassword={newPassword}
                        confirmPassword={confirmPassword}
                        busy={pwdBusy}
                        onChange={(field, v) => {
                            if (field === "currentPassword") setCurrentPassword(v);
                            if (field === "newPassword") setNewPassword(v);
                            if (field === "confirmPassword") setConfirmPassword(v);
                        }}
                        onSubmit={submitPassword}
                    />
                </section>

                {userId && (
                    <section className="profile-card">
                        <h2>Details</h2>
                        <ProfileExtras userId={userId} memberSince={profile.createdAt} />
                    </section>
                )}
            </div>
        </div>
    );
}
