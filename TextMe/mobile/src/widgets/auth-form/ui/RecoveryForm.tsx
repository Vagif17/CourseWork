import React, { useState } from "react";
import { Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { authService } from "../../../shared/api/services/authService";
import { useAppTheme } from "../../../shared/config/constants/ThemeContext";

import * as S from "./Auth.styles";

export const RecoveryForm = () => {
    const router = useRouter();
    const { currentColors, isDark } = useAppTheme();
    
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSendCode = async () => {
        if (!email) return setError("Please enter your email");
        setLoading(true);
        setError("");
        try {
            await authService.sendRecoveryCode(email);
            setStep(2);
            setSuccess("Code sent! Check your email.");
        } catch (e: any) {
            setError(e.response?.data?.message || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code) return setError("Please enter the code");
        setLoading(true);
        setError("");
        try {
            await authService.verifyRecoveryCode(email, code);
            setStep(3);
            setSuccess("");
        } catch (e: any) {
            setError("Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            return setError("Password must be at least 6 characters");
        }
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        setError("");
        try {
            await authService.resetPassword({ email, code, newPassword });
            setSuccess("Password updated successfully!");
            setTimeout(() => router.replace("/(auth)/login"), 2000);
        } catch (e: any) {
            setError(e.response?.data?.message || "Failed to reset password.");
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
                    <S.BackBtn backgroundColor={currentColors.input} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={currentColors.text} />
                    </S.BackBtn>

                    <S.Header>
                        <S.IconCircle backgroundColor={currentColors.tint} shadowColor={currentColors.tint}>
                            <Ionicons 
                                name={step === 3 ? "lock-open-outline" : "mail-outline"} 
                                size={40} 
                                color="#fff" 
                            />
                        </S.IconCircle>
                        <S.Title color={currentColors.text}>
                            {step === 1 ? "Recovery" : step === 2 ? "Verify" : "Reset"}
                        </S.Title>
                        <S.Subtitle color={currentColors.textSecondary}>
                            {step === 1 ? "Enter your email to receive a reset code" : 
                             step === 2 ? `Enter the code sent to ${email}` : 
                             "Choose a strong new password"}
                        </S.Subtitle>
                    </S.Header>

                    <S.Form>
                        {error ? <S.ErrorText>{error}</S.ErrorText> : null}
                        {success ? <S.SuccessText>{success}</S.SuccessText> : null}
                        
                        {step === 1 && (
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
                        )}

                        {step === 2 && (
                            <S.InputContainer>
                                <S.Label color={currentColors.text}>Verification Code</S.Label>
                                <S.Input 
                                    backgroundColor={currentColors.input}
                                    color={currentColors.text}
                                    borderColor={currentColors.border}
                                    placeholder="000000"
                                    placeholderTextColor={currentColors.textSecondary}
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    keyboardAppearance={isDark ? "dark" : "light"}
                                    style={{ textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: '700' }}
                                />
                            </S.InputContainer>
                        )}

                        {step === 3 && (
                            <>
                                <S.InputContainer>
                                    <S.Label color={currentColors.text}>New Password</S.Label>
                                    <S.Input 
                                        backgroundColor={currentColors.input}
                                        color={currentColors.text}
                                        borderColor={currentColors.border}
                                        placeholder="Enter new password"
                                        placeholderTextColor={currentColors.textSecondary}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry
                                        keyboardAppearance={isDark ? "dark" : "light"}
                                    />
                                </S.InputContainer>
                                <S.InputContainer>
                                    <S.Label color={currentColors.text}>Confirm New Password</S.Label>
                                    <S.Input 
                                        backgroundColor={currentColors.input}
                                        color={currentColors.text}
                                        borderColor={currentColors.border}
                                        placeholder="Repeat new password"
                                        placeholderTextColor={currentColors.textSecondary}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        keyboardAppearance={isDark ? "dark" : "light"}
                                    />
                                </S.InputContainer>
                            </>
                        )}

                        <S.Button 
                            onPress={step === 1 ? handleSendCode : step === 2 ? handleVerifyCode : handleResetPassword}
                            disabled={loading}
                            backgroundColor={currentColors.tint}
                            shadowColor={currentColors.tint}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <S.ButtonText>
                                    {step === 1 ? "Send Code" : step === 2 ? "Verify Code" : "Update Password"}
                                </S.ButtonText>
                            )}
                        </S.Button>
                    </S.Form>
                </S.ScrollContent>
            </S.ScrollInner>
        </S.Container>
    );
};
