import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "../../config/constants/Config";
import tokenService from "../services/tokenService";

class ChatHub {
    private connection: signalR.HubConnection;
    private started = false;
    private listeners: Map<string, Set<(payload: any) => void>> = new Map();

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

        this.connection.onreconnected(() => console.log("SignalR Reconnected Mobile"));
        this.connection.onclose(() => {
            console.log("SignalR Disconnected Mobile");
            this.started = false;
        });
    }

    public async start() {
        if (this.connection.state !== signalR.HubConnectionState.Disconnected) return;

        try {
            await this.connection.start();
            this.started = true;
            console.log("SignalR Connected to Mobile!");

            // Re-attach all listeners
            this.listeners.forEach((callbacks, eventName) => {
                callbacks.forEach(callback => {
                    this.connection.on(eventName, callback);
                });
            });
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
            setTimeout(() => this.start(), 5000);
        }
    }

    public stop() {
        this.connection.stop();
        this.started = false;
    }

    public isConnected() {
        return this.connection.state === signalR.HubConnectionState.Connected;
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
        this.registerListener("ReceiveMessage", handler);
    }

    public offReceiveMessage(handler: (message: any) => void) {
        this.removeListener("ReceiveMessage", handler);
    }

    public onMessageEdited(handler: (message: any) => void) {
        this.registerListener("MessageEdited", handler);
    }

    public offMessageEdited(handler: (message: any) => void) {
        this.removeListener("MessageEdited", handler);
    }

    public onMessageDeleted(handler: (payload: { messageId: number, chatId: number }) => void) {
        this.registerListener("MessageDeleted", handler);
    }

    public offMessageDeleted(handler: (payload: { messageId: number, chatId: number }) => void) {
        this.removeListener("MessageDeleted", handler);
    }

    public onMessageStatusUpdated(handler: (payload: { messageId: number, chatId: number, status: string }) => void) {
        this.registerListener("MessageStatusUpdated", handler);
    }

    public offMessageStatusUpdated(handler: (payload: { messageId: number, chatId: number, status: string }) => void) {
        this.removeListener("MessageStatusUpdated", handler);
    }

    public onUserPresenceUpdated(handler: (payload: { userId: string, presenceHidden: boolean, isOnline: boolean, lastSeenAt?: string }) => void) {
        this.registerListener("UserPresenceUpdated", handler);
    }

    public offUserPresenceUpdated(handler: (payload: { userId: string, presenceHidden: boolean, isOnline: boolean, lastSeenAt?: string }) => void) {
        this.removeListener("UserPresenceUpdated", handler);
    }

    public onChatListUpdated(handler: (payload: { chatId: number, lastMessage?: string, lastMessageAt?: string }) => void) {
        this.registerListener("ChatListUpdated", handler);
    }

    public offChatListUpdated(handler: (payload: { chatId: number, lastMessage?: string, lastMessageAt?: string }) => void) {
        this.removeListener("ChatListUpdated", handler);
    }

    public onReceiveNewChat(handler: (chat: any) => void) {
        this.registerListener("ReceiveNewChat", handler);
    }

    public offReceiveNewChat(handler: (chat: any) => void) {
        this.removeListener("ReceiveNewChat", handler);
    }

    // Call Listeners
    public onIncomingCall(handler: (payload: { callerId: string, offer: any, withVideo: boolean, avatarUrl?: string }) => void) {
        this.registerListener("IncomingCall", handler);
    }

    public offIncomingCall(handler: (payload: { callerId: string, offer: any, withVideo: boolean, avatarUrl?: string }) => void) {
        this.removeListener("IncomingCall", handler);
    }

    public onCallAnswered(handler: (payload: { answer: any }) => void) {
        this.registerListener("CallAnswered", handler);
    }

    public offCallAnswered(handler: (payload: { answer: any }) => void) {
        this.removeListener("CallAnswered", handler);
    }

    public onCallRejected(handler: () => void) {
        this.registerListener("CallRejected", handler);
    }

    public offCallRejected(handler: () => void) {
        this.removeListener("CallRejected", handler);
    }

    public onCallEnded(handler: () => void) {
        this.registerListener("CallEnded", handler);
    }

    public offCallEnded(handler: () => void) {
        this.removeListener("CallEnded", handler);
    }

    public onReceiveIceCandidate(handler: (payload: { candidate: any }) => void) {
        this.registerListener("ReceiveIceCandidate", handler);
    }

    public offReceiveIceCandidate(handler: (payload: { candidate: any }) => void) {
        this.removeListener("ReceiveIceCandidate", handler);
    }

    public onChatDeleted(handler: (chatId: number) => void) {
        this.registerListener("ChatDeleted", handler);
    }

    public offChatDeleted(handler: (chatId: number) => void) {
        this.removeListener("ChatDeleted", handler);
    }

    // Generic Invoke
    public async invoke(methodName: string, ...args: any[]) {
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            await this.start();
        }
        return this.connection.invoke(methodName, ...args);
    }
}

const chatHub = new ChatHub();
export default chatHub;
