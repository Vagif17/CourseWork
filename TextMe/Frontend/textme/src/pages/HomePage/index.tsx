import "./../../styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import ChatSection from "./ChatSection";
import { useEffect, useState } from "react";
import { initAuth } from "../../utils/initAuthUtil.ts";
import { authService } from "../../services/authService.ts";
import AuthLoader from "./AuthLoader";
import PlaceholderPage from "../../components/PlacerHolder";

type Tab = "chats" | "settings" | "profile" | "notifications";

function HomePage() {
    const navigate = useNavigate();
    const [authInitialized, setAuthInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("chats");

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
        <div className="homepage fade-in">
            <div className="sidebar">
                <div className="sidebar-icons">
                    <div
                        className={`sidebar-icon ${activeTab === "chats" ? "active" : ""}`}
                        onClick={() => setActiveTab("chats")}
                    >
                        💬
                    </div>

                    <div
                        className={`sidebar-icon ${activeTab === "settings" ? "active" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        ⚙️
                    </div>

                    <div
                        className={`sidebar-icon ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        👤
                    </div>

                    <div
                        className={`sidebar-icon ${activeTab === "notifications" ? "active" : ""}`}
                        onClick={() => setActiveTab("notifications")}
                    >
                        📢
                    </div>
                </div>

                <div className="sidebar-logout" onClick={handleLogout}>
                    Log out
                </div>
            </div>

            <div className="main-content">
                {activeTab === "chats" && <ChatSection />}
                {activeTab === "settings" && <PlaceholderPage/>}
                {activeTab === "profile" && <PlaceholderPage/>}
                {activeTab === "notifications" && <PlaceholderPage/>}
            </div>
        </div>
    );
}

export default HomePage;