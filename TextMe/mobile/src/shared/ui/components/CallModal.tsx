import {
    View, Text, StyleSheet, Modal,
    TouchableOpacity, Image, Dimensions,
    StatusBar, Platform, NativeModules
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useWebRTC } from '../../lib/hooks/useWebRTC';
import { useAppTheme } from '../../config/constants/ThemeContext';

const hasWebRTC = !!NativeModules.WebRTCModule;
const RTCView = hasWebRTC ? require('react-native-webrtc').RTCView : View;

const { width, height } = Dimensions.get('window');

type Props = {
    webrtc: ReturnType<typeof useWebRTC>;
    visible: boolean;
};

export default function CallModal({ webrtc, visible }: Props) {
    const {
        callState,
        incomingCall,
        localStream,
        remoteStream,
        callTargetName,
        callTargetAvatar,
        isMuted,
        toggleMute,
        answerCall,
        rejectCall,
        endCall
    } = webrtc;

    const { currentColors, isDark } = useAppTheme();

    if (callState === 'idle') return null;

    const renderIncoming = () => (
        <View style={styles.fullCenter}>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: incomingCall?.avatarUrl || 'https://via.placeholder.com/120' }}
                    style={styles.largeAvatar}
                />
            </View>
            <Text style={styles.targetName}>{callTargetName}</Text>
            <Text style={styles.callStatus}>Incoming {incomingCall?.withVideo ? 'Video' : 'Audio'} Call...</Text>

            <View style={styles.incomingActions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={rejectCall}
                >
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.answerBtn]}
                    onPress={() => answerCall(incomingCall?.withVideo)}
                >
                    <Ionicons name={incomingCall?.withVideo ? "videocam" : "call"} size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderOutgoing = () => (
        <View style={styles.fullCenter}>
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: callTargetAvatar || 'https://via.placeholder.com/120' }}
                    style={styles.largeAvatar}
                />
            </View>
            <Text style={styles.targetName}>{callTargetName}</Text>
            <Text style={styles.callStatus}>Calling...</Text>

            {localStream && (
                <View style={styles.miniVideoContainer}>
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={styles.miniVideo}
                        objectFit="cover"
                        mirror={true}
                    />
                </View>
            )}

            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={endCall}
                >
                    <Ionicons name="call-outline" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderConnected = () => (
        <View style={styles.fullScreen}>
            {remoteStream ? (
                <RTCView
                    streamURL={remoteStream.toURL()}
                    style={styles.fullScreenVideo}
                    objectFit="cover"
                />
            ) : (
                <View style={styles.fullCenter}>
                    <Image
                        source={{ uri: callTargetAvatar || 'https://via.placeholder.com/120' }}
                        style={styles.largeAvatar}
                    />
                    <Text style={styles.targetName}>{callTargetName}</Text>
                    <Text style={styles.callStatus}>Connected...</Text>
                </View>
            )}

            {localStream && (
                <View style={styles.miniVideoContainer}>
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={styles.miniVideo}
                        objectFit="cover"
                        mirror={true}
                    />
                </View>
            )}

            <View style={styles.controlsLayer}>
                <BlurView intensity={20} tint="dark" style={styles.controlsBlur}>
                    <TouchableOpacity
                        style={[styles.controlIcon, isMuted && styles.controlActive]}
                        onPress={toggleMute}
                    >
                        <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlIcon, styles.endCallBtn]}
                        onPress={endCall}
                    >
                        <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlIcon}>
                        <Ionicons name="videocam-off" size={28} color="#fff" />
                    </TouchableOpacity>
                </BlurView>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
                <StatusBar barStyle="light-content" translucent />
                {callState === 'ringing' && renderIncoming()}
                {callState === 'calling' && renderOutgoing()}
                {(callState === 'connected') && renderConnected()}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullScreen: {
        flex: 1,
    },
    fullCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    largeAvatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    targetName: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 10,
    },
    callStatus: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 18,
    },
    incomingActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 50,
        marginTop: 100,
    },
    actionBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    rejectBtn: {
        backgroundColor: '#ff3b30',
    },
    answerBtn: {
        backgroundColor: '#34c759',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 80,
    },
    fullScreenVideo: {
        width: width,
        height: height,
    },
    miniVideoContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 110,
        height: 160,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        elevation: 10,
    },
    miniVideo: {
        width: '100%',
        height: '100%',
    },
    controlsLayer: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    controlsBlur: {
        flexDirection: 'row',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 40,
        gap: 30,
        overflow: 'hidden',
    },
    controlIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlActive: {
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    endCallBtn: {
        backgroundColor: '#ff3b30',
    }
});
