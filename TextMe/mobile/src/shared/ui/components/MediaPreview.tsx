import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config/constants/Colors';

interface MediaPreviewProps {
    images: { uri: string }[];
    onRemove: (index: number) => void;
}

export default function MediaPreview({ images, onRemove }: MediaPreviewProps) {
    if (images.length === 0) return null;

    return (
        <View style={styles.container}>
            <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.uri}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: item.uri }} style={styles.image} />
                        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
                            <Ionicons name="close-circle" size={20} color="#ff3b30" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        maxHeight: 100,
        backgroundColor: Colors.dark.background,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
    },
    list: {
        padding: 10,
    },
    imageWrapper: {
        marginRight: 10,
        width: 80,
        height: 80,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        backgroundColor: Colors.dark.surface,
    },
    removeBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 10,
    }
});
