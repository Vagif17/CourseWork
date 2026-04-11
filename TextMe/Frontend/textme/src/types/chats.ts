export type ParticipantDTO = {
    userId: string;
    userName?: string;
    avatarUrl?: string;
    presenceHidden?: boolean;
    isOnline?: boolean | null;
    lastSeenAt?: string | null;
};

export type PrivateChatDTOResponse = {
    id: number;
    createdAt: string;
    participants: ParticipantDTO[];
    lastMessage?: string | null;
    lastMessageAt?: string | null;
};