using Domain;

namespace Application.Interfaces.Repositories;

public interface IMessageRepository
{
    Task<Message> CreateAsync(Message message);
    Task<IEnumerable<Message>> GetChatMessagesAsync(int chatId);
}