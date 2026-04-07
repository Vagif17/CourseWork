import "./../../styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import ChatSection from "./components/ChatSection";
import {useEffect} from "react";
import {initAuth} from "../../utils/initAuthUtil.ts";
import {authService} from "../../services/authService.ts";


function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        initAuth();
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigate("/auth");
    };

    return (
        <div className="homepage fade-in">
            <div className="sidebar">
                <div className="sidebar-icons">
                    <div className="sidebar-icon">💬</div>
                    <div className="sidebar-icon">⚙️</div>
                    <div className="sidebar-icon">👤</div>
                    <div className="sidebar-icon">📢</div>
                </div>

                <div className="sidebar-logout" onClick={handleLogout}>
                    Log out
                </div>
            </div>

            <ChatSection />

        </div>
    );
}

export default HomePage;