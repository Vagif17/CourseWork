import { api } from "../services/API.ts"

export const messageService = {

    async getMessages(chatId: number) {

        const response = await api.get(`/Message/${chatId}`)

        return response.data
    }

}