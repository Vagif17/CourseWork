import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config/constants/Colors';

interface AudioPlayerProps {
    uri: string;
    duration?: number;
    isMine: boolean;
}

export default function AudioPlayer({ uri, duration, isMine }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration ? duration * 1000 : 0);

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    async function togglePlayback() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            if (sound === null) {
                setLoading(true);
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                setSound(newSound);
                setIsPlaying(true);
            } else {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            }
        } catch (error) {
            console.error("Failed to load/play sound", error);
        } finally {
            setLoading(false);
        }
    }

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            if (status.durationMillis) {
                setTotalDuration(status.durationMillis);
            }
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                sound?.setPositionAsync(0);
            }
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = totalDuration > 0 ? (position / totalDuration) * 100 : 0;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={togglePlayback} style={styles.playBtn} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color={isMine ? "#fff" : Colors.dark.tint} />
                ) : (
                    <Ionicons 
                        name={isPlaying ? "pause" : "play"} 
                        size={24} 
                        color={isMine ? "#fff" : Colors.dark.tint} 
                    />
                )}
            </TouchableOpacity>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: isMine ? "rgba(255,255,255,0.8)" : Colors.dark.tint }]} />
                </View>
                <Text style={[styles.timeText, { color: isMine ? "rgba(255,255,255,0.7)" : Colors.dark.textSecondary }]}>
                    {formatTime(isPlaying ? position : totalDuration)}
                </Text>
            </View>

            <Ionicons name="mic" size={16} color={isMine ? "rgba(255,255,255,0.5)" : Colors.dark.textSecondary} style={styles.micIcon} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
        minWidth: 160,
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        flex: 1,
        marginLeft: 10,
    },
    progressBarWrapper: {
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBar: {
        height: '100%',
    },
    timeText: {
        fontSize: 11,
    },
    micIcon: {
        marginLeft: 8,
    }
});
