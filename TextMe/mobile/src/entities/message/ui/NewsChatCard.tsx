import React from 'react';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as S from './NewsChatCard.styles';

interface NewsChatCardProps {
    article: {
        title: string;
        link: string;
        imageUrl?: string;
        source?: string;
        summary?: string;
    };
    isMine: boolean;
    currentColors: any;
}

const NewsChatCard = ({ article, isMine, currentColors }: NewsChatCardProps) => {
    const handlePress = () => {
        if (article.link) {
            Linking.openURL(article.link);
        }
    };

    return (
        <S.CardContainer 
            onPress={handlePress} 
            isMine={isMine}
            backgroundColor={isMine ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)'}
            borderColor={isMine ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
        >
            {article.imageUrl ? (
                <S.NewsImage source={{ uri: article.imageUrl }} />
            ) : (
                <S.PlaceholderImage>
                    <Ionicons name="newspaper-outline" size={32} color={currentColors.textSecondary} />
                </S.PlaceholderImage>
            )}
            <S.CardContent>
                {article.source && (
                    <S.SourceLabel color={isMine ? '#fff' : currentColors.tint}>
                        {article.source}
                    </S.SourceLabel>
                )}
                <S.Title color={isMine ? '#fff' : currentColors.text} numberOfLines={2}>
                    {article.title}
                </S.Title>
                {article.summary && (
                    <S.Summary color={isMine ? 'rgba(255,255,255,0.7)' : currentColors.textSecondary} numberOfLines={3}>
                        {article.summary}
                    </S.Summary>
                )}
            </S.CardContent>
        </S.CardContainer>
    );
};

export default NewsChatCard;
