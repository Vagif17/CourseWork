using Domain;

namespace Application.Interfaces.Repositories;

public interface IMessageRepository
{
    Task<Message> CreateAsync(Message message);
    Task<IEnumerable<Message>> GetChatMessagesAsync(int chatId);
    Task<Message?> GetByIdTrackingAsync(int messageId);
    Task UpdateMessageAsync(Message message);
    Task<IReadOnlyList<(int MessageId, string SenderId)>> MarkIncomingAsDeliveredAsync(int chatId, string recipientUserId);
    Task<IReadOnlyList<(int MessageId, string SenderId)>> MarkIncomingAsReadAsync(int chatId, string readerUserId);
}