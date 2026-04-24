import "./ProfileFieldsForm.css";

type Props = {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    onChange: (field: "userName" | "firstName" | "lastName", value: string) => void;
};

export default function ProfileFieldsForm({ userName, firstName, lastName, email, onChange }: Props) {
    return (
        <div className="profile-field-grid">
            <label>
                Nickname
                <input
                    value={userName}
                    onChange={e => onChange("userName", e.target.value)}
                    autoComplete="username"
                />
            </label>
            <label>
                Email (read-only)
                <input value={email} readOnly tabIndex={-1} style={{ opacity: 0.7 }} />
            </label>
            <label>
                First name
                <input value={firstName} onChange={e => onChange("firstName", e.target.value)} autoComplete="given-name" />
            </label>
            <label>
                Last name
                <input value={lastName} onChange={e => onChange("lastName", e.target.value)} autoComplete="family-name" />
            </label>
        </div>
    );
}
