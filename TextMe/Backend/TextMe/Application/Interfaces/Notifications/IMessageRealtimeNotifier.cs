using Application.DTOs;

namespace Application.Interfaces.Notifications;

public interface IMessageRealtimeNotifier
{
    public Task NotifyMessageStatusAsync(string targetUserId, int messageId, int chatId, string status);
    public Task NotifyChatListUpdatedAsync(IEnumerable<string> userIds, ChatListPreviewDTO preview);
    public Task NotifyUserPresenceAsync(IEnumerable<string> recipientUserIds, UserPresenceSocketDTO payload);

    public Task NotifyNewMessageAsync(IEnumerable<string> userIds, int chatId, MessageDTO message);
    public Task NotifyMessageEditedAsync(IEnumerable<string> userIds, int chatId, MessageDTO message);
    public Task NotifyMessageDeletedAsync(IEnumerable<string> userIds, int chatId, int messageId);
    public Task NotifyNewChatAsync(IEnumerable<string> userIds, ChatDTO chat);
    public Task NotifyChatDeletedAsync(IEnumerable<string> userIds, int chatId);
    
    public Task NotifyIncomingCallAsync(string targetUserId, string callerId, object offer, bool withVideo, string? avatarUrl);
    public Task NotifyCallAnsweredAsync(string targetUserId, string answererId, object answer);
    public Task NotifyCallRejectedAsync(string targetUserId, string rejecterId);
    public Task NotifyCallEndedAsync(string targetUserId, string enderId);
    public Task NotifyIceCandidateAsync(string targetUserId, string senderId, object candidate);
}
