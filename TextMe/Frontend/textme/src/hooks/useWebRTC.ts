import { useState, useRef, useEffect } from "react";
import chatHub from "../hubs/chatHub";
import { toast } from "react-toastify";

export type CallState = "idle" | "calling" | "ringing" | "connected";

export function useWebRTC(currentUserId: string | null) {
    const [callState, setCallState] = useState<CallState>("idle");
    const [callTargetId, setCallTargetId] = useState<string | null>(null);
    const [callTargetName, setCallTargetName] = useState<string>("User");
    const [callTargetAvatar, setCallTargetAvatar] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<{ callerId: string, offer: any, withVideo: boolean, avatarUrl?: string } | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isRemoteTalking, setIsRemoteTalking] = useState(false);

    const pc = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
    const ringtoneRef = useRef<HTMLAudioElement>(new Audio("/sounds/ringtone.mp3"));
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    };

    // Handle ringtone
    useEffect(() => {
        const ringtone = ringtoneRef.current;
        ringtone.loop = true;
        
        if (callState === "ringing") {
            ringtone.play().catch(e => console.warn("Ringtone play failed", e));
        } else {
            ringtone.pause();
            ringtone.currentTime = 0;
        }
    }, [callState]);

    // Handle Voice Activity Detection (VAD)
    useEffect(() => {
        if (remoteStream && callState === "connected") {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(remoteStream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyserRef.current = analyser;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const checkVolume = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setIsRemoteTalking(average > 15); // Threshold for talking
                    animationFrameRef.current = requestAnimationFrame(checkVolume);
                };
                checkVolume();

                return () => {
                    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                    if (audioContext.state !== "closed") audioContext.close();
                    analyserRef.current = null;
                };
            } catch (err) {
                console.warn("VAD init failed", err);
            }
        } else {
            setIsRemoteTalking(false);
        }
    }, [remoteStream, callState]);

    const cleanup = () => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
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
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const createPeerConnection = (targetUserId: string, stream: MediaStream) => {
        const peer = new RTCPeerConnection(iceServers);
        
        peer.onicecandidate = async (e) => {
            if (e.candidate) {
                await (chatHub as any).connection?.invoke("SendIceCandidate", targetUserId, e.candidate);
            }
        };

        peer.onconnectionstatechange = () => {
            console.log("WebRTC Connection State:", peer.connectionState);
            if (peer.connectionState === "failed") {
                toast.error("Call connection failed.");
                cleanup();
            }
        };

        peer.ontrack = (e) => {
            console.log("Received remote track", e.streams[0]);
            setRemoteStream(e.streams[0]);
        };

        if (stream) {
            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });
        }

        pc.current = peer;
        return peer;
    };

    const startCall = async (targetUserId: string, targetUserName: string, withVideo: boolean = true, targetAvatar?: string, callerAvatar?: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true });
            setLocalStream(stream);
            setCallTargetId(targetUserId);
            setCallTargetName(targetUserName);
            setCallTargetAvatar(targetAvatar || null);
            setCallState("calling");

            const peer = createPeerConnection(targetUserId, stream);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            await (chatHub as any).connection?.invoke("CallUser", targetUserId, offer, withVideo, callerAvatar || null);
        } catch (err) {
            console.error("Failed to start call", err);
            toast.error("Could not access camera/microphone.");
            cleanup();
        }
    };

    const answerCall = async (withVideo: boolean = true) => {
        if (!incomingCall) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true });
            setLocalStream(stream);
            setCallTargetId(incomingCall.callerId);
            setCallTargetAvatar(incomingCall.avatarUrl || null);
            setCallState("connected");

            const peer = createPeerConnection(incomingCall.callerId, stream);
            const offerConfig = incomingCall.offer;
            
            await peer.setRemoteDescription(new RTCSessionDescription(offerConfig));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            pendingCandidates.current.forEach(c => pc.current?.addIceCandidate(new RTCIceCandidate(c)));
            pendingCandidates.current = [];

            await (chatHub as any).connection?.invoke("AnswerCall", incomingCall.callerId, answer);
            setIncomingCall(null);
        } catch (err) {
            console.error("Failed to answer", err);
            toast.error("Could not access camera/microphone for answering.");
            await (chatHub as any).connection?.invoke("RejectCall", incomingCall.callerId);
            cleanup();
        }
    };

    const rejectCall = async () => {
        if (!incomingCall) return;
        await (chatHub as any).connection?.invoke("RejectCall", incomingCall.callerId);
        cleanup();
    };

    const endCall = async () => {
        if (callTargetId) {
            await (chatHub as any).connection?.invoke("EndCall", callTargetId);
        }
        cleanup();
    };

    useEffect(() => {
        if (!currentUserId || !chatHub.isConnected()) return;

        const conn = (chatHub as any).connection;
        if (!conn) return;

        const onIncomingCall = (payload: any) => {
            if (callState !== "idle") {
                conn.invoke("RejectCall", payload.callerId);
                return;
            }
            setIncomingCall({ 
                callerId: payload.callerId, 
                offer: payload.offer, 
                withVideo: payload.withVideo,
                avatarUrl: payload.avatarUrl 
            });
            setCallTargetName("Incoming Call"); // Optional title
            setCallState("ringing");
        };

        const onCallAnswered = async (payload: any) => {
            if (pc.current && callState === "calling") {
                const answer = payload.answer;
                await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
                
                for (const candidate of pendingCandidates.current) {
                    await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidates.current = [];
                setCallState("connected");
            }
        };

        const onCallRejected = () => {
            toast.info("Call was rejected");
            cleanup();
        };

        const onCallEnded = () => {
            toast.info("Call ended");
            cleanup();
        };

        const onReceiveIceCandidate = async (payload: any) => {
            const candidate = payload.candidate;
            if (pc.current && pc.current.remoteDescription) {
                await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                pendingCandidates.current.push(candidate);
            }
        };

        conn.on("IncomingCall", onIncomingCall);
        conn.on("CallAnswered", onCallAnswered);
        conn.on("CallRejected", onCallRejected);
        conn.on("CallEnded", onCallEnded);
        conn.on("ReceiveIceCandidate", onReceiveIceCandidate);

        return () => {
            conn.off("IncomingCall", onIncomingCall);
            conn.off("CallAnswered", onCallAnswered);
            conn.off("CallRejected", onCallRejected);
            conn.off("CallEnded", onCallEnded);
            conn.off("ReceiveIceCandidate", onReceiveIceCandidate);
        };
    }, [currentUserId, callState]);

    return {
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
