import "./../../styles/Global.css";
import "./HomePage.css";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store";
import ChatSection from "./components/ChatSection";
import {initAuth} from "../../utils/initAuthUtil.ts";
import {useEffect} from "react";


function HomePage() {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        initAuth();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
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