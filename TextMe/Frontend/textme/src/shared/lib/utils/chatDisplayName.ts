import type { PrivateChatDTOResponse, ParticipantDTO } from "../../api/types/chats";

export function getPrivateChatPartnerName(chat: PrivateChatDTOResponse, currentUserId: string | null): string {
    const other = chat.participants.find((p: ParticipantDTO) => p.userId !== currentUserId);
    return other?.userName || "Contact";
}
