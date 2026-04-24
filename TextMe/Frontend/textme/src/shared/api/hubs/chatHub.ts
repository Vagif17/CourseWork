import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "../../config/constants/Config";
import { tokenService } from "../services/tokenService"

class ChatHub {
    private connection: signalR.HubConnection | null = null;
    private listeners: Map<string, Set<(payload: any) => void>> = new Map();

    async start() {
        if (this.connection) {
            if (this.connection.state === signalR.HubConnectionState.Connected)
                return;
            if (this.connection.state === signalR.HubConnectionState.Connecting || 
                this.connection.state === signalR.HubConnectionState.Reconnecting)
                return;

            await this.connection.start();
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: async () => {
                    return (await tokenService.getValidToken()) || "";
                },
            })
            .withAutomaticReconnect()
            .build();

        this.connection.onreconnected(() => console.log("SignalR Reconnected"));
        this.connection.onclose(() => console.log("SignalR Disconnected"));

        // Re-attach all listeners if connection was recreated
        this.listeners.forEach((callbacks, eventName) => {
            callbacks.forEach(callback => {
                this.connection?.on(eventName, callback);
            });
        });

        await this.connection.start();
        console.log("SignalR Connected");
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    private registerListener(eventName: string, callback: (payload: any) => void) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(callback);
        
        if (this.connection) {
            this.connection.on(eventName, callback);
        }
    }

    private removeListener(eventName: string, callback: (payload: any) => void) {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.delete(callback);
        }
        if (this.connection) {
            this.connection.off(eventName, callback);
        }
    }

    async joinChat(chatId: number) {
        if (!this.isConnected()) await this.start();
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
        this.registerListener("ReceiveMessage", callback);
    }

    offReceiveMessage(callback: (message: any) => void) {
        this.removeListener("ReceiveMessage", callback);
    }

    onMessageEdited(callback: (message: any) => void) {
        this.registerListener("MessageEdited", callback);
    }

    offMessageEdited(callback: (message: any) => void) {
        this.removeListener("MessageEdited", callback);
    }

    onMessageDeleted(callback: (payload: { messageId: number; chatId: number }) => void) {
        this.registerListener("MessageDeleted", callback);
    }

    offMessageDeleted(callback: (payload: { messageId: number; chatId: number }) => void) {
        this.removeListener("MessageDeleted", callback);
    }

    onReceiveNewChat(callback: (chat: any) => void) {
        this.registerListener("ReceiveNewChat", callback);
    }

    offReceiveNewChat(callback: (chat: any) => void) {
        this.removeListener("ReceiveNewChat", callback);
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
        this.registerListener("MessageStatusUpdated", callback);
    }

    offMessageStatusUpdated(callback: (payload: { messageId: number; chatId: number; status: string }) => void) {
        this.removeListener("MessageStatusUpdated", callback);
    }

    onChatListUpdated(
        callback: (payload: { chatId: number; lastMessage?: string | null; lastMessageAt?: string | null }) => void
    ) {
        this.registerListener("ChatListUpdated", callback);
    }

    offChatListUpdated(
        callback: (payload: { chatId: number; lastMessage?: string | null; lastMessageAt?: string | null }) => void
    ) {
        this.removeListener("ChatListUpdated", callback);
    }

    onUserPresenceUpdated(
        callback: (payload: {
            userId: string;
            presenceHidden: boolean;
            isOnline?: boolean | null;
            lastSeenAt?: string | null;
        }) => void
    ) {
        this.registerListener("UserPresenceUpdated", callback);
    }

    offUserPresenceUpdated(
        callback: (payload: {
            userId: string;
            presenceHidden: boolean;
            isOnline?: boolean | null;
            lastSeenAt?: string | null;
        }) => void
    ) {
        this.removeListener("UserPresenceUpdated", callback);
    }

    onChatDeleted(callback: (chatId: number) => void) {
        this.registerListener("ChatDeleted", callback);
    }

    offChatDeleted(callback: (chatId: number) => void) {
        this.removeListener("ChatDeleted", callback);
    }

    // WebRTC methods
    async callUser(targetUserId: string, offer: any, withVideo: boolean, avatarUrl?: string | null) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("CallUser", targetUserId, offer, withVideo, avatarUrl);
    }

    async answerCall(targetUserId: string, answer: any) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("AnswerCall", targetUserId, answer);
    }

    async rejectCall(targetUserId: string) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("RejectCall", targetUserId);
    }

    async endCall(targetUserId: string) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("EndCall", targetUserId);
    }

    async sendIceCandidate(targetUserId: string, candidate: any) {
        if (!this.isConnected()) await this.start();
        await this.connection?.invoke("SendIceCandidate", targetUserId, candidate);
    }

    onIncomingCall(callback: (payload: any) => void) {
        this.registerListener("IncomingCall", callback);
    }

    offIncomingCall(callback: (payload: any) => void) {
        this.removeListener("IncomingCall", callback);
    }

    onCallAnswered(callback: (payload: any) => void) {
        this.registerListener("CallAnswered", callback);
    }

    offCallAnswered(callback: (payload: any) => void) {
        this.removeListener("CallAnswered", callback);
    }

    onCallRejected(callback: (payload: any) => void) {
        this.registerListener("CallRejected", callback);
    }

    offCallRejected(callback: (payload: any) => void) {
        this.removeListener("CallRejected", callback);
    }

    onCallEnded(callback: (payload: any) => void) {
        this.registerListener("CallEnded", callback);
    }

    offCallEnded(callback: (payload: any) => void) {
        this.removeListener("CallEnded", callback);
    }

    onReceiveIceCandidate(callback: (payload: any) => void) {
        this.registerListener("ReceiveIceCandidate", callback);
    }

    offReceiveIceCandidate(callback: (payload: any) => void) {
        this.removeListener("ReceiveIceCandidate", callback);
    }
}

export default new ChatHub();
