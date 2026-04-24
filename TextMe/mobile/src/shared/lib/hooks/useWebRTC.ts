import { useState, useRef, useEffect, useCallback } from "react";
import { NativeModules, Alert } from 'react-native';
import chatHub from "../../api/hubs/chatHub";
import { Audio } from 'expo-av';

const hasWebRTC = !!NativeModules.WebRTCModule;

export type CallState = "idle" | "calling" | "ringing" | "connected";

export function useWebRTC(currentUserId: string | null) {
    const [callState, setCallState] = useState<CallState>("idle");
    const [callTargetId, setCallTargetId] = useState<string | null>(null);
    const [callTargetName, setCallTargetName] = useState<string>("User");
    const [callTargetAvatar, setCallTargetAvatar] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<{ callerId: string, offer: any, withVideo: boolean, avatarUrl?: string } | null>(null);
    const [localStream, setLocalStream] = useState<any | null>(null);
    const [remoteStream, setRemoteStream] = useState<any | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isRemoteTalking, setIsRemoteTalking] = useState(false);

    const pc = useRef<any>(null);
    const pendingCandidates = useRef<any[]>([]);
    const ringtoneRef = useRef<Audio.Sound | null>(null);

    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    };

    // Динамический импорт WebRTC классов
    const getWebRTC = () => {
        if (!hasWebRTC) return null;
        return require('react-native-webrtc');
    };

    const playRingtone = async () => {
        try {
            if (ringtoneRef.current) await ringtoneRef.current.unloadAsync();
            const { sound } = await Audio.Sound.createAsync(
                require("../../assets/sounds/ringtone.mp3"),
                { isLooping: true }
            );
            ringtoneRef.current = sound;
            await sound.playAsync();
        } catch (e) {
            console.warn("Ringtone play failed", e);
        }
    };

    const stopRingtone = async () => {
        if (ringtoneRef.current) {
            await ringtoneRef.current.stopAsync().catch(() => { });
            await ringtoneRef.current.unloadAsync().catch(() => { });
            ringtoneRef.current = null;
        }
    };

    useEffect(() => {
        if (callState === "ringing") {
            playRingtone();
        } else {
            stopRingtone();
        }
        return () => { stopRingtone(); };
    }, [callState]);

    const cleanup = useCallback(() => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach((t: any) => t.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setCallState("idle");
        setCallTargetId(null);
        setCallTargetAvatar(null);
        setIncomingCall(null);
        setIsMuted(false);
        setIsRemoteTalking(false);
        pendingCandidates.current = [];
    }, [localStream]);

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const createPeerConnection = (targetUserId: string) => {
        const webrtc = getWebRTC();
        if (!webrtc) return null;

        const peer = new webrtc.RTCPeerConnection(iceServers);

        peer.onicecandidate = (e: any) => {
            if (e.candidate) {
                chatHub.sendIceCandidate(targetUserId, e.candidate);
            }
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === "failed" || peer.connectionState === "closed") {
                cleanup();
            }
        };

        peer.ontrack = (e: any) => {
            setRemoteStream(e.streams[0]);
        };

        pc.current = peer;
        return peer;
    };

    const startCall = async (targetUserId: string, targetUserName: string, withVideo: boolean = true, targetAvatar?: string, callerAvatar?: string) => {
        if (!hasWebRTC) {
            Alert.alert("Not Supported", "Calls are not supported in Expo Go. Please use a Development Build.");
            return;
        }

        const webrtc = getWebRTC();
        try {
            const constraints = {
                audio: true,
                video: withVideo ? { facingMode: 'user' } : false
            };

            const stream = await webrtc.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            setCallTargetId(targetUserId);
            setCallTargetName(targetUserName);
            setCallTargetAvatar(targetAvatar || null);
            setCallState("calling");

            const peer = createPeerConnection(targetUserId);
            stream.getTracks().forEach((track: any) => {
                peer.addTrack(track, stream);
            });

            const offer = await peer.createOffer({});
            await peer.setLocalDescription(offer);

            await chatHub.callUser(targetUserId, offer, withVideo, callerAvatar || null);
        } catch (err) {
            console.error("Failed to start call", err);
            cleanup();
        }
    };

    const answerCall = async (withVideo: boolean = true) => {
        if (!incomingCall || !hasWebRTC) return;

        const webrtc = getWebRTC();
        try {
            const constraints = {
                audio: true,
                video: withVideo ? { facingMode: 'user' } : false
            };
            const stream = await webrtc.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            setCallTargetId(incomingCall.callerId);
            setCallTargetAvatar(incomingCall.avatarUrl || null);
            setCallState("connected");

            const peer = createPeerConnection(incomingCall.callerId);
            stream.getTracks().forEach((track: any) => {
                peer.addTrack(track, stream);
            });

            await peer.setRemoteDescription(new webrtc.RTCSessionDescription(incomingCall.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            pendingCandidates.current.forEach(c => pc.current?.addIceCandidate(new webrtc.RTCIceCandidate(c)));
            pendingCandidates.current = [];

            await chatHub.answerCall(incomingCall.callerId, answer);
            setIncomingCall(null);
        } catch (err) {
            console.error("Failed to answer", err);
            await chatHub.rejectCall(incomingCall.callerId);
            cleanup();
        }
    };

    const rejectCall = async () => {
        if (!incomingCall) return;
        await chatHub.rejectCall(incomingCall.callerId);
        cleanup();
    };

    const endCall = async () => {
        if (callTargetId) {
            await chatHub.endCall(callTargetId);
        }
        cleanup();
    };

    useEffect(() => {
        if (!currentUserId || !hasWebRTC) return;

        const onIncomingCall = (payload: any) => {
            if (callState !== "idle") {
                chatHub.rejectCall(payload.callerId);
                return;
            }
            setIncomingCall(payload);
            setCallTargetName("Incoming Call");
            setCallState("ringing");
        };

        const onCallAnswered = async (payload: any) => {
            const webrtc = getWebRTC();
            if (pc.current && callState === "calling" && webrtc) {
                await pc.current.setRemoteDescription(new webrtc.RTCSessionDescription(payload.answer));
                for (const candidate of pendingCandidates.current) {
                    await pc.current.addIceCandidate(new webrtc.RTCIceCandidate(candidate));
                }
                pendingCandidates.current = [];
                setCallState("connected");
            }
        };

        const onCallRejected = () => cleanup();
        const onCallEnded = () => cleanup();

        const onReceiveIceCandidate = async (payload: any) => {
            const webrtc = getWebRTC();
            if (pc.current && pc.current.remoteDescription && webrtc) {
                await pc.current.addIceCandidate(new webrtc.RTCIceCandidate(payload.candidate));
            } else {
                pendingCandidates.current.push(payload.candidate);
            }
        };

        chatHub.onIncomingCall(onIncomingCall);
        chatHub.onCallAnswered(onCallAnswered);
        chatHub.onCallRejected(onCallRejected);
        chatHub.onCallEnded(onCallEnded);
        chatHub.onReceiveIceCandidate(onReceiveIceCandidate);

        return () => {
            chatHub.offIncomingCall(onIncomingCall);
            chatHub.offCallAnswered(onCallAnswered);
            chatHub.offCallRejected(onCallRejected);
            chatHub.offCallEnded(onCallEnded);
            chatHub.offReceiveIceCandidate(onReceiveIceCandidate);
        };
    }, [currentUserId, callState, cleanup]);
    return {
        hasWebRTC,
        callState,
        incomingCall,
        localStream,
        remoteStream,
        callTargetName,
        callTargetAvatar,
        isMuted,
        isRemoteTalking,
        toggleMute,
        startCall,
        answerCall,
        rejectCall,
        endCall
    };
}
