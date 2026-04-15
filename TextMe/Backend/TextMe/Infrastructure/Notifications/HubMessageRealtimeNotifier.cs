using Application.DTOs;
using Application.Interfaces.Notifications;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Notifications;

public class HubMessageRealtimeNotifier : IMessageRealtimeNotifier
{
    private readonly IHubContext<ChatHub> hubContext;

    public HubMessageRealtimeNotifier(IHubContext<ChatHub> hubContext)
    {
        this.hubContext = hubContext;
    }

    public Task NotifyMessageStatusAsync(string targetUserId, int messageId, int chatId, string status)
    {
        var dto = new MessageStatusSocketDTO { MessageId = messageId, ChatId = chatId, Status = status };
        return hubContext.Clients.User(targetUserId).SendAsync("MessageStatusUpdated", dto);
    }

    public Task NotifyChatListUpdatedAsync(IEnumerable<string> userIds, ChatListPreviewDTO preview)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("ChatListUpdated", preview);
    }

    public Task NotifyUserPresenceAsync(IEnumerable<string> recipientUserIds, UserPresenceSocketDTO payload)
    {
        var ids = recipientUserIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("UserPresenceUpdated", payload);
    }

    public Task NotifyNewMessageAsync(int chatId, MessageDTO message)
    {
        return hubContext.Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", message);
    }

    public Task NotifyMessageEditedAsync(int chatId, MessageDTO message)
    {
        return hubContext.Clients.Group($"chat-{chatId}").SendAsync("MessageEdited", message);
    }

    public Task NotifyMessageDeletedAsync(int chatId, int messageId)
    {
        return hubContext.Clients.Group($"chat-{chatId}").SendAsync("MessageDeleted", new { MessageId = messageId, ChatId = chatId });
    }

    public Task NotifyNewChatAsync(IEnumerable<string> userIds, ChatDTO chat)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("ReceiveNewChat", chat);
    }

    public Task NotifyIncomingCallAsync(string targetUserId, string callerId, object offer)
    {
        return hubContext.Clients.User(targetUserId).SendAsync("IncomingCall", new { CallerId = callerId, Offer = offer });
    }

    public Task NotifyCallAnsweredAsync(string targetUserId, string answererId, object answer)
    {
        return hubContext.Clients.User(targetUserId).SendAsync("CallAnswered", new { AnswererId = answererId, Answer = answer });
    }

    public Task NotifyCallRejectedAsync(string targetUserId, string rejecterId)
    {
        return hubContext.Clients.User(targetUserId).SendAsync("CallRejected", new { RejecterId = rejecterId });
    }

    public Task NotifyCallEndedAsync(string targetUserId, string enderId)
    {
        return hubContext.Clients.User(targetUserId).SendAsync("CallEnded", new { EnderId = enderId });
    }

    public Task NotifyIceCandidateAsync(string targetUserId, string senderId, object candidate)
    {
        return hubContext.Clients.User(targetUserId).SendAsync("ReceiveIceCandidate", new { SenderId = senderId, Candidate = candidate });
    }
}
