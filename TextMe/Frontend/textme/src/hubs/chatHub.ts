import * as signalR from "@microsoft/signalr"
import { tokenService } from "../services/tokenService"

class ChatHub {
    private connection: signalR.HubConnection | null = null

    async start() {
        if (this.connection) return
//https://coursework-1-1mjp.onrender.com
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5243/hubs/chat", {
                accessTokenFactory: async () => {
                    return (await tokenService.getValidToken()) || ""
                },
            })
            .withAutomaticReconnect()
            .build()

        this.connection.onreconnected(() => console.log("SignalR Reconnected"))
        this.connection.onclose(() => console.log("SignalR Disconnected"))

        await this.connection.start()
        console.log("SignalR Connected")
    }

    async joinChat(chatId: number) {
        await this.connection?.invoke("JoinChat", chatId)
    }

    async leaveChat(chatId: number) {
        await this.connection?.invoke("LeaveChat", chatId)
    }

    async sendMessage(chatId: number, text?: string, mediaUrl?: string, mediaType?: string) {
        await this.connection?.invoke("SendMessage", chatId, text, mediaUrl, mediaType)
    }

    onReceiveMessage(callback: (message: any) => void) {
        this.connection?.on("ReceiveMessage", callback)
    }

    offReceiveMessage(callback: (message: any) => void) {
        this.connection?.off("ReceiveMessage", callback)
    }
}

export default new ChatHub()