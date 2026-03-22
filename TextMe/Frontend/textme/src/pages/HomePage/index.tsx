import "./../../styles/Global.css";
import "./HomePage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { PrivateChatDTOResponse } from "../../types/chats.ts";
import { chatService } from "../../services/chatService.ts";
import { getUserId } from "../../utils/auth.ts";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store";

function HomePage() {
    const [chats, setChats] = useState<PrivateChatDTOResponse[]>([]);
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const currentUserId = getUserId();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatService.getAllPrivateChats();
                setChats(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchChats();
    }, []);

    const handleLogout = () => {
        // Теперь логаут через Redux
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

            <div className="chat-list">
                {chats.map((chat) => {
                    const otherParticipant = chat.participants.find(
                        (p) => p.userId !== currentUserId
                    );
                    console.log("currentUserId:", currentUserId);
                    console.log(chat.participants);
                    return (
                        <div key={chat.id} className="chat-item">
                            <div className="participant">
                                <img
                                    src={otherParticipant?.avatarUrl || "/default-avatar.png"}
                                    alt={otherParticipant?.userName}
                                    className="avatar"
                                />
                                <span>{otherParticipant?.userName || "Unknown"}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="chat-window">
                <div className="messages">
                    <div className="message">Hello!</div>
                    <div className="message">Hi, how are you?</div>
                    <div className="message">I'm good, thanks!</div>
                </div>
                <div className="input-container">
                    <input type="text" placeholder="Type a message..." />
                    <button>Send</button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;