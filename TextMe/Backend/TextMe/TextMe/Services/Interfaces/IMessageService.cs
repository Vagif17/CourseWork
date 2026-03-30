using TextMe.DTO_S;

namespace TextMe.Services.Interfaces;

public interface IMessageService
{
    Task<MessageDTO> CreateMessageAsync(int chatId, string senderId, string text);
    Task<IEnumerable<MessageDTO>> GetChatMessagesAsync(int chatId);
}
