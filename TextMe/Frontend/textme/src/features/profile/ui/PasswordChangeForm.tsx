import "./PasswordChangeForm.css";

type Props = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    onChange: (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => void;
    onSubmit: () => void;
    busy: boolean;
};

export default function PasswordChangeForm({
    currentPassword,
    newPassword,
    confirmPassword,
    onChange,
    onSubmit,
    busy,
}: Props) {
    return (
        <div className="profile-field-full">
            <label>
                Current password
                <input
                    type="password"
                    value={currentPassword}
                    onChange={e => onChange("currentPassword", e.target.value)}
                    autoComplete="current-password"
                />
            </label>
            <label style={{ marginTop: 10 }}>
                New password
                <input
                    type="password"
                    value={newPassword}
                    onChange={e => onChange("newPassword", e.target.value)}
                    autoComplete="new-password"
                />
            </label>
            <label style={{ marginTop: 10 }}>
                Confirm new password
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => onChange("confirmPassword", e.target.value)}
                    autoComplete="new-password"
                />
            </label>
            <div className="profile-actions">
                <button type="button" className="profile-btn-primary" disabled={busy} onClick={onSubmit}>
                    Change password
                </button>
            </div>
        </div>
    );
}
