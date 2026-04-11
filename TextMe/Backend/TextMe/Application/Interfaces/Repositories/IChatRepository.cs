using Domain;

namespace Application.Interfaces.Repositories;

public interface IChatRepository
{
    public Task<Chat> CreatePrivateChatAsync(string creatorId, string targetUserId);
    public Task<Chat?> FindPrivateChatAsync(string creatorId, string targetUserId);
    public Task<IEnumerable<Chat>> GetAllPrivateChatsAsync(string userId);
    Task<bool> IsUserParticipantInChatAsync(int chatId, string userId);
    Task UpdateChatLastMessageAsync(int chatId, string? preview, DateTimeOffset at);
    Task<IReadOnlyList<string>> GetChatParticipantIdsAsync(int chatId);
    Task<IReadOnlyList<string>> GetDistinctPrivateChatPartnerIdsAsync(string userId);
}
