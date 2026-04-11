import type { PrivateChatDTOResponse } from "../types/chats";

/** Имя собеседника в приватном чате для списков и модалок */
export function getPrivateChatPartnerName(chat: PrivateChatDTOResponse, currentUserId: string | null): string {
    const other = chat.participants.find(p => p.userId !== currentUserId);
    return other?.userName || "Contact";
}
