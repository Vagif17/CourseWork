import "../../app/styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import ChatSection from "../../widgets/chat-section";
import ProfileSection from "../../widgets/ProfileSection";
import SettingsSection from "../../widgets/SettingsSection";
import NewsFeedSection from "../../widgets/NewsFeedSection";
import SidebarNav from "../../widgets/SidebarNav";
import { useEffect, useState } from "react";
import { initAuth } from "../../shared/lib/utils/initAuthUtil.ts";
import { authService } from "../../shared/api/services/authService.ts";
import AuthLoader from "../../shared/ui/AuthLoader";
import { AppSettingsProvider } from "../../shared/lib/context/AppSettingsContext";
import type { TabId } from "../../shared/api/types/tabs";
import { useNotifications } from "../../shared/lib/hooks/useNotifications";
import { useWebRTC } from "../../shared/lib/hooks/useWebRTC";
import CallModal from "../../shared/ui/components/CallModal";
import { getUserId } from "../../shared/lib/utils/getUserIdUtil";

function HomePage() {
    const navigate = useNavigate();
    const [authInitialized, setAuthInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>("chats");
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    const currentUserId = getUserId();
    const webrtc = useWebRTC(currentUserId);
    useNotifications(selectedChatId, activeTab);

    useEffect(() => {
        const init = async () => {
            await initAuth();
            setAuthInitialized(true);
        };
        init();
    }, []);

    if (!authInitialized) return <AuthLoader />;

    const handleLogout = async () => {
        await authService.logout();
        navigate("/auth");
    };

    return (
        <AppSettingsProvider>
            <div className="homepage fade-in">
                <div className="sidebar">
                    <SidebarNav activeTab={activeTab} onSelect={setActiveTab} />

                    <div className="sidebar-logout" onClick={handleLogout}>
                        Log out
                    </div>
                </div>

                <div className="main-content" key={activeTab}>
                    {activeTab === "chats" && (
                        <ChatSection 
                            selectedChatId={selectedChatId} 
                            setSelectedChatId={setSelectedChatId} 
                            webrtc={webrtc}
                        />
                    )}
                    {activeTab === "settings" && <SettingsSection />}
                    {activeTab === "profile" && <ProfileSection />}
                    {activeTab === "news" && <NewsFeedSection />}
                </div>
                <CallModal webrtc={webrtc} />
            </div>
        </AppSettingsProvider>
    );
}

export default HomePage;
