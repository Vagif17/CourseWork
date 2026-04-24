import styled from 'styled-components/native';

export const Container = styled.View<{ backgroundColor: string }>`
    flex: 1;
    background-color: ${props => props.backgroundColor};
`;

export const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

export const Categories = styled.View`
    flex-direction: row;
    padding: 16px;
`;

export const CatChip = styled.TouchableOpacity<{ backgroundColor: string; borderColor: string; isActive: boolean; activeColor: string }>`
    padding-horizontal: 16px;
    padding-vertical: 8px;
    border-radius: 20px;
    border-width: 1px;
    margin-right: 10px;
    background-color: ${props => props.isActive ? props.activeColor : props.backgroundColor};
    border-color: ${props => props.isActive ? props.activeColor : props.borderColor};
`;

export const CatText = styled.Text<{ color: string; isActive: boolean }>`
    font-weight: 600;
    color: ${props => props.isActive ? '#fff' : props.color};
`;

export const NewsCard = styled.View<{ backgroundColor: string; borderColor: string }>`
    border-radius: 20px;
    margin-bottom: 20px;
    overflow: hidden;
    border-width: 1px;
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.borderColor};
`;

export const NewsImage = styled.Image`
    width: 100%;
    height: 200px;
`;

export const NewsPlaceholder = styled.View<{ backgroundColor: string }>`
    width: 100%;
    height: 200px;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.backgroundColor};
`;

export const NewsInfo = styled.View`
    padding: 16px;
`;

export const NewsMeta = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
`;

export const CategoryLabel = styled.Text<{ color: string }>`
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    color: ${props => props.color};
`;

export const Dot = styled.Text<{ color: string }>`
    margin-horizontal: 6px;
    color: ${props => props.color};
`;

export const TimeLabel = styled.Text<{ color: string }>`
    font-size: 12px;
    color: ${props => props.color};
`;

export const TitleRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
`;

export const NewsTitle = styled.Text<{ color: string }>`
    font-size: 18px;
    font-weight: 800;
    flex: 1;
    margin-right: 8px;
    line-height: 24px;
    color: ${props => props.color};
`;

export const ShareBtn = styled.TouchableOpacity`
    padding: 4px;
`;

export const NewsDesc = styled.Text<{ color: string }>`
    font-size: 14px;
    line-height: 20px;
    color: ${props => props.color};
`;

export const EmptyContainer = styled.View`
    align-items: center;
    margin-top: 60px;
`;

export const EmptyText = styled.Text<{ color: string }>`
    color: ${props => props.color};
    text-align: center;
`;
