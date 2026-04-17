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

        //https://coursework-1-1mjp.onrender.com
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5243/hubs/chat", {
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
        audioDuration?: number,
        replyToMessageId?: number
    ) {
        await this.connection?.invoke(
            "SendMessage",
            chatId,
            text,
            mediaUrl,
            mediaType,
            audioDuration,
            replyToMessageId
        );
    }

    async editMessage(messageId: number, newText: string) {
        await this.connection?.invoke("EditMessage", messageId, newText);
    }

    async deleteMessage(messageId: number) {
        await this.connection?.invoke("DeleteMessage", messageId);
    }

    onReceiveMessage(callback: (message: any) => void) {
        this.connection?.on("ReceiveMessage", callback);
    }

    offReceiveMessage(callback: (message: any) => void) {
        this.connection?.off("ReceiveMessage", callback);
    }

    onMessageEdited(callback: (message: any) => void) {
        this.connection?.on("MessageEdited", callback);
    }

    offMessageEdited(callback: (message: any) => void) {
        this.connection?.off("MessageEdited", callback);
    }

    onMessageDeleted(callback: (payload: { messageId: number; chatId: number }) => void) {
        this.connection?.on("MessageDeleted", callback);
    }

    offMessageDeleted(callback: (payload: { messageId: number; chatId: number }) => void) {
        this.connection?.off("MessageDeleted", callback);
    }

    onReceiveNewChat(callback: (chat: any) => void) {
        this.connection?.on("ReceiveNewChat", callback);
    }

    offReceiveNewChat(callback: (chat: any) => void) {
        this.connection?.off("ReceiveNewChat", callback);
    }

    async markChatAsRead(chatId: number) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("MarkChatAsRead", chatId);
    }

    async ackMessageDelivered(messageId: number) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("AckMessageDelivered", messageId);
    }

    onMessageStatusUpdated(callback: (payload: { messageId: number; chatId: number; status: string }) => void) {
        this.connection?.on("MessageStatusUpdated", callback);
    }

    offMessageStatusUpdated(callback: (payload: { messageId: number; chatId: number; status: string }) => void) {
        this.connection?.off("MessageStatusUpdated", callback);
    }

    onChatListUpdated(
        callback: (payload: { chatId: number; lastMessage?: string | null; lastMessageAt?: string | null }) => void
    ) {
        this.connection?.on("ChatListUpdated", callback);
    }

    offChatListUpdated(
        callback: (payload: { chatId: number; lastMessage?: string | null; lastMessageAt?: string | null }) => void
    ) {
        this.connection?.off("ChatListUpdated", callback);
    }

    onUserPresenceUpdated(
        callback: (payload: {
            userId: string;
            presenceHidden: boolean;
            isOnline?: boolean | null;
            lastSeenAt?: string | null;
        }) => void
    ) {
        this.connection?.on("UserPresenceUpdated", callback);
    }

    offUserPresenceUpdated(
        callback: (payload: {
            userId: string;
            presenceHidden: boolean;
            isOnline?: boolean | null;
            lastSeenAt?: string | null;
        }) => void
    ) {
        this.connection?.off("UserPresenceUpdated", callback);
    }
}

export default new ChatHub();
