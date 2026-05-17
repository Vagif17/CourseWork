import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../shared/api/services/API";
import AudioPlayer from "../../../entities/message/ui/MessageItem/AudioPlayer";
import "./ChatInfoSidebar.css";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    messages: any[];
    messages: any[];
    onSelectImage: (url: string) => void;
};

export default function ChatInfoSidebar({ isOpen, onClose, messages, onSelectImage }: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"media" | "files" | "voice">("media");

    if (!isOpen) return null;

    const mediaMessages = messages.filter(m => !m.isDeleted && m.mediaUrl && (m.mediaType?.startsWith("image") || m.mediaType?.startsWith("video")));
    const fileMessages = messages.filter(m => !m.isDeleted && m.mediaUrl && !m.mediaType?.startsWith("image") && !m.mediaType?.startsWith("video") && !m.mediaType?.startsWith("audio") && m.mediaType !== "location" && m.mediaType !== "geodrop" && m.mediaType !== "canvas");
    const voiceMessages = messages.filter(m => !m.isDeleted && m.mediaUrl && m.mediaType?.startsWith("audio"));

    return (
        <div className="chat-info-sidebar fade-in">
            <header className="chat-info-header">
                <h2>{t("chat.chatInfo")}</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </header>


            <div className="chat-info-tabs">
                <button className={activeTab === "media" ? "active" : ""} onClick={() => setActiveTab("media")}>{t("chat.media")}</button>
                <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>{t("chat.files")}</button>
                <button className={activeTab === "voice" ? "active" : ""} onClick={() => setActiveTab("voice")}>{t("chat.voice")}</button>
            </div>

            <div className="chat-info-content">
                {activeTab === "media" && (
                    <div className="media-grid">
                        {mediaMessages.map(m => (
                            <div key={m.id} className="media-item" onClick={() => onSelectImage(m.mediaUrl)}>
                                {m.mediaType?.startsWith("image") ? (
                                    <img src={m.mediaUrl} alt="media" />
                                ) : (
                                    <div className="video-preview-container">
                                        <video src={m.mediaUrl} />
                                        <div className="play-overlay">▶</div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {mediaMessages.length === 0 && <p className="empty-state">{t("chat.empty")}</p>}
                    </div>
                )}
                {activeTab === "files" && (
                    <div className="files-list">
                        {fileMessages.map(m => (
                            <a key={m.id} href={m.mediaUrl} target="_blank" rel="noreferrer" className="file-item">
                                📄 {m.mediaUrl.split('/').pop() || "Document"}
                            </a>
                        ))}
                        {fileMessages.length === 0 && <p className="empty-state">{t("chat.empty")}</p>}
                    </div>
                )}
                {activeTab === "voice" && (
                    <div className="voice-list">
                        {voiceMessages.map(m => (
                            <div key={m.id} className="voice-item-sidebar">
                                <div className="voice-date">{new Date(m.createdAt).toLocaleDateString()}</div>
                                <AudioPlayer src={m.mediaUrl} />
                            </div>
                        ))}
                        {voiceMessages.length === 0 && <p className="empty-state">{t("chat.empty")}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
