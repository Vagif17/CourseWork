using Application.DTOs;

namespace Application.Interfaces.Notifications;

public interface IMessageRealtimeNotifier
{
    Task NotifyMessageStatusAsync(string targetUserId, int messageId, int chatId, string status);

    Task NotifyChatListUpdatedAsync(IEnumerable<string> userIds, ChatListPreviewDto preview);

    Task NotifyUserPresenceAsync(IEnumerable<string> recipientUserIds, UserPresenceSocketDto payload);
}
