import "./../../styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import ChatSection from "./ChatSection";
import ProfileSection from "./ProfileSection";
import SettingsSection from "./SettingsSection";
import NewsFeedSection from "./NewsFeedSection";
import SidebarNav from "./SidebarNav";
import { useEffect, useState } from "react";
import { initAuth } from "../../utils/initAuthUtil.ts";
import { authService } from "../../services/authService.ts";
import AuthLoader from "./AuthLoader";
import { AppSettingsProvider } from "../../context/AppSettingsContext";
import type { TabId } from "./homeTabs";

function HomePage() {
    const navigate = useNavigate();
    const [authInitialized, setAuthInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>("chats");

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
                    {activeTab === "chats" && <ChatSection />}
                    {activeTab === "settings" && <SettingsSection />}
                    {activeTab === "profile" && <ProfileSection />}
                    {activeTab === "news" && <NewsFeedSection />}
                </div>
            </div>
        </AppSettingsProvider>
    );
}

export default HomePage;
