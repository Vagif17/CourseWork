import styled from 'styled-components/native';

export const Container = styled.ScrollView<{ backgroundColor: string }>`
    flex: 1;
    background-color: ${props => props.backgroundColor};
`;

export const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

export const Header = styled.View<{ backgroundColor: string; borderColor: string }>`
    align-items: center;
    padding-vertical: 32px;
    background-color: ${props => props.backgroundColor};
    border-bottom-width: 1px;
    border-bottom-color: ${props => props.borderColor};
`;

export const AvatarContainer = styled.View`
    position: relative;
    margin-bottom: 16px;
`;

export const Avatar = styled.Image<{ borderColor: string }>`
    width: 120px;
    height: 120px;
    border-radius: 60px;
    border-width: 4px;
    border-color: ${props => props.borderColor};
`;

export const EditAvatar = styled.TouchableOpacity<{ backgroundColor: string; borderColor: string }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 36px;
    height: 36px;
    border-radius: 18px;
    justify-content: center;
    align-items: center;
    border-width: 3px;
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.borderColor};
`;

export const Name = styled.Text<{ color: string }>`
    fontSize: 24px;
    font-weight: 800;
    color: ${props => props.color};
`;

export const Username = styled.Text<{ color: string }>`
    font-size: 16px;
    margin-top: 4px;
    color: ${props => props.color};
`;

export const Section = styled.View`
    padding-horizontal: 20px;
    margin-top: 24px;
`;

export const SectionTitle = styled.Text<{ color: string }>`
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
    margin-left: 4px;
    color: ${props => props.color};
`;

export const Card = styled.View<{ backgroundColor: string; borderColor: string }>`
    border-radius: 20px;
    border-width: 1px;
    overflow: hidden;
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.borderColor};
`;

export const InfoRow = styled.View<{ borderColor: string; noBorder?: boolean }>`
    flex-direction: row;
    align-items: center;
    padding: 16px;
    border-bottom-width: ${props => props.noBorder ? '0px' : '1px'};
    border-bottom-color: ${props => props.borderColor};
`;

export const InfoContent = styled.View`
    margin-left: 16px;
`;

export const InfoLabel = styled.Text<{ color: string }>`
    font-size: 12px;
    color: ${props => props.color};
`;

export const InfoValue = styled.Text<{ color: string }>`
    font-size: 16px;
    font-weight: 500;
    color: ${props => props.color};
`;

export const MenuItem = styled.TouchableOpacity<{ borderColor: string; noBorder?: boolean }>`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom-width: ${props => props.noBorder ? '0px' : '1px'};
    border-bottom-color: ${props => props.borderColor};
`;

export const MenuLeft = styled.View`
    flex-direction: row;
    align-items: center;
`;

export const MenuText = styled.Text<{ color: string }>`
    margin-left: 16px;
    font-size: 16px;
    font-weight: 500;
    color: ${props => props.color};
`;

export const LogoutButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 32px;
    padding: 16px;
    margin-horizontal: 20px;
    background-color: rgba(255, 68, 68, 0.1);
    border-radius: 20px;
    border-width: 1px;
    border-color: rgba(255, 68, 68, 0.2);
`;

export const LogoutText = styled.Text`
    margin-left: 12px;
    font-size: 16px;
    font-weight: 700;
    color: #ff4444;
`;

export const Version = styled.Text<{ color: string }>`
    text-align: center;
    margin-top: 40px;
    font-size: 12px;
    color: ${props => props.color};
`;

export const ModalOverlay = styled.View`
    flex: 1;
    background-color: rgba(0,0,0,0.6);
    justify-content: center;
    padding: 20px;
`;

export const ModalContent = styled.View<{ backgroundColor: string }>`
    border-radius: 24px;
    padding: 24px;
    background-color: ${props => props.backgroundColor};
`;

export const ModalTitle = styled.Text<{ color: string }>`
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: ${props => props.color};
`;

export const Input = styled.TextInput<{ backgroundColor: string; color: string }>`
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    font-size: 16px;
    background-color: ${props => props.backgroundColor};
    color: ${props => props.color};
`;

export const ModalButtons = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 8px;
`;

export const CancelBtn = styled.TouchableOpacity`
    padding-vertical: 12px;
    padding-horizontal: 16px;
`;

export const CancelBtnText = styled.Text`
    font-weight: 600;
    color: #ff4444;
`;

export const ConfirmBtn = styled.TouchableOpacity<{ backgroundColor: string }>`
    padding-vertical: 12px;
    padding-horizontal: 24px;
    border-radius: 12px;
    align-items: center;
    background-color: ${props => props.backgroundColor};
`;

export const ConfirmBtnText = styled.Text`
    color: #fff;
    font-weight: bold;
`;

export const SettingRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

export const ThemeOption = styled.TouchableOpacity<{ backgroundColor?: string }>`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 8px;
    background-color: ${props => props.backgroundColor || 'transparent'};
`;
