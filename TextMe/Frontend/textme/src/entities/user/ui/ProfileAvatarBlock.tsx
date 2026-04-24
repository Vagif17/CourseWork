import "./ProfileAvatarBlock.css";

type Props = {
    previewUrl: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (file: File | null) => void;
};

export default function ProfileAvatarBlock({ previewUrl, fileInputRef, onFileChange }: Props) {
    return (
        <div className="profile-avatar-row">
            <img className="profile-avatar-preview" src={previewUrl} alt="Avatar" />
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => onFileChange(e.target.files?.[0] ?? null)}
                />
                <button type="button" className="profile-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose photo
                </button>
                <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    PNG or JPG. Save profile to upload to the server.
                </p>
            </div>
        </div>
    );
}
