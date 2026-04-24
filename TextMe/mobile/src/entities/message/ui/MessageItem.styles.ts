import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const MessageRow = styled.View<{ isMine: boolean }>`
    width: 100%;
    margin-vertical: 4px;
    flex-direction: row;
    justify-content: ${props => props.isMine ? 'flex-end' : 'flex-start'};
`;

export const MessageAvatar = styled.Image`
    width: 32px;
    height: 32px;
    border-radius: 16px;
    margin-right: 8px;
    align-self: flex-end;
    margin-bottom: 4px;
`;

export const Bubble = styled.TouchableOpacity<{ isMine: boolean; backgroundColor: string; borderColor: string }>`
    max-width: 80%;
    padding-horizontal: 12px;
    padding-vertical: 8px;
    border-radius: 18px;
    border-bottom-right-radius: ${props => props.isMine ? '4px' : '18px'};
    border-bottom-left-radius: ${props => props.isMine ? '18px' : '4px'};
    background-color: ${props => props.backgroundColor};
    border-width: ${props => props.isMine ? '0' : '1px'};
    border-color: ${props => props.borderColor};
`;

export const ReplyBlock = styled.View`
    border-left-width: 3px;
    border-left-color: #007AFF;
    padding-left: 8px;
    padding-vertical: 4px;
    margin-bottom: 4px;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.1);
`;

export const ReplyAuthor = styled.Text<{ color: string }>`
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.color};
`;

export const ReplyText = styled.Text<{ color: string }>`
    font-size: 12px;
    color: ${props => props.color};
`;

export const MessageImage = styled.Image`
    width: ${width * 0.6}px;
    height: ${width * 0.6}px;
    border-radius: 12px;
    margin-bottom: 4px;
`;

export const MessageText = styled.Text<{ isMine: boolean; color: string }>`
    font-size: 16px;
    line-height: 22px;
    color: ${props => props.color};
    font-style: ${props => props.isDeleted ? 'italic' : 'normal'};
`;

export const MessageBottom = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 4px;
`;

export const MessageTime = styled.Text<{ color: string }>`
    font-size: 10px;
    margin-top: 4px;
    align-self: flex-end;
    color: ${props => props.color};
`;

export const StatusContainer = styled.View`
    margin-left: 2px;
`;

export const SenderName = styled.Text<{ color: string }>`
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 2px;
    color: ${props => props.color};
`;

export const SystemMessageContainer = styled.View`
    align-items: center;
    margin-vertical: 10px;
    padding-horizontal: 20px;
`;

export const SystemMessageText = styled.Text<{ color: string }>`
    font-size: 13px;
    text-align: center;
    font-weight: 500;
    color: ${props => props.color};
`;

export const DateHeader = styled.View`
    align-items: center;
    margin-vertical: 16px;
`;

export const DateHeaderText = styled.Text`
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    background-color: rgba(255, 255, 255, 0.05);
    padding-horizontal: 12px;
    padding-vertical: 4px;
    border-radius: 12px;
    overflow: hidden;
`;

export const EditedText = styled.Text`
    font-size: 11px;
    font-style: italic;
    opacity: 0.7;
`;
