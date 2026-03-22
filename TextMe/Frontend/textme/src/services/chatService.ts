import type { PrivateChatDTOResponse } from "../types/chats";
import { API_URL } from "./API.ts";

export const chatService = {

    getAllPrivateChats: async (): Promise<PrivateChatDTOResponse[]> => {

        const response = await API_URL.get<PrivateChatDTOResponse[]>(
            "/Chat/getallmyprivatechats"
        );

        return response.data;
    },

};