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

    public Task NotifyNewMessageAsync(IEnumerable<string> userIds, int chatId, MessageDTO message)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("ReceiveMessage", message);
    }

    public Task NotifyMessageEditedAsync(IEnumerable<string> userIds, int chatId, MessageDTO message)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("MessageEdited", message);
    }

    public Task NotifyMessageDeletedAsync(IEnumerable<string> userIds, int chatId, int messageId)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("MessageDeleted", new { MessageId = messageId, ChatId = chatId });
    }

    public Task NotifyNewChatAsync(IEnumerable<string> userIds, ChatDTO chat)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("ReceiveNewChat", chat);
    }
    
    public Task NotifyChatDeletedAsync(IEnumerable<string> userIds, int chatId)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("ChatDeleted", chatId);
    }

    public Task NotifyIncomingCallAsync(string targetUserId, string callerId, object offer, bool withVideo, string? avatarUrl)
    {
        return hubContext.Clients.User(targetUserId).SendAsync("IncomingCall", new { CallerId = callerId, Offer = offer, WithVideo = withVideo, AvatarUrl = avatarUrl });
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
