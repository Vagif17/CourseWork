import { toast } from "react-toastify";
import "./ProfileSection.css";

type Props = {
    userId: string;
    memberSince: string;
};

export default function ProfileExtras({ userId, memberSince }: Props) {
    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(userId);
            toast.success("ID copied");
        } catch {
            toast.error("Could not copy");
        }
    };

    const formatted = (() => {
        try {
            return new Date(memberSince).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return memberSince;
        }
    })();

    return (
        <div className="profile-extras">
            <span>Member since: {formatted}</span>
            <button type="button" className="profile-btn-secondary" onClick={copyId}>
                Copy user ID
            </button>
            <code>{userId}</code>
        </div>
    );
}
