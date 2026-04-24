using Domain;

namespace Application.Interfaces.Repositories;

public interface IMessageRepository
{
    public Task<Message> CreateAsync(Message message);
    public Task<IEnumerable<Message>> GetChatMessagesAsync(int chatId);
    public Task<Message?> GetByIdTrackingAsync(int messageId);
    public Task UpdateMessageAsync(Message message);
    public Task<IReadOnlyList<(int MessageId, string SenderId)>> MarkIncomingAsDeliveredAsync(int chatId, string recipientUserId);
    public Task<IReadOnlyList<(int MessageId, string SenderId)>> MarkIncomingAsReadAsync(int chatId, string readerUserId);
    public Task<Dictionary<int, int>> GetUnreadCountsAsync(string userId, IEnumerable<int> chatIds);
}