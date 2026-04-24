import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, Modal, TextInput, 
    FlatList, TouchableOpacity, Image, ActivityIndicator,
    KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from "../../api/services/userService";
import { chatService } from '../../api/services/chatService';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../config/constants/ThemeContext';

interface User {
    userId: string;
    userName: string;
    avatarUrl: string | null;
}

interface SearchUserModalProps {
    visible: boolean;
    onClose: () => void;
    onChatCreated: (chatId: number, name: string, avatar: string | null) => void;
}

export default function SearchUserModal({ visible, onClose, onChatCreated }: SearchUserModalProps) {
    const { currentColors, isDark } = useAppTheme();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupAvatar, setGroupAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (query.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                searchUsers();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setUsers([]);
        }
    }, [query]);

    const searchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.searchUsers(query);
            setUsers(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (user: User) => {
        setSelectedUsers(prev => {
            if (prev.find(u => u.userId === user.userId)) {
                return prev.filter(u => u.userId !== user.userId);
            } else {
                return [...prev, user];
            }
        });
    };

    const handleCreateChat = async (user: User) => {
        try {
            const chat = await chatService.createPrivateChat(user.userName);
            onChatCreated(chat.id, user.userName, user.avatarUrl);
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to create chat");
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert("Error", "Please enter group name");
            return;
        }
        setLoading(true);
        try {
            const participantIds = selectedUsers.map(u => u.userId);
            const chat = await chatService.createGroup(groupName, participantIds, groupAvatar);
            onChatCreated(chat.id, groupName, groupAvatar);
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setQuery('');
        setUsers([]);
        setSelectedUsers([]);
        setCreatingGroup(false);
        setGroupName('');
        setGroupAvatar(null);
    };

    const pickGroupAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setGroupAvatar(result.assets[0].uri);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const renderUser = ({ item }: { item: User }) => {
        const isSelected = selectedUsers.find(u => u.userId === item.userId);
        return (
            <TouchableOpacity 
                style={[styles.userItem, { borderBottomColor: currentColors.border }]} 
                onPress={() => creatingGroup ? toggleUserSelection(item) : handleCreateChat(item)}
            >
                <Image 
                    source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }} 
                    style={[styles.userAvatar, { backgroundColor: currentColors.input }]} 
                />
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: currentColors.text }]}>{item.userName}</Text>
                </View>
                {creatingGroup && (
                    <View style={[styles.checkbox, { borderColor: currentColors.tint, backgroundColor: isSelected ? currentColors.tint : 'transparent' }]}>
                        {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalContent, { backgroundColor: currentColors.background, shadowColor: isDark ? '#000' : currentColors.tint }]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
                            {creatingGroup ? 'New Group' : 'New Chat'}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={28} color={currentColors.text} />
                        </TouchableOpacity>
                    </View>

                    {creatingGroup ? (
                        <View style={styles.groupForm}>
                            <View style={styles.avatarSection}>
                                <TouchableOpacity onPress={pickGroupAvatar} style={[styles.avatarPicker, { backgroundColor: currentColors.input, borderColor: currentColors.border }]}>
                                    {groupAvatar ? (
                                        <Image source={{ uri: groupAvatar }} style={styles.groupAvatarPreview} />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="camera" size={32} color={currentColors.textSecondary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TextInput 
                                    style={[styles.groupInput, { backgroundColor: currentColors.input, color: currentColors.text, marginBottom: 0 }]}
                                    placeholder="Enter group name..."
                                    placeholderTextColor={currentColors.textSecondary}
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    autoFocus
                                />
                            </View>
                            
                            {selectedUsers.length > 0 && (
                                <View style={styles.chipsContainer}>
                                    <FlatList
                                        horizontal
                                        data={selectedUsers}
                                        keyExtractor={(u) => u.userId}
                                        renderItem={({ item }) => (
                                            <View style={[styles.chip, { backgroundColor: currentColors.tint + '20' }]}>
                                                <Image source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }} style={styles.chipAvatar} />
                                                <Text style={[styles.chipText, { color: currentColors.tint }]} numberOfLines={1}>{item.userName}</Text>
                                                <TouchableOpacity onPress={() => toggleUserSelection(item)}>
                                                    <Ionicons name="close-circle" size={18} color={currentColors.tint} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.chipsList}
                                    />
                                </View>
                            )}

                            <View style={[styles.searchBar, { backgroundColor: currentColors.input, marginBottom: 0 }]}>
                                <Ionicons name="search" size={20} color={currentColors.textSecondary} />
                                <TextInput 
                                    style={[styles.searchInput, { color: currentColors.text }]}
                                    placeholder="Add participants..."
                                    placeholderTextColor={currentColors.textSecondary}
                                    value={query}
                                    onChangeText={setQuery}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.searchBar, { backgroundColor: currentColors.input }]}>
                            <Ionicons name="search" size={20} color={currentColors.textSecondary} />
                            <TextInput 
                                style={[styles.searchInput, { color: currentColors.text }]}
                                placeholder="Search by username or email..."
                                placeholderTextColor={currentColors.textSecondary}
                                value={query}
                                onChangeText={setQuery}
                                autoFocus
                            />
                        </View>
                    )}

                    {!creatingGroup && (
                        <TouchableOpacity 
                            style={styles.createGroupBtn}
                            onPress={() => setCreatingGroup(true)}
                        >
                            <View style={[styles.groupIcon, { backgroundColor: currentColors.tint }]}>
                                <Ionicons name="people" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.createGroupText, { color: currentColors.tint }]}>Create a new group</Text>
                        </TouchableOpacity>
                    )}

                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.userId}
                        renderItem={renderUser}
                        ListEmptyComponent={() => (
                            !loading && query.length > 2 ? (
                                <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>No users found</Text>
                            ) : null
                        )}
                        contentContainerStyle={styles.listContent}
                    />

                    {loading && <ActivityIndicator size="large" color={currentColors.tint} style={styles.loader} />}

                    {creatingGroup && (
                        <TouchableOpacity 
                            style={[styles.confirmBtn, { backgroundColor: currentColors.tint }, selectedUsers.length === 0 && styles.btnDisabled]}
                            onPress={handleCreateGroup}
                            disabled={selectedUsers.length === 0}
                        >
                            <Text style={styles.confirmBtnText}>Create Group</Text>
                        </TouchableOpacity>
                    )}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        padding: 24,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 25,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 52,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    createGroupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 4,
    },
    groupIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    createGroupText: {
        fontSize: 17,
        fontWeight: '700',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
    },
    userAvatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 17,
        fontWeight: '600',
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 40,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 60,
        fontSize: 16,
    },
    loader: {
        marginTop: 20,
    },
    groupForm: {
        marginBottom: 20,
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    avatarPicker: {
        width: 70,
        height: 70,
        borderRadius: 22,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    groupAvatarPreview: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupInput: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        height: 56,
        fontSize: 17,
        fontWeight: '600',
    },
    chipsContainer: {
        marginBottom: 16,
        maxHeight: 50,
    },
    chipsList: {
        paddingRight: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingLeft: 6,
        paddingRight: 10,
        paddingVertical: 6,
        marginRight: 10,
    },
    chipAvatar: {
        width: 24,
        height: 24,
        borderRadius: 8,
        marginRight: 8,
    },
    chipText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 6,
    },
    confirmBtn: {
        borderRadius: 18,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    btnDisabled: {
        opacity: 0.4,
    }
});
