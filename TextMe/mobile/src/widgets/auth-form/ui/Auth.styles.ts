import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView<{ backgroundColor: string }>`
    flex: 1;
    background-color: ${props => props.backgroundColor};
`;

export const Inner = styled.View`
    flex: 1;
    padding: 24px;
    justify-content: center;
`;

export const ScrollInner = styled.ScrollView`
    flex: 1;
`;

export const BackBtn = styled.TouchableOpacity<{ backgroundColor: string }>`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: ${props => props.backgroundColor};
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
`;

export const ScrollContent = styled.View`
    padding: 24px;
    padding-top: 60px;
    padding-bottom: 40px;
`;

export const LogoContainer = styled.View`
    align-items: center;
    margin-bottom: 32px;
`;

export const Header = styled.View`
    align-items: center;
    margin-bottom: 40px;
`;

export const IconCircle = styled.View<{ backgroundColor: string; shadowColor: string }>`
    width: 80px;
    height: 80px;
    border-radius: 40px;
    background-color: ${props => props.backgroundColor};
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    shadow-offset: 0px 8px;
    shadow-opacity: 0.3;
    shadow-radius: 12px;
    elevation: 8;
    shadow-color: ${props => props.shadowColor};
`;

export const LogoImage = styled.Image`
    width: 100px;
    height: 100px;
    margin-bottom: 8px;
    resize-mode: contain;
`;

export const AvatarPicker = styled.TouchableOpacity<{ backgroundColor: string; borderColor: string }>`
    width: 100px;
    height: 100px;
    border-radius: 50px;
    background-color: ${props => props.backgroundColor};
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
    border-width: 1px;
    border-color: ${props => props.borderColor};
`;

export const AvatarImage = styled.Image`
    width: 100px;
    height: 100px;
    border-radius: 50px;
`;

export const AvatarPlaceholder = styled.View`
    align-items: center;
    justify-content: center;
`;

export const EditIconBadge = styled.View<{ backgroundColor: string; borderColor: string }>`
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: ${props => props.backgroundColor};
    width: 28px;
    height: 28px;
    border-radius: 14px;
    justify-content: center;
    align-items: center;
    border-width: 3px;
    border-color: ${props => props.borderColor};
`;

export const Title = styled.Text<{ color: string }>`
    font-size: 32px;
    font-weight: 800;
    color: ${props => props.color};
    letter-spacing: 0.5px;
`;

export const Subtitle = styled.Text<{ color: string }>`
    font-size: 16px;
    color: ${props => props.color};
    margin-top: 8px;
`;

export const Form = styled.View`
    width: 100%;
`;

export const Row = styled.View`
    flex-direction: row;
`;

export const InputContainer = styled.View`
    margin-bottom: 20px;
`;

export const Label = styled.Text<{ color: string }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.color};
    margin-bottom: 8px;
    margin-left: 4px;
`;

export const Input = styled.TextInput<{ backgroundColor: string; color: string; borderColor: string }>`
    height: 56px;
    background-color: ${props => props.backgroundColor};
    border-radius: 16px;
    padding-horizontal: 20px;
    font-size: 16px;
    color: ${props => props.color};
    border-width: 1px;
    border-color: ${props => props.borderColor};
`;

export const Button = styled.TouchableOpacity<{ backgroundColor: string; shadowColor: string }>`
    height: 56px;
    background-color: ${props => props.backgroundColor};
    border-radius: 16px;
    justify-content: center;
    align-items: center;
    margin-top: 12px;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 8px;
    elevation: 5;
    shadow-color: ${props => props.shadowColor};
`;

export const ButtonText = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: 700;
`;

export const ErrorText = styled.Text`
    color: #ef4444;
    margin-bottom: 16px;
    text-align: center;
    font-weight: 500;
`;

export const SuccessText = styled.Text`
    color: #4ade80;
    margin-bottom: 16px;
    text-align: center;
    font-weight: 500;
`;

export const Footer = styled.View`
    flex-direction: row;
    justify-content: center;
    margin-top: 24px;
`;

export const FooterText = styled.Text<{ color: string }>`
    color: ${props => props.color};
    font-size: 15px;
`;

export const LinkText = styled.Text<{ color: string }>`
    color: ${props => props.color};
    font-size: 15px;
    font-weight: 700;
`;

export const ForgotBtn = styled.TouchableOpacity`
    align-self: flex-end;
    margin-bottom: 20px;
`;

export const ForgotText = styled.Text<{ color: string }>`
    color: ${props => props.color};
    font-size: 14px;
    font-weight: 500;
`;
