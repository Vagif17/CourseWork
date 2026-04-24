import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const Container = styled.SafeAreaView<{ backgroundColor: string }>`
    flex: 1;
    background-color: ${props => props.backgroundColor};
`;

export const Content = styled.KeyboardAvoidingView`
    flex: 1;
`;

export const Center = styled.View`
    flex: 1;
    justify-content: center;
    alignItems: center;
`;

export const MessageListContainer = styled.View`
    flex: 1;
`;

export const HeaderTitle = styled.View`
    flex-direction: row;
    align-items: center;
    width: ${width * 0.7}px;
`;

export const HeaderAvatarContainer = styled.View`
    position: relative;
    margin-right: 10px;
`;

export const HeaderAvatar = styled.Image`
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: rgba(0, 0, 0, 0.05);
`;

export const HeaderOnlineDot = styled.View`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #4ade80;
    border-width: 1.5px;
    border-color: #fff;
`;

export const HeaderTextContainer = styled.View`
    flex: 1;
`;

export const HeaderText = styled.Text<{ color: string }>`
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.color};
`;

export const HeaderSubtitle = styled.Text<{ color: string }>`
    font-size: 11px;
    color: ${props => props.color};
`;

export const HeaderCallBtn = styled.TouchableOpacity<{ backgroundColor: string }>`
    width: 38px;
    height: 38px;
    border-radius: 19px;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.backgroundColor};
`;

export const HeaderGroupBtn = styled.TouchableOpacity`
    padding: 5px;
`;

export const ActionButtons = styled.View`
    flex-direction: row;
    align-items: center;
    margin-right: 10px;
`;
