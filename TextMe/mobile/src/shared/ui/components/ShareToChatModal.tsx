import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal,
    FlatList, TouchableOpacity, Image, ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../config/constants/ThemeContext';
import { chatService } from '../../api/services/chatService';
import chatHub from '../../api/hubs/chatHub';
import { getUserId } from '../../lib/utils/getUserIdUtil';
import tokenService from '../../api/services/tokenService';
import { serializeNewsChatMessage } from '../../lib/utils/newsChatPayload';

interface ShareToChatModalProps {
    visible: boolean;
    onClose: () => void;
    newsItem: { title: string; url: string } | null;
}

export default function ShareToChatModal({ visible, onClose, newsItem }: ShareToChatModalProps) {
    const { currentColors } = useAppTheme();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            loadChats();
            initUserId();
        }
    }, [visible]);

    const initUserId = async () => {
        const token = await tokenService.getToken();
        setCurrentUserId(getUserId(token));
    };

    const loadChats = async () => {
        setLoading(true);
        try {
            const data = await chatService.getChats();
            setChats(data);
        } catch (error) {
            console.error("Failed to load chats for sharing:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (chatId: number) => {
        if (!newsItem) return;
        try {
            const messageText = serializeNewsChatMessage(newsItem);
            await chatHub.invoke("SendMessage", chatId, messageText, null, null, null, null);
            Alert.alert("Success", "Shared to chat!");
            onClose();
        } catch (error) {
            console.error("Failed to share news:", error);
            Alert.alert("Error", "Failed to share news");
        }
    };

    const renderChatItem = ({ item }: { item: any }) => {
        const otherParticipant = item.participants?.find((p: any) => p.userId !== currentUserId);
        const displayName = item.isGroup ? item.name : (otherParticipant?.userName || "Chat");
        const displayAvatar = item.isGroup ? item.groupAvatarUrl : otherParticipant?.avatarUrl;

        return (
            <TouchableOpacity
                style={[styles.chatItem, { borderBottomColor: currentColors.border }]}
                onPress={() => handleShare(item.id)}
            >
                <Image
                    source={{ uri: displayAvatar || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <Text style={[styles.chatName, { color: currentColors.text }]} numberOfLines={1}>
                    {displayName}
                </Text>
                <Ionicons name="send-outline" size={20} color={currentColors.tint} />
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: currentColors.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Share to...</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={currentColors.text} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={currentColors.tint} style={styles.loader} />
                    ) : (
                        <FlatList
                            data={chats}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderChatItem}
                            ListEmptyComponent={() => (
                                <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
                                    No active chats found.
                                </Text>
                            )}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '60%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ccc',
    },
    chatName: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
    },
    loader: {
        marginTop: 40,
    }
});
