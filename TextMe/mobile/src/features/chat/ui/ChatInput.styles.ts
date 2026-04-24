import styled from 'styled-components/native';
import { TouchableOpacity as RNTouchableOpacity, View, Text, TextInput, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ThemeProps {
    colors: {
        background: string;
        text: string;
        textSecondary: string;
        border: string;
        tint: string;
        surface: string;
        input: string;
    };
}

export const Footer = styled(View) <ThemeProps>`
    border-top-width: 1px;
    background-color: ${props => props.colors.background};
    border-top-color: ${props => props.colors.border};
`;

export const ActionPreview = styled(View) <ThemeProps>`
    flex-direction: row;
    align-items: center;
    padding: 8px 16px;
    border-bottom-width: 1px;
    border-bottom-color: ${props => props.colors.border};
`;

export const ActionIndicator = styled(View) <ThemeProps>`
    width: 3px;
    height: 100%;
    margin-right: 10px;
    border-radius: 1.5px;
    background-color: ${props => props.colors.tint};
`;

export const ActionContent = styled(View)`
    flex: 1;
`;

export const ActionTitle = styled(Text) <ThemeProps>`
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.colors.tint};
`;

export const ActionText = styled(Text) <ThemeProps>`
    font-size: 13px;
    color: ${props => props.colors.textSecondary};
`;

export const TouchableOpacity = styled(RNTouchableOpacity)``;

export const InputContainer = styled(View)`
    flex-direction: row;
    align-items: flex-end;
    padding: 12px;
`;

export const AttachBtn = styled(RNTouchableOpacity)`
    padding: 8px;
`;

export const Input = styled(TextInput) <ThemeProps>`
    flex: 1;
    border-radius: 24px;
    padding: 10px 16px;
    margin: 0 8px;
    font-size: 16px;
    max-height: 120px;
    background-color: ${props => props.colors.input};
    color: ${props => props.colors.text};
`;

export const RecordBtn = styled(RNTouchableOpacity) <{ isRecording?: boolean; colors: ThemeProps['colors'] }>`
    padding: 8px;
    ${props => props.isRecording && `
        background-color: #ff3b30;
        border-radius: 20px;
    `}
`;

export const SendBtn = styled(RNTouchableOpacity) <ThemeProps>`
    background-color: ${props => props.colors.tint};
    width: 40px;
    height: 40px;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    margin-bottom: 4px;
`;
