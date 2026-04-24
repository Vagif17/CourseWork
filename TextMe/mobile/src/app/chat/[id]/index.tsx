import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatWindow } from '../../../widgets/chat-window';

export default function ChatPage() {
    const { id, name, avatar, recipientId, initialOnline, lastSeenAt, presenceHidden, isGroup } = useLocalSearchParams();

    return (
        <ChatWindow 
            id={id as string}
            name={name as string}
            avatar={avatar as string}
            recipientId={recipientId as string}
            initialOnline={initialOnline === 'true'}
            lastSeenAt={lastSeenAt as string}
            presenceHidden={presenceHidden === 'true'}
            isGroup={isGroup === 'true'}
        />
    );
}
