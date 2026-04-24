import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import MediaPreview from '../../../shared/ui/components/MediaPreview';
import * as S from './ChatInput.styles';

interface ChatInputProps {
    text: string;
    setText: (text: string) => void;
    editingMessage: any;
    replyingTo: any;
    selectedImages: any[];
    isDark: boolean;
    currentColors: any;
    sending: boolean;
    isRecording: boolean;
    onSend: () => void;
    onPickImage: () => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onRemoveImage: (index: number) => void;
    onCancelAction: () => void;
    isGroup?: boolean;
}

export default function ChatInput({
    text, setText, editingMessage, replyingTo, selectedImages,
    isDark, currentColors, sending, isRecording,
    onSend, onPickImage, onStartRecording, onStopRecording, onRemoveImage, onCancelAction,
    isGroup
}: ChatInputProps) {
    return (
        <S.Footer colors={currentColors}>
            {(replyingTo || editingMessage) && (
                <S.ActionPreview colors={currentColors}>
                    <S.ActionIndicator colors={currentColors} />
                    <S.ActionContent>
                        <S.ActionTitle colors={currentColors}>
                            {replyingTo ? `Replying to ${replyingTo.senderUserName || 'User'}` : 'Editing Message'}
                        </S.ActionTitle>
                        <S.ActionText colors={currentColors} numberOfLines={1}>
                            {replyingTo ? (replyingTo.text || 'Media') : editingMessage.text}
                        </S.ActionText>
                    </S.ActionContent>
                    <S.TouchableOpacity onPress={onCancelAction}>
                        <Ionicons name="close-circle" size={20} color={currentColors.textSecondary} />
                    </S.TouchableOpacity>
                </S.ActionPreview>
            )}

            <MediaPreview
                images={selectedImages}
                onRemove={onRemoveImage}
            />

            <S.InputContainer colors={currentColors}>
                <S.AttachBtn onPress={onPickImage}>
                    <Ionicons name="add" size={24} color={currentColors.textSecondary} />
                </S.AttachBtn>

                <S.Input
                    colors={currentColors}
                    placeholder={editingMessage ? "Edit message..." : (isGroup ? "Message group..." : "Type a message...")}
                    placeholderTextColor="#666"
                    value={text}
                    onChangeText={setText}
                    multiline
                    keyboardAppearance={isDark ? "dark" : "light"}
                />

                {!text.trim() && selectedImages.length === 0 && !editingMessage ? (
                    <S.RecordBtn
                        colors={currentColors}
                        isRecording={isRecording}
                        onPressIn={onStartRecording}
                        onPressOut={onStopRecording}
                    >
                        <Ionicons
                            name={isRecording ? "mic" : "mic-outline"}
                            size={24}
                            color={isRecording ? "#fff" : currentColors.textSecondary}
                        />
                    </S.RecordBtn>
                ) : (
                    <S.SendBtn colors={currentColors} onPress={onSend} disabled={sending}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </S.SendBtn>
                )}
            </S.InputContainer>
        </S.Footer>
    );

}       
