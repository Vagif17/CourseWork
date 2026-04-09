using Application.DTOs;

namespace Application.Services.Interfaces;

public interface IMessageService
{
    //Замени на DTO вместо большого количества параметров
    public Task<MessageDTO> CreateMessageAsync(int chatId, string senderId, string? text, string? mediaUrl, string? mediaType, int? audioDuration = null);
    public Task<IEnumerable<MessageDTO>> GetChatMessagesAsync(int chatId);
}
