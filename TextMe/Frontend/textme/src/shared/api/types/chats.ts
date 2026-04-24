export type ParticipantDTO = {
    userId: string;
    userName?: string;
    avatarUrl?: string;
    presenceHidden?: boolean;
    isOnline?: boolean | null;
    lastSeenAt?: string | null;
    isAdmin?: boolean;
    email?: string;
};

export type ChatDTO = {
    id: number;
    createdAt: string;
    participants: ParticipantDTO[];
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    
    isGroup: boolean;
    name?: string;
    groupAvatarUrl?: string;
    unreadCount?: number;
};

// Alias for transition if needed, but better use ChatDTO
export type PrivateChatDTOResponse = ChatDTO;