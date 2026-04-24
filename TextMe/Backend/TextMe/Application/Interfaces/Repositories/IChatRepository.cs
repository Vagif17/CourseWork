using Domain;

namespace Application.Interfaces.Repositories;

public interface IChatRepository
{
    public Task<Chat> CreatePrivateChatAsync(string creatorId, string targetUserId);
    public Task<Chat> CreateGroupChatAsync(string name, string? avatarUrl, IEnumerable<string> participantIds, string creatorId);
    public Task<Chat?> FindPrivateChatAsync(string creatorId, string targetUserId);
    public Task<IEnumerable<Chat>> GetAllUserChatsAsync(string userId);
    public Task<bool> IsUserParticipantInChatAsync(int chatId, string userId);
    public Task UpdateChatLastMessageAsync(int chatId, string? preview, DateTimeOffset at);
    public Task<IReadOnlyList<string>> GetChatParticipantIdsAsync(int chatId);
    public Task<IReadOnlyList<string>> GetDistinctPrivateChatPartnerIdsAsync(string userId);
    public Task<Chat?> GetChatByIdAsync(int chatId);
    public Task DeleteChatAsync(int chatId);
    public Task RemoveParticipantAsync(int chatId, string userId);
}
