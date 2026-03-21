export type ParticipantDTO = {
    userId: string;
    userName?: string;
    avatarUrl?: string;
};

export type PrivateChatDTOResponse = {
    id: number;
    createdAt: string;
    participants: ParticipantDTO[];
};