import React from 'react';
import { 
    View, Text, StyleSheet, Modal, 
    TouchableOpacity, Pressable, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../config/constants/ThemeContext';

interface MessageActionSheetProps {
    visible: boolean;
    onClose: () => void;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isMine: boolean;
    messageText?: string;
}

export default function MessageActionSheet({ 
    visible, 
    onClose, 
    onReply, 
    onEdit, 
    onDelete, 
    isMine,
    messageText 
}: MessageActionSheetProps) {
    const { currentColors } = useAppTheme();

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={[styles.container, { backgroundColor: currentColors.surface }]}>
                    <View style={[styles.handle, { backgroundColor: currentColors.border }]} />
                    
                    {messageText && (
                        <View style={styles.messagePreview}>
                            <Text style={[styles.previewText, { color: currentColors.textSecondary }]} numberOfLines={2}>
                                {messageText}
                            </Text>
                        </View>
                    )}

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity 
                            style={styles.option} 
                            onPress={() => { onReply(); onClose(); }}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0,182,255,0.1)' }]}>
                                <Ionicons name="arrow-undo-outline" size={22} color={currentColors.tint} />
                            </View>
                            <Text style={[styles.optionText, { color: currentColors.text }]}>Reply</Text>
                        </TouchableOpacity>

                        {isMine && (
                            <>
                                <View style={[styles.separator, { backgroundColor: currentColors.border }]} />
                                <TouchableOpacity 
                                    style={styles.option} 
                                    onPress={() => { onEdit(); onClose(); }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,159,10,0.1)' }]}>
                                        <Ionicons name="create-outline" size={22} color="#ff9f0a" />
                                    </View>
                                    <Text style={[styles.optionText, { color: currentColors.text }]}>Edit Message</Text>
                                </TouchableOpacity>

                                <View style={[styles.separator, { backgroundColor: currentColors.border }]} />
                                <TouchableOpacity 
                                    style={styles.option} 
                                    onPress={() => { onDelete(); onClose(); }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,69,58,0.1)' }]}>
                                        <Ionicons name="trash-outline" size={22} color="#ff453a" />
                                    </View>
                                    <Text style={[styles.optionText, { color: '#ff453a' }]}>Delete Message</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={[styles.cancelButton, { backgroundColor: currentColors.input }]} 
                        onPress={onClose}
                    >
                        <Text style={[styles.cancelText, { color: currentColors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    messagePreview: {
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    previewText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    optionsContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionText: {
        fontSize: 17,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        width: '100%',
        marginLeft: 52,
    },
    cancelButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    cancelText: {
        fontSize: 17,
        fontWeight: '700',
    }
});
