using TextMe.DTO_S;
using TextMe.Models;

namespace TextMe.Repositories.Interfaces;

public interface IChatRepository
{
    public Task<Chat> CreatePrivateChatAsync(string creatorId, string targetUserId);
    public Task<Chat?> FindPrivateChatAsync(string creatorId, string targetUserId);
    public Task<IEnumerable<Chat>> GetAllPrivateChatsAsync(string userId);
}
