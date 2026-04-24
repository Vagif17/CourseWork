import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, Image, Alert,
    KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { messageService } from '../../../shared/api/services/messageService';
import { chatService } from '../../../shared/api/services/chatService';
import { getUserId } from '../../../shared/lib/utils/getUserIdUtil';
import tokenService from '../../../shared/api/services/tokenService';
import chatHub from '../../../shared/api/hubs/chatHub';
import { useAppTheme } from '../../../shared/config/constants/ThemeContext';
import { useCall } from '../../../shared/config/constants/CallContext';

import MessageItem from '../../../entities/message/ui/MessageItem';
import ChatInput from '../../../features/chat/ui/ChatInput';
import MessageActionSheet from '../../../shared/ui/components/MessageActionSheet';

import * as S from './ChatWindow.styles';

interface ChatWindowProps {
    id: string;
    name?: string;
    avatar?: string;
    recipientId?: string;
    initialOnline?: boolean;
    lastSeenAt?: string;
    presenceHidden?: boolean;
    isGroup?: boolean;
}

export const ChatWindow = ({
    id, name, avatar, recipientId: paramRecipientId,
    initialOnline, lastSeenAt: paramLastSeenAt,
    presenceHidden: paramPresenceHidden, isGroup = false
}: ChatWindowProps) => {
    const { currentColors, isDark } = useAppTheme();
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [selectedImages, setSelectedImages] = useState<{ uri: string; type: string; name: string }[]>([]);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recipientId, setRecipientId] = useState<string | null>(paramRecipientId || null);
    const [onlineStatus, setOnlineStatus] = useState<{ isOnline: boolean, lastSeenAt?: string, presenceHidden?: boolean } | null>(null);

    const [editingMessage, setEditingMessage] = useState<any | null>(null);
    const [replyingTo, setReplyingTo] = useState<any | null>(null);
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [selectedMessageForActions, setSelectedMessageForActions] = useState<any | null>(null);

    const webrtc = useCall();
    const flatListRef = useRef<FlatList>(null);
    const isFocused = useRef(true);

    useEffect(() => {
        const initUserId = async () => {
            const token = await tokenService.getToken();
            setCurrentUserId(getUserId(token));
            chatHub.start();
        };
        initUserId();

        if (paramRecipientId) {
            setOnlineStatus({
                isOnline: initialOnline ?? false,
                lastSeenAt: paramLastSeenAt,
                presenceHidden: paramPresenceHidden
            });
        }

        (async () => {
            await Audio.requestPermissionsAsync();
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        })();
    }, []);

    const loadMessages = useCallback(async () => {
        try {
            const data = await messageService.getMessages(Number(id));
            setMessages(data.reverse());
            await chatHub.invoke("MarkChatAsRead", Number(id));
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadMessages();

        const messageHandler = (message: any) => {
            if (Number(message.chatId) === Number(id)) {
                setMessages(prev => [message, ...prev]);
                if (isFocused.current) {
                    chatHub.ackMessageDelivered(message.id);
                    chatHub.markChatAsRead(Number(id));
                }
            }
        };

        const statusHandler = (payload: { messageId: number, chatId: number, status: string }) => {
            if (Number(payload.chatId) === Number(id)) {
                setMessages(prev => prev.map(m => m.id === payload.messageId ? { ...m, status: payload.status } : m));
            }
        };

        const presenceHandler = (payload: { userId: string, isOnline: boolean, lastSeenAt?: string, presenceHidden?: boolean }) => {
            if (payload.userId === recipientId) {
                setOnlineStatus({
                    isOnline: payload.isOnline,
                    lastSeenAt: payload.lastSeenAt,
                    presenceHidden: payload.presenceHidden
                });
            }
        };

        const editHandler = (updatedMessage: any) => {
            if (Number(updatedMessage.chatId) === Number(id)) {
                setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
            }
        };

        const deleteHandler = (payload: { messageId: number, chatId: number }) => {
            if (Number(payload.chatId) === Number(id)) {
                setMessages(prev => prev.map(m => m.id === payload.messageId ? { ...m, isDeleted: true, text: "This message was deleted" } : m));
            }
        };

        chatHub.joinChat(Number(id));
        chatHub.onReceiveMessage(messageHandler);
        chatHub.onMessageStatusUpdated(statusHandler);
        chatHub.onUserPresenceUpdated(presenceHandler);
        chatHub.onMessageEdited(editHandler);
        chatHub.onMessageDeleted(deleteHandler);

        isFocused.current = true;

        return () => {
            isFocused.current = false;
            chatHub.leaveChat(Number(id));
            chatHub.offReceiveMessage(messageHandler);
            chatHub.offMessageStatusUpdated(statusHandler);
            chatHub.offUserPresenceUpdated(presenceHandler);
            chatHub.offMessageEdited(editHandler);
            chatHub.offMessageDeleted(deleteHandler);
        };
    }, [loadMessages, id, recipientId]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: asset.mimeType || 'image/jpeg',
                    name: asset.fileName || `image_${Date.now()}.jpg`
                }));
                setSelectedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error("Failed to pick image:", error);
            Alert.alert("Error", "Failed to open image library");
        }
    };

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (error) {
            console.error("Failed to start recording:", error);
            Alert.alert("Error", "Could not start audio recording");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (uri) {
                const fileInfo = {
                    uri,
                    type: 'audio/m4a',
                    name: `voice_${Date.now()}.m4a`
                };
                const urls = await messageService.uploadMedia([fileInfo]);
                await chatHub.invoke("SendMessage", Number(id), "", urls[0], "audio/m4a", null, null);
            }
        } catch (error) {
            console.error("Failed to stop recording:", error);
            Alert.alert("Error", "Failed to save voice message");
        }
    };

    const handleSend = async () => {
        if (!text.trim() && selectedImages.length === 0) return;
        setSending(true);
        try {
            if (editingMessage) {
                await chatHub.editMessage(editingMessage.id, text);
                setEditingMessage(null);
                setText("");
                return;
            }

            if (selectedImages.length > 0) {
                const urls = await messageService.uploadMedia(selectedImages);
                for (const url of urls) {
                    await chatHub.invoke("SendMessage", Number(id), "", url, "image/jpeg", null, null);
                }
                setSelectedImages([]);
            }

            if (text.trim()) {
                await chatHub.invoke("SendMessage", Number(id), text, null, null, null, replyingTo?.id || null);
                setText("");
                setReplyingTo(null);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const renderStatusIcon = (status: string | undefined) => {
        const s = status?.toLowerCase();
        if (s === 'read') return <Ionicons name="checkmark-done" size={14} color="#34d399" />;
        if (s === 'delivered') return <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.5)" />;
        return <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.5)" />;
    };

    const formatDateLabel = (dateSource: string | Date) => {
        const d = new Date(dateSource);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return "Today";
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    };

    const handleLeaveGroup = async () => {
        Alert.alert("Leave Group", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Leave", style: "destructive", onPress: async () => {
                    await chatService.leaveGroup(Number(id));
                    router.back();
                }
            }
        ]);
    };

    return (
        <S.Container backgroundColor={currentColors.background}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: currentColors.background },
                    headerTintColor: currentColors.text,
                    headerTitle: () => (
                        <S.HeaderTitle>
                            <S.HeaderAvatarContainer>
                                <S.HeaderAvatar source={{ uri: avatar || 'https://via.placeholder.com/40' }} />
                                {onlineStatus?.isOnline && <S.HeaderOnlineDot />}
                            </S.HeaderAvatarContainer>
                            <S.HeaderTextContainer>
                                <S.HeaderText color={currentColors.text} numberOfLines={1}>{name || "Chat"}</S.HeaderText>
                                <S.HeaderSubtitle color={onlineStatus?.isOnline ? '#4ade80' : 'rgba(255,255,255,0.4)'}>
                                    {onlineStatus?.presenceHidden ? '' : (onlineStatus?.isOnline ? 'Online' : (onlineStatus?.lastSeenAt ? `Last seen ${new Date(onlineStatus.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''))}
                                </S.HeaderSubtitle>
                            </S.HeaderTextContainer>
                        </S.HeaderTitle>
                    ),
                    headerRight: () => (
                        <S.ActionButtons>
                            {!isGroup && (
                                <>
                                    <S.HeaderCallBtn
                                        onPress={() => webrtc.startCall(recipientId!, name || "", false, avatar || "")}
                                        backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                                    >
                                        <Ionicons name="call-outline" size={20} color={currentColors.text} />
                                    </S.HeaderCallBtn>
                                    <S.HeaderCallBtn
                                        onPress={() => webrtc.startCall(recipientId!, name || "", true, avatar || "")}
                                        backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                                        style={{ marginLeft: 8 }}
                                    >
                                        <Ionicons name="videocam-outline" size={20} color={currentColors.text} />
                                    </S.HeaderCallBtn>
                                </>
                            )}
                            {isGroup && (
                                <S.HeaderGroupBtn onPress={handleLeaveGroup}>
                                    <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                                </S.HeaderGroupBtn>
                            )}
                        </S.ActionButtons>
                    )
                }}
            />

            <S.Content
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={headerHeight}
            >
                {loading ? (
                    <S.Center>
                        <ActivityIndicator size="large" color={isDark ? "#fff" : currentColors.tint} />
                    </S.Center>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={(() => {
                            const result: any[] = [];
                            for (let i = 0; i < messages.length; i++) {
                                result.push(messages[i]);
                                const currentMsgDate = new Date(messages[i].createdAt).toDateString();
                                const nextMsgDate = messages[i + 1] ? new Date(messages[i + 1].createdAt).toDateString() : null;
                                if (currentMsgDate !== nextMsgDate) {
                                    result.push({
                                        id: `date-${currentMsgDate}`,
                                        type: 'date-header',
                                        label: formatDateLabel(messages[i].createdAt)
                                    });
                                }
                            }
                            return result;
                        })()}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <MessageItem
                                item={item}
                                currentUserId={currentUserId}
                                currentColors={currentColors}
                                isGroup={isGroup}
                                onLongPress={(msg) => {
                                    setSelectedMessageForActions(msg);
                                    setActionSheetVisible(true);
                                }}
                                renderStatusIcon={renderStatusIcon}
                                formatDateLabel={formatDateLabel}
                            />
                        )}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                        inverted
                    />
                )}

                <ChatInput
                    isGroup={isGroup}
                    text={text}
                    setText={setText}
                    editingMessage={editingMessage}
                    replyingTo={replyingTo}
                    selectedImages={selectedImages}
                    isDark={isDark}
                    currentColors={currentColors}
                    sending={sending}
                    isRecording={isRecording}
                    onSend={handleSend}
                    onPickImage={pickImage}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    onRemoveImage={(index) => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                    onCancelAction={() => {
                        setReplyingTo(null);
                        setEditingMessage(null);
                        if (editingMessage) setText("");
                    }}
                />
            </S.Content>

            <MessageActionSheet
                visible={actionSheetVisible}
                onClose={() => setActionSheetVisible(false)}
                onReply={() => setReplyingTo(selectedMessageForActions)}
                onEdit={() => {
                    setEditingMessage(selectedMessageForActions);
                    setText(selectedMessageForActions?.text || "");
                }}
                onDelete={() => chatHub.deleteMessage(selectedMessageForActions?.id)}
                isMine={selectedMessageForActions?.senderId === currentUserId}
                messageText={selectedMessageForActions?.text}
            />
        </S.Container>
    );
};
