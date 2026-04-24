import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { newsService } from '../../../shared/api/services/newsService';
import { useAppTheme } from '../../../shared/config/constants/ThemeContext';
import ShareToChatModal from '../../../shared/ui/components/ShareToChatModal';

import * as S from './NewsFeed.styles';

export const NewsFeed = () => {
    const { currentColors } = useAppTheme();
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [category, setCategory] = useState("world");
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [selectedNews, setSelectedNews] = useState<any>(null);

    const loadNews = useCallback(async () => {
        try {
            const data = await newsService.getNews(category);
            setNews(data);
        } catch (error) {
            console.error("Failed to load news:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [category]);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const onRefresh = () => {
        setRefreshing(true);
        loadNews();
    };

    const handleSharePress = (item: any) => {
        setSelectedNews(item);
        setShareModalVisible(true);
    };

    const renderNewsItem = ({ item }: { item: any }) => {
        const timeAgo = new Date(item.publishedAt).toLocaleDateString();

        return (
            <S.NewsCard borderColor={currentColors.border} backgroundColor={currentColors.surface}>
                {item.imageUrl ? (
                    <S.NewsImage source={{ uri: item.imageUrl }} resizeMode="cover" />
                ) : (
                    <S.NewsPlaceholder backgroundColor={currentColors.input}>
                        <Ionicons name="image-outline" size={48} color={currentColors.textSecondary} />
                    </S.NewsPlaceholder>
                )}
                <S.NewsInfo>
                    <S.NewsMeta>
                        <S.CategoryLabel color={currentColors.tint}>{item.category || "General"}</S.CategoryLabel>
                        <S.Dot color={currentColors.textSecondary}>•</S.Dot>
                        <S.TimeLabel color={currentColors.textSecondary}>{timeAgo}</S.TimeLabel>
                    </S.NewsMeta>
                    <S.TitleRow>
                        <S.NewsTitle color={currentColors.text} numberOfLines={2}>{item.title}</S.NewsTitle>
                        <S.ShareBtn onPress={() => handleSharePress(item)}>
                            <Ionicons name="share-social-outline" size={20} color={currentColors.tint} />
                        </S.ShareBtn>
                    </S.TitleRow>
                    {item.description ? (
                        <S.NewsDesc color={currentColors.textSecondary} numberOfLines={3}>{item.description}</S.NewsDesc>
                    ) : null}
                </S.NewsInfo>
            </S.NewsCard>
        );
    };

    if (loading && !refreshing) {
        return (
            <S.LoadingContainer>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </S.LoadingContainer>
        );
    }

    return (
        <S.Container backgroundColor={currentColors.background}>
            <View>
                <S.Categories>
                    {["world", "popculture", "games", "sports"].map((cat) => (
                        <S.CatChip 
                            key={cat} 
                            backgroundColor={currentColors.input} 
                            borderColor={currentColors.border}
                            isActive={category === cat}
                            activeColor={currentColors.tint}
                            onPress={() => { setCategory(cat); setLoading(true); }}
                        >
                            <S.CatText color={currentColors.textSecondary} isActive={category === cat}>{cat}</S.CatText>
                        </S.CatChip>
                    ))}
                </S.Categories>
            </View>

            <FlatList
                data={news}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderNewsItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.tint} />
                }
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                ListEmptyComponent={
                    <S.EmptyContainer>
                        <S.EmptyText color={currentColors.textSecondary}>No news articles found in this category.</S.EmptyText>
                    </S.EmptyContainer>
                }
            />

            <ShareToChatModal 
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                newsItem={selectedNews}
            />
        </S.Container>
    );
};
