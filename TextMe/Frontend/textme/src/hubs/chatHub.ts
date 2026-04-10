import * as signalR from "@microsoft/signalr"
import { tokenService } from "../services/tokenService"

class ChatHub {
    private connection: signalR.HubConnection | null = null;

    async start() {

        if (this.connection) {
            if (this.connection.state === signalR.HubConnectionState.Connected)
                return;

            await this.connection.start();
            return;
        }
//
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("https://coursework-1-1mjp.onrender.com/hubs/chat", {
                accessTokenFactory: async () => {
                    return (await tokenService.getValidToken()) || "";
                },
            })
            .withAutomaticReconnect()
            .build();

        this.connection.onreconnected(() => console.log("SignalR Reconnected"));
        this.connection.onclose(() => console.log("SignalR Disconnected"));

        await this.connection.start();
        console.log("SignalR Connected");
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    async joinChat(chatId: number) {

        if (!this.isConnected())
            await this.start();

        await this.connection?.invoke("JoinChat", chatId);
    }

    async leaveChat(chatId: number) {
        await this.connection?.invoke("LeaveChat", chatId);
    }

    async sendMessage(
        chatId: number,
        text?: string,
        mediaUrl?: string,
        mediaType?: string,
        audioDuration?: number
    ) {
        await this.connection?.invoke(
            "SendMessage",
            chatId,
            text,
            mediaUrl,
            mediaType,
            audioDuration
        );
    }

    onReceiveMessage(callback: (message: any) => void) {
        this.connection?.on("ReceiveMessage", callback);
    }

    offReceiveMessage(callback: (message: any) => void) {
        this.connection?.off("ReceiveMessage", callback);
    }

    onReceiveNewChat(callback: (chat: any) => void) {
        this.connection?.on("ReceiveNewChat", callback);
    }

    offReceiveNewChat(callback: (chat: any) => void) {
        this.connection?.off("ReceiveNewChat", callback);
    }
}

export default new ChatHub();
