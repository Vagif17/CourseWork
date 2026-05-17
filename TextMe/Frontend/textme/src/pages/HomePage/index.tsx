import "../../app/styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import ChatSection from "../../widgets/chat-section";
import ProfileSection from "../../widgets/ProfileSection";
import SettingsSection from "../../widgets/SettingsSection";
import NewsFeedSection from "../../widgets/NewsFeedSection";
import SidebarNav from "../../widgets/SidebarNav";
import MapSection from "../../widgets/MapSection";
import { useEffect, useState } from "react";
import { initAuth } from "../../shared/lib/utils/initAuthUtil.ts";
import { authService } from "../../shared/api/services/authService.ts";
import AuthLoader from "../../shared/ui/AuthLoader";
import { AppSettingsProvider } from "../../shared/lib/context/AppSettingsContext";
import { UserLocationProvider, useUserLocation } from "../../shared/lib/context/UserLocationContext";
import type { TabId } from "../../shared/api/types/tabs";
import { useNotifications } from "../../shared/lib/hooks/useNotifications";
import { useWebRTC } from "../../shared/lib/hooks/useWebRTC";
import CallModal from "../../shared/ui/components/CallModal";
import { getUserId } from "../../shared/lib/utils/getUserIdUtil";
import chatHub from "../../shared/api/hubs/chatHub";

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
            if (getUserId()) {
                chatHub.start().catch(err => console.error("ChatHub start failed", err));
            }
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
            <UserLocationProvider>
                <HomePageContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedChatId={selectedChatId}
                    setSelectedChatId={setSelectedChatId}
                    webrtc={webrtc}
                    handleLogout={handleLogout}
                />
            </UserLocationProvider>
        </AppSettingsProvider>
    );
}

function HomePageContent({ activeTab, setActiveTab, selectedChatId, setSelectedChatId, webrtc }: any) {
    const { position, locationError } = useUserLocation();

    return (
        <div className={`homepage fade-in ${selectedChatId !== null && activeTab === 'chats' ? 'is-chat-active' : ''}`}>
            <div className="sidebar">
                <SidebarNav activeTab={activeTab} onSelect={setActiveTab} isChatOpen={selectedChatId !== null && activeTab === 'chats'} />
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
                {activeTab === "location" && (
                    <MapSection
                        onSendMessage={(chatId) => {
                            setSelectedChatId(chatId);
                            setActiveTab("chats");
                        }}
                        position={position}
                        error={locationError}
                    />
                )}
            </div>
            <CallModal webrtc={webrtc} />
        </div>
    );
}

export default HomePage;
