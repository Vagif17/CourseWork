using TextMe.DTO_S;
using TextMe.Models;

namespace TextMe.Services.Interfaces;

public interface IChatService
{
    public Task<int> CreateChatAsync(string creatorId, string emailOrPhone);
    public Task<IEnumerable<PrivateChatDTOResponse>> GetAllPrivateChatsAsync(string userId);
}
