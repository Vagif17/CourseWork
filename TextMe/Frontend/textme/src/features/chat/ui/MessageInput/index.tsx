import "./MessageInput.css";
import { useState, useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import LocationPickerModal from "./LocationPickerModal";

type Props = {
    text: string;
    setText: (text: string) => void;
    handleSend: () => void;
    fileRef: RefObject<HTMLInputElement | null>;
    handleFileChange: () => void;
    recording: boolean;
    recordingType: 'audio' | 'video';
    recordingLocked: boolean;
    recordTime: number;
    previewStream: MediaStream | null;
    startRecording: (type: 'audio' | 'video') => void;
    stopRecording: () => void;
    lockRecording: () => void;
    cancelRecording: () => void;
    typingAudioRef: RefObject<HTMLAudioElement>;
    typingSoundEnabled: boolean;
    hasAttachments?: boolean;
    onSendGeoDrop?: (text: string, lat: number, lng: number) => void;
    onSendCanvasMessage?: () => void;
};

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function MessageInput({
    text,
    setText,
    handleSend,
    fileRef,
    handleFileChange,
    recording,
    recordingType,
    recordingLocked,
    recordTime,
    previewStream,
    startRecording,
    stopRecording,
    lockRecording,
    cancelRecording,
    typingAudioRef,
    typingSoundEnabled,
    hasAttachments = false,
    onSendGeoDrop,
    onSendCanvasMessage
}: Props) {
    const isReadyToSend = text.trim() || hasAttachments;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [activeMode, setActiveMode] = useState<'audio' | 'video'>('audio');
    const [swipeDistance, setSwipeDistance] = useState({ x: 0, y: 0 });
    const [isCancelling, setIsCancelling] = useState(false);
    
    const pickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoPreviewRef.current && previewStream && recordingType === 'video') {
            videoPreviewRef.current.srcObject = previewStream;
        }
    }, [previewStream, recordingType]);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiObject: { emoji: string }) => {
        setText(text + emojiObject.emoji);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleGeoDrop = () => {
        if (!text.trim()) {
            alert("Please type a message first to leave as a GeoDrop.");
            return;
        }
        setShowLocationPicker(true);
    };

    // Gesture Handlers
    const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (isReadyToSend) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
        
        // Start recording immediately
        startRecording(activeMode);
        setSwipeDistance({ x: 0, y: 0 });
    };

    const handlePressMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!recording || recordingLocked || !touchStartRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const dx = touchStartRef.current.x - clientX;
        const dy = touchStartRef.current.y - clientY;

        setSwipeDistance({ x: dx, y: dy });

        // Cancel threshold (swipe left/right)
        if (dx > 100) {
            setIsCancelling(true);
        } else {
            setIsCancelling(false);
        }

        // Lock threshold (swipe up)
        if (dy > 80) {
            lockRecording();
            setSwipeDistance({ x: 0, y: 0 });
        }
    }, [recording, recordingLocked, lockRecording]);

    const handlePressEnd = useCallback(() => {
        if (!touchStartRef.current) return;
        
        const duration = Date.now() - touchStartRef.current.time;
        touchStartRef.current = null;

        if (!recording) {
            // Short tap -> Switch Mode
            if (duration < 250) {
                setActiveMode(prev => prev === 'audio' ? 'video' : 'audio');
                cancelRecording(); // Stop the immediate recording that started on start
            }
            return;
        }

        if (recordingLocked) return;

        if (isCancelling) {
            cancelRecording();
            setIsCancelling(false);
        } else {
            stopRecording();
        }
        setSwipeDistance({ x: 0, y: 0 });
    }, [recording, recordingLocked, isCancelling, stopRecording, cancelRecording]);

    useEffect(() => {
        if (recording && !recordingLocked) {
            window.addEventListener('mousemove', handlePressMove);
            window.addEventListener('mouseup', handlePressEnd);
            window.addEventListener('touchmove', handlePressMove);
            window.addEventListener('touchend', handlePressEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handlePressMove);
            window.removeEventListener('mouseup', handlePressEnd);
            window.removeEventListener('touchmove', handlePressMove);
            window.removeEventListener('touchend', handlePressEnd);
        };
    }, [recording, recordingLocked, handlePressMove, handlePressEnd]);

    return (
        <div className="input-wrapper">
            {recording && recordingType === 'video' && (
                <div className="video-note-preview-wrapper">
                    <div className="video-note-circle">
                        <video ref={videoPreviewRef} autoPlay muted playsInline />
                    </div>
                </div>
            )}

            <div className={`input-container ${recording ? "recording-active" : ""}`}>
                {!recording && (
                    <>
                        <button className="attach-btn" onClick={() => fileRef.current?.click()} title="Attach file">+</button>
                        <button className="attach-btn geodrop-btn" onClick={handleGeoDrop} title="Leave GeoDrop here">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </button>
                        <button className="attach-btn canvas-btn" onClick={onSendCanvasMessage} title="Send Live Canvas">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12Z"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            </svg>
                        </button>
                        <input ref={fileRef} type="file" hidden multiple onChange={handleFileChange} />
                        
                        <div ref={pickerRef} style={{ position: 'relative' }}>
                            <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add emoji" type="button">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                            </button>
                            {showEmojiPicker && (
                                <div className="emoji-picker-container">
                                    <EmojiPicker 
                                        onEmojiClick={onEmojiClick} 
                                        theme={document.documentElement.getAttribute('data-theme') === 'light' ? Theme.LIGHT : Theme.DARK}
                                        lazyLoadEmojis={true}
                                        width={280}
                                        height={320}
                                        previewConfig={{ showPreview: false }}
                                        skinTonesDisabled={true}
                                        searchPlaceholder="Search emoji..."
                                        emojiStyle={EmojiStyle.APPLE}
                                    />
                                </div>
                            )}
                        </div>

                        <input
                            ref={inputRef}
                            className="message-input"
                            type="text"
                            placeholder="Type a message..."
                            value={text}
                            onChange={e => {
                                setText(e.target.value);
                                if (typingSoundEnabled && typingAudioRef.current) {
                                    typingAudioRef.current.currentTime = 0;
                                    typingAudioRef.current.play().catch(() => {});
                                }
                            }}
                            onKeyDown={e => e.key === "Enter" && isReadyToSend && handleSend()}
                        />
                    </>
                )}
                {recording && (
                    <div className="recording-status">
                        <div className="recording-indicator" />
                        <span className="recording-timer">{formatTime(recordTime)}</span>
                        {!recordingLocked && (
                            <span className={`recording-hint ${isCancelling ? 'cancelling' : ''}`} style={{ transform: `translateX(${-swipeDistance.x}px)` }}>
                                {isCancelling ? 'Release to cancel' : '< Swipe to cancel'}
                            </span>
                        )}
                        {recordingLocked && (
                            <div className="recording-locked-actions">
                                <button className="record-action-btn delete" onClick={cancelRecording}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                                <button className="record-action-btn send" onClick={stopRecording}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <div className="recording-wrapper">
                    {!recordingLocked && (
                        <div className="recording-lock-hint" style={{ opacity: recording && !recordingLocked ? 1 : 0, transform: `translateY(${-swipeDistance.y}px)` }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V7a6 6 0 0 0-12 0v4"></path><rect x="5" y="11" width="14" height="11" rx="2" ry="2"></rect></svg>
                            <span className="lock-arrow">↑</span>
                        </div>
                    )}
                    <button
                        className={`action-btn ${recording ? "record-btn recording" : (isReadyToSend ? "send-btn-active" : "record-btn")}`}
                        onMouseDown={handlePressStart}
                        onTouchStart={handlePressStart}
                        onClick={isReadyToSend ? handleSend : undefined}
                        style={{ transform: recording && !recordingLocked ? `translate(-${swipeDistance.x}px, -${swipeDistance.y}px)` : 'none' }}
                    >
                        {isReadyToSend ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        ) : activeMode === 'audio' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {showLocationPicker && onSendGeoDrop && (
                <LocationPickerModal
                    onClose={() => setShowLocationPicker(false)}
                    onSelect={(lat, lng) => {
                        onSendGeoDrop(text, lat, lng);
                        setText("");
                        setShowLocationPicker(false);
                    }}
                />
            )}
        </div>
    );
}