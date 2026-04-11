using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain;
using Application.Interfaces.Repositories;

namespace Infrastructure.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly TextMeDbContext textMeDbContext;
    public ChatRepository(TextMeDbContext _textMeDbContext)
    {
        textMeDbContext = _textMeDbContext;
    }

    public async Task<Chat> CreatePrivateChatAsync(string creatorId, string targetUserId)
    {
        var chat = new Chat
        {
            IsGroup = false,
            CreatedAt = DateTimeOffset.UtcNow,
            Participants = new List<ChatParticipant>
        {
            new ChatParticipant { UserId = creatorId },
            new ChatParticipant { UserId = targetUserId }
        }
        };

        await textMeDbContext.Chats.AddAsync(chat);
        await textMeDbContext.SaveChangesAsync();

        return chat;
    }

    public async Task<Chat?> FindPrivateChatAsync(string creatorId, string targetUserId)
    {
        return await textMeDbContext.Chats
            .Where(c => !c.IsGroup)
            .Where(c => c.Participants.Any(p => p.UserId == creatorId) &&
                        c.Participants.Any(p => p.UserId == targetUserId))
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Chat>> GetAllPrivateChatsAsync(string userId)
    {
        return await textMeDbContext.Chats
            .Where(c => !c.IsGroup)
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .Include(c => c.Participants)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> IsUserParticipantInChatAsync(int chatId, string userId)
    {
        return await textMeDbContext.Chats
            .AsNoTracking()
            .AnyAsync(c => c.Id == chatId && c.Participants.Any(p => p.UserId == userId));
    }

    public async Task UpdateChatLastMessageAsync(int chatId, string? preview, DateTimeOffset at)
    {
        var chat = await textMeDbContext.Chats.FirstAsync(c => c.Id == chatId);
        chat.LastMessagePreview = preview;
        chat.LastMessageAt = at;
        await textMeDbContext.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<string>> GetChatParticipantIdsAsync(int chatId)
    {
        return await textMeDbContext.Chats
            .AsNoTracking()
            .Where(c => c.Id == chatId)
            .SelectMany(c => c.Participants)
            .Select(p => p.UserId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<string>> GetDistinctPrivateChatPartnerIdsAsync(string userId)
    {
        return await textMeDbContext.Chats
            .AsNoTracking()
            .Where(c => !c.IsGroup && c.Participants.Any(p => p.UserId == userId))
            .SelectMany(c => c.Participants)
            .Where(p => p.UserId != userId)
            .Select(p => p.UserId)
            .Distinct()
            .ToListAsync();
    }
}