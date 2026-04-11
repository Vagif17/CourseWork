import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppSettings } from "../../../context/AppSettingsContext";
import { profileService } from "../../../services/profileService";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import SettingsToggle from "./SettingsToggle";
import "./SettingsSection.css";

export default function SettingsSection() {
    const { theme, setTheme, typingSoundEnabled, setTypingSoundEnabled, messageDensity, setMessageDensity } =
        useAppSettings();

    const [shareOnlineStatus, setShareOnlineStatus] = useState(true);
    const [privacyLoaded, setPrivacyLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const me = await profileService.getMe();
                if (!cancelled) {
                    setShareOnlineStatus(me.shareOnlineStatus !== false);
                    setPrivacyLoaded(true);
                }
            } catch (e) {
                if (!cancelled) {
                    setPrivacyLoaded(true);
                    toast.error(getErrorMessage(e, "Could not load privacy settings"));
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const togglePrivacy = useCallback(async () => {
        const next = !shareOnlineStatus;
        setShareOnlineStatus(next);
        try {
            const me = await profileService.updatePrivacy({ shareOnlineStatus: next });
            setShareOnlineStatus(me.shareOnlineStatus !== false);
        } catch (e) {
            setShareOnlineStatus(!next);
            toast.error(getErrorMessage(e, "Could not update privacy"));
        }
    }, [shareOnlineStatus]);

    return (
        <div className="settings-section">
            <div className="settings-inner">
                <h1>Settings</h1>
                <p className="settings-subtitle">Appearance, chat behaviour, and privacy</p>

                <section className="settings-card">
                    <h2>Appearance</h2>
                    <div className="settings-row">
                        <div>
                            <span>Theme</span>
                            <div className="settings-hint">Light or dark, consistent with the messenger look</div>
                        </div>
                        <div className="settings-segment">
                            <button
                                type="button"
                                className={`settings-chip ${theme === "dark" ? "active" : ""}`}
                                onClick={() => setTheme("dark")}
                            >
                                Dark
                            </button>
                            <button
                                type="button"
                                className={`settings-chip ${theme === "light" ? "active" : ""}`}
                                onClick={() => setTheme("light")}
                            >
                                Light
                            </button>
                        </div>
                    </div>
                    <div className="settings-row">
                        <div>
                            <span>Message list density</span>
                            <div className="settings-hint">Compact fits more messages on screen</div>
                        </div>
                        <div className="settings-segment">
                            <button
                                type="button"
                                className={`settings-chip ${messageDensity === "comfortable" ? "active" : ""}`}
                                onClick={() => setMessageDensity("comfortable")}
                            >
                                Comfortable
                            </button>
                            <button
                                type="button"
                                className={`settings-chip ${messageDensity === "compact" ? "active" : ""}`}
                                onClick={() => setMessageDensity("compact")}
                            >
                                Compact
                            </button>
                        </div>
                    </div>
                </section>

                <section className="settings-card">
                    <h2>Privacy</h2>
                    {privacyLoaded && (
                        <SettingsToggle
                            on={shareOnlineStatus}
                            onToggle={togglePrivacy}
                            label="Show online status to contacts"
                            hint="When off, others will not see whether you are online or when you were last seen."
                        />
                    )}
                </section>

                <section className="settings-card">
                    <h2>Sound</h2>
                    <SettingsToggle
                        on={typingSoundEnabled}
                        onToggle={() => setTypingSoundEnabled(!typingSoundEnabled)}
                        label="Typing sound"
                        hint="Short click on each change in the message field"
                    />
                </section>

                <section className="settings-card">
                    <h2>About</h2>
                    <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
                        Theme and density are stored in this browser. Online visibility is saved on your account.
                    </p>
                </section>
            </div>
        </div>
    );
}
