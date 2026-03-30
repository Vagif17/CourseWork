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

export type MessageDTO = {

    id: number

    chatId: number

    senderId: string

    senderUserName: string

    senderAvatarUrl?: string

    text?: string

    mediaUrl?: string

    mediaType?: string

    createdAt: string
}