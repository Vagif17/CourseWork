import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "../../config/constants/Config";
import tokenService from "../services/tokenService";

class ChatHub {
    private connection: signalR.HubConnection;
    private started = false;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: async () => {
                    const token = await tokenService.getValidToken();
                    return token || "";
                },
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();
    }

    public async start() {
        if (this.connection.state !== signalR.HubConnectionState.Disconnected) return;

        try {
            await this.connection.start();
            this.started = true;
            console.log("SignalR Connected to Mobile!");
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
            // Retry
            setTimeout(() => this.start(), 5000);
        }
    }

    public stop() {
        this.connection.stop();
        this.started = false;
    }

    public isConnected() {
        return this.started && this.connection.state === signalR.HubConnectionState.Connected;
    }

    // Methods
    public async joinChat(chatId: number) {
        return this.invoke("JoinChat", chatId);
    }

    public async leaveChat(chatId: number) {
        return this.invoke("LeaveChat", chatId);
    }

    public async markChatAsRead(chatId: number) {
        return this.invoke("MarkChatAsRead", chatId);
    }

    public async ackMessageDelivered(messageId: number) {
        return this.invoke("AckMessageDelivered", messageId);
    }

    public async editMessage(messageId: number, newText: string) {
        return this.invoke("EditMessage", messageId, newText);
    }

    public async deleteMessage(messageId: number) {
        return this.invoke("DeleteMessage", messageId);
    }

    // Call Methods
    public async callUser(targetUserId: string, offer: any, withVideo: boolean, avatarUrl: string | null) {
        return this.invoke("CallUser", targetUserId, offer, withVideo, avatarUrl);
    }

    public async answerCall(targetUserId: string, answer: any) {
        return this.invoke("AnswerCall", targetUserId, answer);
    }

    public async rejectCall(targetUserId: string) {
        return this.invoke("RejectCall", targetUserId);
    }

    public async endCall(targetUserId: string) {
        return this.invoke("EndCall", targetUserId);
    }

    public async sendIceCandidate(targetUserId: string, candidate: any) {
        return this.invoke("SendIceCandidate", targetUserId, candidate);
    }

    // Handlers
    public onReceiveMessage(handler: (message: any) => void) {
        this.connection.on("ReceiveMessage", handler);
    }

    public offReceiveMessage(handler: (message: any) => void) {
        this.connection.off("ReceiveMessage", handler);
    }

    public onMessageEdited(handler: (message: any) => void) {
        this.connection.on("MessageEdited", handler);
    }

    public offMessageEdited(handler: (message: any) => void) {
        this.connection.off("MessageEdited", handler);
    }

    public onMessageDeleted(handler: (payload: { messageId: number, chatId: number }) => void) {
        this.connection.on("MessageDeleted", handler);
    }

    public offMessageDeleted(handler: (payload: { messageId: number, chatId: number }) => void) {
        this.connection.off("MessageDeleted", handler);
    }

    public onMessageStatusUpdated(handler: (payload: { messageId: number, chatId: number, status: string }) => void) {
        this.connection.on("MessageStatusUpdated", handler);
    }

    public offMessageStatusUpdated(handler: (payload: { messageId: number, chatId: number, status: string }) => void) {
        this.connection.off("MessageStatusUpdated", handler);
    }

    public onUserPresenceUpdated(handler: (payload: { userId: string, presenceHidden: boolean, isOnline: boolean, lastSeenAt?: string }) => void) {
        this.connection.on("UserPresenceUpdated", handler);
    }

    public offUserPresenceUpdated(handler: (payload: { userId: string, presenceHidden: boolean, isOnline: boolean, lastSeenAt?: string }) => void) {
        this.connection.off("UserPresenceUpdated", handler);
    }

    public onChatListUpdated(handler: (payload: { chatId: number, lastMessage?: string, lastMessageAt?: string }) => void) {
        this.connection.on("ChatListUpdated", handler);
    }

    public offChatListUpdated(handler: (payload: { chatId: number, lastMessage?: string, lastMessageAt?: string }) => void) {
        this.connection.off("ChatListUpdated", handler);
    }

    public onReceiveNewChat(handler: (chat: any) => void) {
        this.connection.on("ReceiveNewChat", handler);
    }

    public offReceiveNewChat(handler: (chat: any) => void) {
        this.connection.off("ReceiveNewChat", handler);
    }

    // Call Listeners
    public onIncomingCall(handler: (payload: { callerId: string, offer: any, withVideo: boolean, avatarUrl?: string }) => void) {
        this.connection.on("IncomingCall", handler);
    }

    public offIncomingCall(handler: (payload: { callerId: string, offer: any, withVideo: boolean, avatarUrl?: string }) => void) {
        this.connection.off("IncomingCall", handler);
    }

    public onCallAnswered(handler: (payload: { answer: any }) => void) {
        this.connection.on("CallAnswered", handler);
    }

    public offCallAnswered(handler: (payload: { answer: any }) => void) {
        this.connection.off("CallAnswered", handler);
    }

    public onCallRejected(handler: () => void) {
        this.connection.on("CallRejected", handler);
    }

    public offCallRejected(handler: () => void) {
        this.connection.off("CallRejected", handler);
    }

    public onCallEnded(handler: () => void) {
        this.connection.on("CallEnded", handler);
    }

    public offCallEnded(handler: () => void) {
        this.connection.off("CallEnded", handler);
    }

    public onReceiveIceCandidate(handler: (payload: { candidate: any }) => void) {
        this.connection.on("ReceiveIceCandidate", handler);
    }

    public offReceiveIceCandidate(handler: (payload: { candidate: any }) => void) {
        this.connection.off("ReceiveIceCandidate", handler);
    }

    // Generic Invoke
    public async invoke(methodName: string, ...args: any[]) {
        if (!this.isConnected()) {
            await this.start();
        }
        return this.connection.invoke(methodName, ...args);
    }
}

const chatHub = new ChatHub();
export default chatHub;
