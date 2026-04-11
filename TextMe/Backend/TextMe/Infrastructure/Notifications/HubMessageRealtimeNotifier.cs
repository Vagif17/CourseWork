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
        var dto = new MessageStatusSocketDto { MessageId = messageId, ChatId = chatId, Status = status };
        return hubContext.Clients.User(targetUserId).SendAsync("MessageStatusUpdated", dto);
    }

    public Task NotifyChatListUpdatedAsync(IEnumerable<string> userIds, ChatListPreviewDto preview)
    {
        var ids = userIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("ChatListUpdated", preview);
    }

    public Task NotifyUserPresenceAsync(IEnumerable<string> recipientUserIds, UserPresenceSocketDto payload)
    {
        var ids = recipientUserIds.Distinct().ToArray();
        return ids.Length == 0
            ? Task.CompletedTask
            : hubContext.Clients.Users(ids).SendAsync("UserPresenceUpdated", payload);
    }
}
