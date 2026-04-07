import "./../../styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import ChatSection from "./components/ChatSection";
import {useEffect, useState} from "react";
import {initAuth} from "../../utils/initAuthUtil.ts";
import {authService} from "../../services/authService.ts";


function HomePage() {
    const navigate = useNavigate();

    const [authInitialized, setAuthInitialized] = useState(false);

    useEffect(() => { // Чтобы при обновлении страницы если jwt просрочен не выкидывало 
        const init = async () => {
            await initAuth();
            setAuthInitialized(true);
        };
        init();
    }, []);

    if (!authInitialized) return <div>Loading...</div>;

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