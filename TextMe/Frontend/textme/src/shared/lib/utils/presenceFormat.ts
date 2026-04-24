import type { ParticipantDTO } from "../../api/types/chats";

function formatShortTime(d: Date): string {
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 60_000) return "just now";
    const m = Math.floor(diffMs / 60_000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h}h ago`;
    return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatParticipantPresence(p: ParticipantDTO | undefined): string {
    if (!p) return "";
    if (p.presenceHidden) return "";
    if (p.isOnline === true) return "Online";
    if (p.lastSeenAt) {
        const d = new Date(p.lastSeenAt);
        if (!Number.isNaN(d.getTime())) return `Last seen ${formatShortTime(d)}`;
    }
    return "Offline";
}
