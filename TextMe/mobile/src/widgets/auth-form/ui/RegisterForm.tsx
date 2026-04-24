import React, { useState } from "react";
import { Platform, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { authService } from "../../../shared/api/services/authService";
import { useAppTheme } from "../../../shared/config/constants/ThemeContext";

import * as S from "./Auth.styles";

export const RegisterForm = () => {
    const router = useRouter();
    const { currentColors, isDark } = useAppTheme();
    
    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !userName) {
            setError("Username, Email and Password are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("UserName", userName);
            formData.append("FirstName", firstName);
            formData.append("LastName", lastName);
            formData.append("Email", email);
            formData.append("PhoneNumber", phoneNumber);
            formData.append("Password", password);
            formData.append("ConfirmPassword", confirmPassword);

            if (avatarUri) {
                const filename = avatarUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                
                // @ts-ignore
                formData.append("avatar", {
                    uri: avatarUri,
                    name: filename || 'avatar.jpg',
                    type: type
                });
            }

            await authService.register(formData);
            router.replace("/(tabs)");
        } catch (e: any) {
            const backendErrors = e.response?.data?.errors;
            if (backendErrors) {
                const firstErrorKey = Object.keys(backendErrors)[0];
                const firstErrorMessage = backendErrors[firstErrorKey][0];
                setError(firstErrorMessage);
            } else {
                setError(e.response?.data?.message || e.response?.data || "Registration failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <S.Container 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            backgroundColor={currentColors.background}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <S.ScrollInner showsVerticalScrollIndicator={false}>
                <S.ScrollContent>
                    <S.LogoContainer>
                        <S.AvatarPicker 
                            onPress={pickImage}
                            backgroundColor={currentColors.input}
                            borderColor={currentColors.border}
                        >
                            {avatarUri ? (
                                <S.AvatarImage source={{ uri: avatarUri }} />
                            ) : (
                                <S.AvatarPlaceholder>
                                    <Ionicons name="camera-outline" size={40} color={currentColors.textSecondary} />
                                </S.AvatarPlaceholder>
                            )}
                            <S.EditIconBadge backgroundColor={currentColors.tint} borderColor={currentColors.background}>
                                <Ionicons name="pencil" size={14} color="#fff" />
                            </S.EditIconBadge>
                        </S.AvatarPicker>
                        <S.Title color={currentColors.text}>Join TextMe</S.Title>
                        <S.Subtitle color={currentColors.textSecondary}>Start your decentralized journey</S.Subtitle>
                    </S.LogoContainer>

                    <S.Form>
                        {error ? <S.ErrorText>{error}</S.ErrorText> : null}
                        
                        <S.InputContainer>
                            <S.Label color={currentColors.text}>Username</S.Label>
                            <S.Input 
                                backgroundColor={currentColors.input}
                                color={currentColors.text}
                                borderColor={currentColors.border}
                                placeholder="Pick a unique handle"
                                placeholderTextColor={currentColors.textSecondary}
                                value={userName}
                                onChangeText={setUserName}
                                autoCapitalize="none"
                                keyboardAppearance={isDark ? "dark" : "light"}
                            />
                        </S.InputContainer>

                        <S.Row>
                            <S.InputContainer style={{ flex: 1, marginRight: 8 }}>
                                <S.Label color={currentColors.text}>First Name</S.Label>
                                <S.Input 
                                    backgroundColor={currentColors.input}
                                    color={currentColors.text}
                                    borderColor={currentColors.border}
                                    placeholder="John"
                                    placeholderTextColor={currentColors.textSecondary}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    keyboardAppearance={isDark ? "dark" : "light"}
                                />
                            </S.InputContainer>
                            <S.InputContainer style={{ flex: 1, marginLeft: 8 }}>
                                <S.Label color={currentColors.text}>Last Name</S.Label>
                                <S.Input 
                                    backgroundColor={currentColors.input}
                                    color={currentColors.text}
                                    borderColor={currentColors.border}
                                    placeholder="Doe"
                                    placeholderTextColor={currentColors.textSecondary}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    keyboardAppearance={isDark ? "dark" : "light"}
                                />
                            </S.InputContainer>
                        </S.Row>

                        <S.InputContainer>
                            <S.Label color={currentColors.text}>Email Address</S.Label>
                            <S.Input 
                                backgroundColor={currentColors.input}
                                color={currentColors.text}
                                borderColor={currentColors.border}
                                placeholder="name@example.com"
                                placeholderTextColor={currentColors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                keyboardAppearance={isDark ? "dark" : "light"}
                            />
                        </S.InputContainer>

                        <S.InputContainer>
                            <S.Label color={currentColors.text}>Phone Number</S.Label>
                            <S.Input 
                                backgroundColor={currentColors.input}
                                color={currentColors.text}
                                borderColor={currentColors.border}
                                placeholder="+1234567890"
                                placeholderTextColor={currentColors.textSecondary}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                keyboardAppearance={isDark ? "dark" : "light"}
                            />
                        </S.InputContainer>

                        <S.InputContainer>
                            <S.Label color={currentColors.text}>Password</S.Label>
                            <S.Input 
                                backgroundColor={currentColors.input}
                                color={currentColors.text}
                                borderColor={currentColors.border}
                                placeholder="Min 6 characters"
                                placeholderTextColor={currentColors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                keyboardAppearance={isDark ? "dark" : "light"}
                            />
                        </S.InputContainer>
                        <S.InputContainer>
                            <S.Label color={currentColors.text}>Confirm Password</S.Label>
                            <S.Input 
                                backgroundColor={currentColors.input}
                                color={currentColors.text}
                                borderColor={currentColors.border}
                                placeholder="Repeat your password"
                                placeholderTextColor={currentColors.textSecondary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                keyboardAppearance={isDark ? "dark" : "light"}
                            />
                        </S.InputContainer>

                        <S.Button 
                            onPress={handleRegister}
                            disabled={loading}
                            backgroundColor={currentColors.tint}
                            shadowColor={currentColors.tint}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <S.ButtonText>Create Account</S.ButtonText>
                            )}
                        </S.Button>

                        <S.Footer>
                            <S.FooterText color={currentColors.textSecondary}>Already have an account? </S.FooterText>
                            <TouchableOpacity onPress={() => router.back()}>
                                <S.LinkText color={currentColors.tint}>Back</S.LinkText>
                            </TouchableOpacity>
                        </S.Footer>
                    </S.Form>
                </S.ScrollContent>
            </S.ScrollInner>
        </S.Container>
    );
};
