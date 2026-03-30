using TextMe.Models;

namespace TextMe.Repositories.Interfaces;

public interface IMessageRepository
{
    Task<Message> CreateAsync(Message message);
    Task<IEnumerable<Message>> GetChatMessagesAsync(int chatId);
}