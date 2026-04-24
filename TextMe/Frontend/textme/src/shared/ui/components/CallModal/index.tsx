import { useEffect, useRef } from "react";
import "./CallModal.css";
import { useWebRTC } from "../../../lib/hooks/useWebRTC";

type Props = {
    webrtc: ReturnType<typeof useWebRTC>;
};

export default function CallModal({ webrtc }: Props) {
    const {
        callState,
        incomingCall,
        localStream,
        remoteStream,
        callTargetName,
        callTargetAvatar,
        isMuted,
        isRemoteTalking,
        toggleMute,
        answerCall,
        rejectCall,
        endCall
    } = webrtc;

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    if (callState === "idle") return null;

    return (
        <div className="call-modal-overlay">
            <div className={`call-modal-container ${callState === "connected" ? "connected" : ""}`}>

                {callState === "ringing" && incomingCall && (
                    <div className="call-incoming-view">
                        <div className="call-avatar-pulse">
                            <div className="pulse-ring"></div>
                            <div className="call-avatar-placeholder">👤</div>
                        </div>
                        <h3>Incoming {incomingCall.withVideo ? "Video" : "Audio"} Call...</h3>
                        <div className="call-actions">
                            <button className="call-btn answer-btn" onClick={() => answerCall(incomingCall.withVideo)}>
                                {incomingCall.withVideo ? "📹 Answer Video" : "📞 Answer Audio"}
                            </button>
                            <button className="call-btn reject-btn" onClick={rejectCall}>❌ Reject</button>
                        </div>
                    </div>
                )}

                {callState === "calling" && (
                    <div className="call-outgoing-view">
                        <div className="call-avatar-pulse">
                            <div className="pulse-ring outbound"></div>
                            <div className="call-avatar-placeholder">👤</div>
                        </div>
                        <h3>Calling {callTargetName}...</h3>
                        <button className="call-btn reject-btn" onClick={endCall}>❌ Cancel</button>

                        {localStream && (
                            <div className="preview-video-container">
                                <video ref={localVideoRef} autoPlay playsInline muted className="preview-video" />
                            </div>
                        )}
                    </div>
                )}

                {callState === "connected" && (
                    <div className="call-connected-view">
                        {!incomingCall?.withVideo && !callTargetAvatar?.includes("video") && (
                            <div className="audio-call-connected">
                                <video ref={remoteVideoRef} autoPlay playsInline style={{ display: "none" }} />
                                <div className={`connected-avatar-wrapper ${isRemoteTalking ? "is-talking" : ""}`}>
                                    <img src={callTargetAvatar || "/default-avatar.png"} alt="" className="connected-avatar" />
                                    <div className="glow-ring"></div>
                                </div>
                                <div className="connected-info">
                                    <h2>{callTargetName}</h2>
                                    <p>{isRemoteTalking ? "Talking..." : "Connected"}</p>
                                </div>
                            </div>
                        )}

                        {(incomingCall?.withVideo || callTargetAvatar?.includes("video")) && (
                            <div className="remote-video-container">
                                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                                {!remoteStream && <div className="video-placeholder">Connecting...</div>}
                            </div>
                        )}

                        {(incomingCall?.withVideo || callTargetAvatar?.includes("video")) && (
                            <div className="local-video-container">
                                <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
                            </div>
                        )}

                        <div className="call-controls">
                            <button className={`call-btn ${isMuted ? "muted" : "unmuted"}`} onClick={toggleMute}>
                                {isMuted ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                )}
                            </button>
                            <button className="call-btn reject-btn" onClick={endCall}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                                    <line x1="23" y1="1" x2="1" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
