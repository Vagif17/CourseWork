import styled from 'styled-components/native';

export const Container = styled.View<{ backgroundColor: string }>`
    flex: 1;
    background-color: ${props => props.backgroundColor};
`;

export const SearchContainer = styled.View<{ backgroundColor: string; borderColor: string }>`
    flex-direction: row;
    align-items: center;
    margin: 16px;
    padding-horizontal: 16px;
    padding-vertical: 12px;
    border-radius: 12px;
    border-width: 1px;
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.borderColor};
`;

export const SearchInput = styled.TextInput<{ color: string }>`
    flex: 1;
    font-size: 16px;
    color: ${props => props.color};
`;

export const ChatItem = styled.TouchableOpacity`
    flex-direction: row;
    padding: 16px;
    align-items: center;
`;

export const AvatarContainer = styled.View`
    width: 60px;
    height: 60px;
    position: relative;
`;

export const Avatar = styled.Image<{ backgroundColor: string }>`
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background-color: ${props => props.backgroundColor};
`;

export const OnlineDot = styled.View<{ borderColor: string }>`
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    border-radius: 7px;
    background-color: #4ade80;
    border-width: 2px;
    border-color: ${props => props.borderColor};
`;

export const ChatInfo = styled.View`
    flex: 1;
    margin-left: 16px;
    justify-content: center;
`;

export const ChatHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
`;

export const ChatName = styled.Text<{ color: string }>`
    font-size: 16px;
    font-weight: 700;
    color: ${props => props.color};
`;

export const PresenceText = styled.Text<{ color: string }>`
    font-size: 11px;
    margin-top: 1px;
    color: ${props => props.color};
`;

export const Time = styled.Text<{ color: string }>`
    font-size: 13px;
    color: ${props => props.color};
`;

export const ChatBody = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const LastMessage = styled.Text<{ color: string }>`
    font-size: 15px;
    flex: 1;
    margin-right: 12px;
    color: ${props => props.color};
`;

export const Badge = styled.View<{ backgroundColor: string }>`
    border-radius: 10px;
    min-width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
    padding-horizontal: 6px;
    background-color: ${props => props.backgroundColor};
`;

export const BadgeText = styled.Text`
    color: #fff;
    font-size: 11px;
    font-weight: 700;
`;

export const EmptyContainer = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    margin-top: 100px;
    padding-horizontal: 40px;
`;

export const EmptyText = styled.Text<{ color: string }>`
    text-align: center;
    margin-top: 16px;
    font-size: 16px;
    line-height: 22px;
    color: ${props => props.color};
`;

export const FAB = styled.TouchableOpacity<{ backgroundColor: string; shadowColor: string }>`
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 64px;
    height: 64px;
    border-radius: 32px;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.backgroundColor};
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 8px;
    elevation: 8;
    shadow-color: ${props => props.shadowColor};
`;
