import React, { useState } from "react";
import { Platform, ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { authService } from "../../../shared/api/services/authService";
import { useAppTheme } from "../../../shared/config/constants/ThemeContext";

import * as S from "./Auth.styles";

export const LoginForm = () => {
    const router = useRouter();
    const { currentColors, isDark } = useAppTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await authService.login(email, password);
            router.replace("/(tabs)");
        } catch (e: any) {
            setError(e.response?.data?.message || "Login failed. Check your credentials.");
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
            <S.Inner>
                <S.LogoContainer>
                    <S.LogoImage 
                        source={{ uri: 'https://res.cloudinary.com/diq4utz5c/image/upload/v1773412191/TextMeLogo-removebg-preview_i8y2ka.png' }} 
                    />
                    <S.Title color={currentColors.text}>TextMe</S.Title>
                    <S.Subtitle color={currentColors.textSecondary}>Welcome back to the future of chat</S.Subtitle>
                </S.LogoContainer>

                <S.Form>
                    {error ? <S.ErrorText>{error}</S.ErrorText> : null}
                    
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
                        <S.Label color={currentColors.text}>Password</S.Label>
                        <S.Input 
                            backgroundColor={currentColors.input}
                            color={currentColors.text}
                            borderColor={currentColors.border}
                            placeholder="Enter your password"
                            placeholderTextColor={currentColors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            keyboardAppearance={isDark ? "dark" : "light"}
                        />
                    </S.InputContainer>

                    <S.ForgotBtn onPress={() => router.push("/(auth)/recovery")}>
                        <S.ForgotText color={currentColors.textSecondary}>Forgot Password?</S.ForgotText>
                    </S.ForgotBtn>

                    <S.Button 
                        onPress={handleLogin}
                        disabled={loading}
                        backgroundColor={currentColors.tint}
                        shadowColor={currentColors.tint}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <S.ButtonText>Sign In</S.ButtonText>
                        )}
                    </S.Button>

                    <S.Footer>
                        <S.FooterText color={currentColors.textSecondary}>Don't have an account? </S.FooterText>
                        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                            <S.LinkText color={currentColors.tint}>Create Account</S.LinkText>
                        </TouchableOpacity>
                    </S.Footer>
                </S.Form>
            </S.Inner>
        </S.Container>
    );
};
