using Application.DTOs;

namespace Application.Services.Interfaces;

public interface IChatService
{
    public Task<PrivateChatResponseDTO> CreateChatAsync(string creatorId, string emailOrPhone);
    public Task<IEnumerable<PrivateChatResponseDTO>> GetAllPrivateChatsAsync(string userId);
}
