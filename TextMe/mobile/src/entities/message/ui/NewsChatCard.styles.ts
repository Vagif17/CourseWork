import styled from 'styled-components/native';

export const CardContainer = styled.TouchableOpacity<{ isMine: boolean; backgroundColor: string; borderColor: string }>`
    width: 240px;
    background-color: ${props => props.backgroundColor};
    border-radius: 12px;
    border-width: 1px;
    border-color: ${props => props.borderColor};
    overflow: hidden;
    margin-vertical: 4px;
`;

export const NewsImage = styled.Image`
    width: 100%;
    height: 120px;
    background-color: rgba(0, 0, 0, 0.05);
`;

export const PlaceholderImage = styled.View`
    width: 100%;
    height: 120px;
    background-color: rgba(0, 0, 0, 0.05);
    justify-content: center;
    align-items: center;
`;

export const CardContent = styled.View`
    padding: 10px;
`;

export const SourceLabel = styled.Text<{ color: string }>`
    font-size: 11px;
    font-weight: 600;
    color: ${props => props.color};
    text-transform: uppercase;
    margin-bottom: 4px;
`;

export const Title = styled.Text<{ color: string }>`
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.color};
    margin-bottom: 6px;
`;

export const Summary = styled.Text<{ color: string }>`
    font-size: 12px;
    color: ${props => props.color};
    opacity: 0.8;
`;
