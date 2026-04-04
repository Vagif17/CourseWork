using Domain;

namespace Application.Interfaces.Repositories;

public interface IChatRepository
{
    public Task<Chat> CreatePrivateChatAsync(string creatorId, string targetUserId);
    public Task<Chat?> FindPrivateChatAsync(string creatorId, string targetUserId);
    public Task<IEnumerable<Chat>> GetAllPrivateChatsAsync(string userId);
}
