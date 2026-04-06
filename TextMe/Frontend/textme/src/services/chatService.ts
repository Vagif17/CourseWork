import type { PrivateChatDTOResponse } from "../types/chats";
import { api } from "./API.ts";

export const chatService = {

    getAllPrivateChats: async (): Promise<PrivateChatDTOResponse[]> => {

        const response = await api.get<PrivateChatDTOResponse[]>(
            "/Chat/getallmyprivatechats"
        );

        return response.data;


    },

    createChat: async (emailOrNumber: string): Promise<PrivateChatDTOResponse> => {
        const response = await api.post<PrivateChatDTOResponse>("/Chat/createchat", null, {
            params: { emailOrNumber }
        });
        return response.data;
    }

};