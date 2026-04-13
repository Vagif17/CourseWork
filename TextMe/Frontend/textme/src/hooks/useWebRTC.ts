import { useState, useRef, useEffect } from "react";
import chatHub from "../hubs/chatHub";
import { toast } from "react-toastify";

export type CallState = "idle" | "calling" | "ringing" | "connected";

export function useWebRTC(currentUserId: string | null) {
    const [callState, setCallState] = useState<CallState>("idle");
    const [callTargetId, setCallTargetId] = useState<string | null>(null);
    const [callTargetName, setCallTargetName] = useState<string>("User");
    const [incomingCall, setIncomingCall] = useState<{ callerId: string, offer: any } | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const pc = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    };

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
        setIncomingCall(null);
        pendingCandidates.current = [];
    };

    const createPeerConnection = (targetUserId: string) => {
        const peer = new RTCPeerConnection(iceServers);
        
        peer.onicecandidate = async (e) => {
            if (e.candidate) {
                await (chatHub as any).connection?.invoke("SendIceCandidate", targetUserId, JSON.stringify(e.candidate));
            }
        };

        peer.ontrack = (e) => {
            setRemoteStream(e.streams[0]);
        };

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peer.addTrack(track, localStream);
            });
        }

        pc.current = peer;
        return peer;
    };

    const startCall = async (targetUserId: string, targetUserName: string, withVideo: boolean = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true });
            setLocalStream(stream);
            setCallTargetId(targetUserId);
            setCallTargetName(targetUserName);
            setCallState("calling");

            const peer = createPeerConnection(targetUserId);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            await (chatHub as any).connection?.invoke("CallUser", targetUserId, JSON.stringify(offer));
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
            setCallState("connected");

            const peer = createPeerConnection(incomingCall.callerId);
            const offerConfig = JSON.parse(incomingCall.offer);
            
            await peer.setRemoteDescription(new RTCSessionDescription(offerConfig));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            pendingCandidates.current.forEach(c => peer.addIceCandidate(new RTCIceCandidate(c)));
            pendingCandidates.current = [];

            await (chatHub as any).connection?.invoke("AnswerCall", incomingCall.callerId, JSON.stringify(answer));
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
            setIncomingCall({ callerId: payload.callerId, offer: payload.offer });
            setCallState("ringing");
        };

        const onCallAnswered = async (payload: any) => {
            if (pc.current && callState === "calling") {
                const answer = JSON.parse(payload.answer);
                await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
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
            const candidate = JSON.parse(payload.candidate);
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
        startCall,
        answerCall,
        rejectCall,
        endCall
    };
}
