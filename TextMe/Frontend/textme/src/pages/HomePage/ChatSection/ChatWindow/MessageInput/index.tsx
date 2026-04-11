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
            <div className="input-container">
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
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                />
                <div className="recording-wrapper">
                    {recording && <div className="progress-bar-wrapper"><div className="progress-bar" style={{ width: `${recordTime * 10}px` }} /></div>}
                    <button
                        className={recording ? "record-btn recording" : "record-btn"}
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={() => recording && stopRecording()}
                    >
                        🎤
                    </button>
                </div>
                <button className="send-btn" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}