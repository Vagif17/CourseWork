using Application.DTOs;

namespace Application.Services.Interfaces;

public interface IMessageService
{
    public Task<MessageDTO> CreateMessageAsync(int chatId, string senderId, string? text, string? mediaUrl, string? mediaType);
    public Task<IEnumerable<MessageDTO>> GetChatMessagesAsync(int chatId);
}
