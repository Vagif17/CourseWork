import "./MessageInput.css";
import type {RefObject} from "react";

type Props = {
    text: string;
    setText: (text: string) => void;
    handleSend: () => void;
    fileRef: RefObject<HTMLInputElement | null>;
    handleFileChange: () => void;
    recording: boolean;
    recordTime: number;
    startRecording: () => void;
    stopRecording: () => void;
    typingAudioRef: RefObject<HTMLAudioElement>;
    typingSoundEnabled: boolean;
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
                                         recordTime,
                                         startRecording,
                                         stopRecording,
                                         typingAudioRef,
                                         typingSoundEnabled
                                     }: Props) {
    return (
        <div className="input-wrapper">
            <div className={`input-container ${recording ? "recording-active" : ""}`}>
                {!recording && (
                    <>
                        <button className="attach-btn" onClick={() => fileRef.current?.click()}>+</button>
                        <input ref={fileRef} type="file" multiple hidden onChange={handleFileChange} />
                        <input
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
                            onKeyDown={e => e.key === "Enter" && text.trim() && handleSend()}
                        />
                    </>
                )}
                {recording && (
                    <div className="recording-status">
                        <div className="recording-indicator" />
                        <span className="recording-timer">{formatTime(recordTime)}</span>
                        <span className="recording-hint">Release to send</span>
                    </div>
                )}
                <div className="recording-wrapper">
                    <button
                        className={`action-btn ${recording ? "record-btn recording" : (text.trim() ? "send-btn-active" : "record-btn")}`}
                        onMouseDown={text.trim() ? handleSend : startRecording}
                        onMouseUp={text.trim() ? undefined : stopRecording}
                        onMouseLeave={text.trim() ? undefined : () => recording && stopRecording()}
                    >
                        {text.trim() ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}