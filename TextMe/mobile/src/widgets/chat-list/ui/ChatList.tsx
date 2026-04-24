import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { FlatList, RefreshControl, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { chatService } from '../../../shared/api/services/chatService';
import { tokenService } from '../../../shared/api/services/tokenService';
import { getUserId } from '../../../shared/lib/utils/getUserIdUtil';
import chatHub from '../../../shared/api/hubs/chatHub';
import { useAppTheme } from '../../../shared/config/constants/ThemeContext';
import SearchUserModal from '../../../shared/ui/components/SearchUserModal';

import * as S from './ChatList.styles';

export const ChatList = () => {
    const { currentColors, isDark } = useAppTheme();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userPresence, setUserPresence] = useState<Record<string, { isOnline: boolean, lastSeenAt?: string, presenceHidden?: boolean }>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    
    const processedMessageIds = useRef<Set<number>>(new Set());
    const currentUserIdRef = useRef<string | null>(null);

    const loadChats = useCallback(async () => {
        try {
            const data = await chatService.getChats();
            setChats(data);
            
            const presence: Record<string, { isOnline: boolean, lastSeenAt?: string, presenceHidden?: boolean }> = {};
            data.forEach((chat: any) => {
                chat.participants?.forEach((p: any) => {
                    if (p.userId !== currentUserId) {
                        presence[p.userId] = { 
                            isOnline: p.isOnline, 
                            lastSeenAt: p.lastSeenAt,
                            presenceHidden: p.presenceHidden
                        };
                    }
                });
            });
            setUserPresence(presence);
        } catch (error) {
            console.error("Failed to load chats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUserId]);

    useFocusEffect(
        useCallback(() => {
            loadChats();
        }, [loadChats])
    );

    useEffect(() => {
        const init = async () => {
            const token = await tokenService.getToken();
            const id = getUserId(token);
            setCurrentUserId(id);
            currentUserIdRef.current = id;
            chatHub.start();
        };
        init();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadChats();
    }, [loadChats]);

    useEffect(() => {
        const presenceHandler = (payload: { userId: string, isOnline: boolean, lastSeenAt?: string, presenceHidden?: boolean }) => {
            setUserPresence(prev => ({
                ...prev,
                [payload.userId]: { 
                    isOnline: payload.isOnline, 
                    lastSeenAt: payload.lastSeenAt, 
                    presenceHidden: payload.presenceHidden 
                }
            }));
        };

        const messageHandler = (message: any) => {
            if (processedMessageIds.current.has(message.id)) return;
            processedMessageIds.current.add(message.id);

            setChats(prev => {
                const index = prev.findIndex(c => c.id === message.chatId);
                const next = [...prev];
                const isFromMe = message.senderId === currentUserIdRef.current;
                
                if (index !== -1) {
                    const cur = next[index]!;
                    next[index] = {
                        ...cur,
                        lastMessage: message.text || (message.mediaType === 'audio' ? 'Voice message' : 'Media'),
                        lastMessageAt: message.createdAt,
                        unreadCount: (cur.unreadCount || 0) + (!isFromMe ? 1 : 0)
                    };
                } else {
                    onRefresh();
                    return prev;
                }
                
                return next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            });
        };

        const listUpdatedHandler = (payload: { chatId: number, lastMessage?: string, lastMessageAt?: string }) => {
            setChats(prev => {
                const index = prev.findIndex(c => c.id === payload.chatId);
                if (index === -1) return prev;
                const next = [...prev];
                const cur = next[index]!;
                next[index] = {
                    ...cur,
                    lastMessage: payload.lastMessage || cur.lastMessage,
                    lastMessageAt: payload.lastMessageAt || cur.lastMessageAt
                };
                return next.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            });
        };

        const newChatHandler = (chat: any) => {
            setChats(prev => {
                if (prev.find(c => c.id === chat.id)) return prev;
                return [chat, ...prev];
            });
        };

        chatHub.onUserPresenceUpdated(presenceHandler);
        chatHub.onReceiveMessage(messageHandler);
        chatHub.onChatListUpdated(listUpdatedHandler);
        chatHub.onReceiveNewChat(newChatHandler);
        
        return () => {
            chatHub.offUserPresenceUpdated(presenceHandler);
            chatHub.offReceiveMessage(messageHandler);
            chatHub.offChatListUpdated(listUpdatedHandler);
            chatHub.offReceiveNewChat(newChatHandler);
        };
    }, [onRefresh]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const query = searchQuery.toLowerCase();
        return chats.filter(chat => {
            if (chat.isGroup) return chat.name?.toLowerCase().includes(query);
            const other = chat.participants?.find((p: any) => p.userId !== currentUserId);
            return other?.userName?.toLowerCase().includes(query);
        });
    }, [chats, searchQuery, currentUserId]);

    const handleChatCreated = (chatId: number, name: string, avatar: string | null) => {
        setSearchModalVisible(false);
        router.push({
            pathname: `/chat/${chatId}`,
            params: { name, avatar }
        });
        loadChats();
    };

    const handleDeleteChat = (chatId: number, isGroup: boolean) => {
        Alert.alert(
            isGroup ? "Delete Group" : "Delete Chat",
            "Are you sure you want to delete this?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        await chatService.deleteChat(chatId);
                        loadChats();
                    } 
                }
            ]
        );
    };

    const renderChatItem = ({ item }: { item: any }) => {
        const lastMessageAt = new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const otherParticipant = item.participants?.find((p: any) => p.userId !== currentUserId);
        const displayName = item.isGroup ? item.name : (otherParticipant?.userName || "Chat");
        const displayAvatar = item.isGroup ? item.groupAvatarUrl : otherParticipant?.avatarUrl;
        const presence = otherParticipant ? userPresence[otherParticipant.userId] : null;

        return (
            <S.ChatItem 
                onPress={() => router.push({ 
                    pathname: `/chat/${item.id}`, 
                    params: { 
                        name: displayName, 
                        avatar: displayAvatar,
                        recipientId: otherParticipant?.userId,
                        initialOnline: presence?.isOnline ? 'true' : 'false',
                        lastSeenAt: presence?.lastSeenAt,
                        presenceHidden: presence?.presenceHidden ? 'true' : 'false',
                        isGroup: item.isGroup ? 'true' : 'false'
                    } 
                })}
                onLongPress={() => handleDeleteChat(item.id, item.isGroup)}
            >
                <S.AvatarContainer>
                    <S.Avatar 
                        source={{ uri: displayAvatar || 'https://via.placeholder.com/60' }} 
                        backgroundColor={currentColors.input}
                    />
                    {!item.isGroup && presence?.isOnline && (
                        <S.OnlineDot borderColor={currentColors.background} />
                    )}
                </S.AvatarContainer>
                <S.ChatInfo>
                    <S.ChatHeader>
                        <View style={{ flex: 1 }}>
                            <S.ChatName color={currentColors.text} numberOfLines={1}>{displayName}</S.ChatName>
                            {!item.isGroup && (
                                <S.PresenceText color={presence?.isOnline ? '#4ade80' : currentColors.textSecondary}>
                                    {presence?.presenceHidden ? '' : (presence?.isOnline ? 'Online' : (presence?.lastSeenAt ? `Last seen ${new Date(presence.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''))}
                                </S.PresenceText>
                            )}
                        </View>
                        <S.Time color={currentColors.textSecondary}>{lastMessageAt}</S.Time>
                    </S.ChatHeader>
                    <S.ChatBody>
                        <S.LastMessage color={currentColors.textSecondary} numberOfLines={1}>
                            {item.lastMessage || 'No messages yet'}
                        </S.LastMessage>
                        {item.unreadCount > 0 && (
                            <S.Badge backgroundColor={currentColors.tint}>
                                <S.BadgeText>
                                    {item.unreadCount > 9 ? '9+' : item.unreadCount}
                                </S.BadgeText>
                            </S.Badge>
                        )}
                    </S.ChatBody>
                </S.ChatInfo>
            </S.ChatItem>
        );
    };

    if (loading) {
        return (
            <S.Container backgroundColor={currentColors.background}>
                <ActivityIndicator size="large" color={currentColors.tint} style={{ flex: 1 }} />
            </S.Container>
        );
    }

    return (
        <S.Container backgroundColor={currentColors.background}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <S.SearchContainer backgroundColor={currentColors.input} borderColor={currentColors.border}>
                <Ionicons name="search" size={20} color={currentColors.textSecondary} style={{ marginRight: 10 }} />
                <S.SearchInput 
                    color={currentColors.text}
                    placeholder="Search chats..."
                    placeholderTextColor={currentColors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    keyboardAppearance={isDark ? "dark" : "light"}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color={currentColors.textSecondary} />
                    </TouchableOpacity>
                )}
            </S.SearchContainer>
            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderChatItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.tint} />
                }
                ListEmptyComponent={
                    <S.EmptyContainer>
                        <Ionicons name="chatbubble-ellipses-outline" size={64} color={currentColors.textSecondary} />
                        <S.EmptyText color={currentColors.textSecondary}>No chats yet. Search for users to start chatting!</S.EmptyText>
                    </S.EmptyContainer>
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            />
            <S.FAB 
                backgroundColor={currentColors.tint} 
                shadowColor={currentColors.tint}
                onPress={() => setSearchModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </S.FAB>

            <SearchUserModal 
                visible={searchModalVisible} 
                onClose={() => setSearchModalVisible(false)}
                onChatCreated={handleChatCreated}
            />
        </S.Container>
    );
};


