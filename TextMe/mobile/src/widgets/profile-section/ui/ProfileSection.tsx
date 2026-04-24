import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, Modal, Switch } from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

import { profileService } from "../../../shared/api/services/profileService";
import { authService } from "../../../shared/api/services/authService";
import { useAppTheme } from '../../../shared/config/constants/ThemeContext';

import * as S from "./ProfileSection.styles";

export const ProfileSection = () => {
    const router = useRouter();
    const { theme, setTheme, currentColors, isDark } = useAppTheme();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [passModalVisible, setPassModalVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);

    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getMe();
            setProfile(data);
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleUpdateAvatar = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const uri = selectedImage.uri;
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            setLoading(true);
            await profileService.updateMe({
                userName: profile.userName,
                firstName: profile.firstName,
                lastName: profile.lastName,
                avatar: {
                    uri,
                    name: filename || 'avatar.jpg',
                    type,
                },
            });

            await loadProfile();
        } catch (error) {
            Alert.alert("Error", "Failed to update profile picture.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive", 
                    onPress: async () => {
                        await authService.logout();
                        router.replace("/(auth)/login");
                    }
                }
            ]
        );
    };

    const handleChangePassword = async () => {
        if (!currentPass || !newPass || !confirmPass) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (newPass !== confirmPass) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        try {
            setLoading(true);
            await profileService.changePassword({ currentPassword: currentPass, newPassword: newPass });
            Alert.alert("Success", "Password changed successfully");
            setPassModalVisible(false);
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
        } catch (error) {
            Alert.alert("Error", "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrivacy = async (val: boolean) => {
        try {
            const updated = await profileService.updatePrivacy({ shareOnlineStatus: val });
            setProfile(updated);
        } catch (error) {
            Alert.alert("Error", "Failed to update privacy settings");
        }
    };

    if (loading) {
        return (
            <S.LoadingContainer>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </S.LoadingContainer>
        );
    }

    return (
        <S.Container backgroundColor={currentColors.background} contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar style={isDark ? "light" : "dark"} />
            
            <S.Header backgroundColor={currentColors.surface} borderColor={currentColors.border}>
                <S.AvatarContainer>
                    <S.Avatar 
                        source={{ uri: profile?.avatarUrl || 'https://via.placeholder.com/120' }} 
                        borderColor={currentColors.border} 
                    />
                    <S.EditAvatar backgroundColor={currentColors.tint} borderColor={currentColors.surface} onPress={handleUpdateAvatar}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </S.EditAvatar>
                </S.AvatarContainer>
                <S.Name color={currentColors.text}>{profile?.firstName} {profile?.lastName}</S.Name>
                <S.Username color={currentColors.textSecondary}>@{profile?.userName}</S.Username>
            </S.Header>

            <S.Section>
                <S.SectionTitle color={currentColors.textSecondary}>Account Information</S.SectionTitle>
                <S.Card backgroundColor={currentColors.surface} borderColor={currentColors.border}>
                    <S.InfoRow borderColor={currentColors.border}>
                        <Ionicons name="mail-outline" size={20} color={currentColors.textSecondary} />
                        <S.InfoContent>
                            <S.InfoLabel color={currentColors.textSecondary}>Email</S.InfoLabel>
                            <S.InfoValue color={currentColors.text}>{profile?.email}</S.InfoValue>
                        </S.InfoContent>
                    </S.InfoRow>
                    <S.InfoRow borderColor={currentColors.border} noBorder>
                        <Ionicons name="calendar-outline" size={20} color={currentColors.textSecondary} />
                        <S.InfoContent>
                            <S.InfoLabel color={currentColors.textSecondary}>Member Since</S.InfoLabel>
                            <S.InfoValue color={currentColors.text}>{new Date(profile?.createdAt).toLocaleDateString()}</S.InfoValue>
                        </S.InfoContent>
                    </S.InfoRow>
                </S.Card>
            </S.Section>

            <S.Section>
                <S.SectionTitle color={currentColors.textSecondary}>Settings</S.SectionTitle>
                <S.Card backgroundColor={currentColors.surface} borderColor={currentColors.border}>
                    <S.MenuItem borderColor={currentColors.border} onPress={() => setPrivacyModalVisible(true)}>
                        <S.MenuLeft>
                            <Ionicons name="lock-closed-outline" size={22} color={currentColors.text} />
                            <S.MenuText color={currentColors.text}>Privacy & Security</S.MenuText>
                        </S.MenuLeft>
                        <Ionicons name="chevron-forward" size={20} color={currentColors.textSecondary} />
                    </S.MenuItem>
                    <S.MenuItem borderColor={currentColors.border} onPress={() => setPassModalVisible(true)}>
                        <S.MenuLeft>
                            <Ionicons name="key-outline" size={22} color={currentColors.text} />
                            <S.MenuText color={currentColors.text}>Change Password</S.MenuText>
                        </S.MenuLeft>
                        <Ionicons name="chevron-forward" size={20} color={currentColors.textSecondary} />
                    </S.MenuItem>
                    <S.MenuItem borderColor={currentColors.border} noBorder onPress={() => setThemeModalVisible(true)}>
                        <S.MenuLeft>
                            <Ionicons name="color-palette-outline" size={22} color={currentColors.text} />
                            <S.MenuText color={currentColors.text}>Appearance ({theme})</S.MenuText>
                        </S.MenuLeft>
                        <Ionicons name="chevron-forward" size={20} color={currentColors.textSecondary} />
                    </S.MenuItem>
                </S.Card>
            </S.Section>

            <S.LogoutButton onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#ff4444" />
                <S.LogoutText>Log Out</S.LogoutText>
            </S.LogoutButton>

            <S.Version color={currentColors.textSecondary}>TextMe Mobile v1.0.0</S.Version>

            {/* Modals */}
            <Modal visible={passModalVisible} animationType="slide" transparent>
                <S.ModalOverlay>
                    <S.ModalContent backgroundColor={currentColors.surface}>
                        <S.ModalTitle color={currentColors.text}>Change Password</S.ModalTitle>
                        <S.Input 
                            backgroundColor={currentColors.input}
                            color={currentColors.text}
                            placeholder="Current Password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={currentPass}
                            onChangeText={setCurrentPass}
                        />
                        <S.Input 
                            backgroundColor={currentColors.input}
                            color={currentColors.text}
                            placeholder="New Password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={newPass}
                            onChangeText={setNewPass}
                        />
                        <S.Input 
                            backgroundColor={currentColors.input}
                            color={currentColors.text}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={confirmPass}
                            onChangeText={setConfirmPass}
                        />
                        <S.ModalButtons>
                            <S.CancelBtn onPress={() => setPassModalVisible(false)}>
                                <S.CancelBtnText>Cancel</S.CancelBtnText>
                            </S.CancelBtn>
                            <S.ConfirmBtn backgroundColor={currentColors.tint} onPress={handleChangePassword}>
                                <S.ConfirmBtnText>Update</S.ConfirmBtnText>
                            </S.ConfirmBtn>
                        </S.ModalButtons>
                    </S.ModalContent>
                </S.ModalOverlay>
            </Modal>

            <Modal visible={privacyModalVisible} animationType="fade" transparent>
                <S.ModalOverlay>
                    <S.ModalContent backgroundColor={currentColors.surface}>
                        <S.ModalTitle color={currentColors.text}>Privacy Settings</S.ModalTitle>
                        <S.SettingRow>
                            <S.InfoValue color={currentColors.text}>Show Online Status</S.InfoValue>
                            <Switch 
                                value={profile?.shareOnlineStatus}
                                onValueChange={handleUpdatePrivacy}
                                trackColor={{ false: '#767577', true: currentColors.tint }}
                            />
                        </S.SettingRow>
                        <S.ConfirmBtn backgroundColor={currentColors.tint} onPress={() => setPrivacyModalVisible(false)}>
                            <S.ConfirmBtnText>Close</S.ConfirmBtnText>
                        </S.ConfirmBtn>
                    </S.ModalContent>
                </S.ModalOverlay>
            </Modal>

            <Modal visible={themeModalVisible} animationType="fade" transparent>
                <S.ModalOverlay>
                    <S.ModalContent backgroundColor={currentColors.surface}>
                        <S.ModalTitle color={currentColors.text}>Choose Theme</S.ModalTitle>
                        {(['light', 'dark', 'system'] as const).map((t) => (
                            <S.ThemeOption 
                                key={t} 
                                backgroundColor={theme === t ? currentColors.tint + '20' : undefined}
                                onPress={() => { setTheme(t); setThemeModalVisible(false); }}
                            >
                                <S.MenuText color={theme === t ? currentColors.tint : currentColors.text}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </S.MenuText>
                                {theme === t && <Ionicons name="checkmark" size={20} color={currentColors.tint} />}
                            </S.ThemeOption>
                        ))}
                        <S.CancelBtn onPress={() => setThemeModalVisible(false)}>
                            <S.CancelBtnText>Cancel</S.CancelBtnText>
                        </S.CancelBtn>
                    </S.ModalContent>
                </S.ModalOverlay>
            </Modal>
        </S.Container>
    );
};
