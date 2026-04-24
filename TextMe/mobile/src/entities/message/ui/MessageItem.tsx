import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from '../../../shared/ui/components/AudioPlayer';
import NewsChatCard from './NewsChatCard';
import { tryParseNewsChatMessage } from '../../../shared/lib/utils/newsChatPayload';
import * as S from './MessageItem.styles';

interface MessageItemProps {
    item: any;
    currentUserId: string | null;
    currentColors: any;
    isGroup: boolean;
    onLongPress: (item: any) => void;
    renderStatusIcon: (status: string | undefined) => React.ReactNode;
    formatDateLabel: (date: string | Date) => string;
}

export default function MessageItem({
    item, currentUserId, currentColors, isGroup,
    onLongPress, renderStatusIcon, formatDateLabel
}: MessageItemProps) {
    if (item.type === 'date-header') {
        return (
            <S.DateHeader>
                <S.DateHeaderText>{item.label}</S.DateHeaderText>
            </S.DateHeader>
        );
    }

    const isMine = item.senderId === currentUserId;
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newsArticle = tryParseNewsChatMessage(item.text);

    if (item.isSystem || item.IsSystem) {
        return (
            <S.SystemMessageContainer>
                <S.SystemMessageText color={currentColors.textSecondary}>
                    {item.text}
                </S.SystemMessageText>
            </S.SystemMessageContainer>
        );
    }

    return (
        <S.MessageRow isMine={isMine}>
            {!isMine && isGroup && (
                <S.MessageAvatar
                    source={{ uri: item.senderAvatarUrl || item.SenderAvatarUrl || 'https://via.placeholder.com/30' }}
                />
            )}
            <S.Bubble
                isMine={isMine}
                activeOpacity={0.8}
                onLongPress={() => onLongPress(item)}
                backgroundColor={isMine ? currentColors.tint : currentColors.surface}
                borderColor={currentColors.border}
            >
                {item.replyToMessage && !item.isDeleted && (
                    <S.ReplyBlock>
                        <S.ReplyAuthor color={isMine ? '#fff' : currentColors.tint} numberOfLines={1}>
                            {item.replyToMessage.senderUserName || 'Participant'}
                        </S.ReplyAuthor>
                        <S.ReplyText color={isMine ? 'rgba(255,255,255,0.7)' : currentColors.textSecondary} numberOfLines={1}>
                            {item.replyToMessage.text || (item.replyToMessage.mediaUrl ? 'Media' : 'Message')}
                        </S.ReplyText>
                    </S.ReplyBlock>
                )}

                {item.mediaUrl && (item.mediaType?.startsWith('image') || !item.mediaType) && (
                    <S.MessageImage source={{ uri: item.mediaUrl }} resizeMode="cover" />
                )}

                {item.mediaUrl && item.mediaType?.startsWith('audio') && (
                    <AudioPlayer uri={item.mediaUrl} isMine={isMine} />
                )}

                {isGroup && !isMine && (
                    <S.SenderName color={currentColors.tint}>{item.senderUserName || 'Unknown'}</S.SenderName>
                )}

                {item.isDeleted ? (
                    <S.MessageText isMine={isMine} color={isMine ? 'rgba(255,255,255,0.6)' : currentColors.textSecondary}>
                        This message was deleted
                    </S.MessageText>
                ) : newsArticle ? (
                    <NewsChatCard article={newsArticle} isMine={isMine} currentColors={currentColors} />
                ) : item.text ? (
                    <S.MessageText
                        isMine={isMine}
                        color={isMine ? '#fff' : currentColors.text}
                    >
                        {item.text}
                        {item.isEdited && <S.EditedText> (edited)</S.EditedText>}
                    </S.MessageText>
                ) : null}

                <S.MessageBottom>
                    <S.MessageTime color={isMine ? 'rgba(255, 255, 255, 0.7)' : currentColors.textSecondary}>
                        {time}
                    </S.MessageTime>
                    {isMine && (
                        <S.StatusContainer>
                            {renderStatusIcon(item.status || item.Status)}
                        </S.StatusContainer>
                    )}
                </S.MessageBottom>
            </S.Bubble>
        </S.MessageRow>
    );
}
