import axios from "axios";
import type { PrivateChatDTOResponse } from "../types/chats";

const API_URL = "http://localhost:5160/api/Chat";

export const chatService = {
    getAllPrivateChats: async (): Promise<PrivateChatDTOResponse[]> => {
        const token = localStorage.getItem("token");
        const response = await axios.get<PrivateChatDTOResponse[]>(
            `${API_URL}/getallmyprivatechats`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    },
};