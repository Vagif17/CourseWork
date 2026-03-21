using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using TextMe.Data;
using TextMe.DTO_S;
using TextMe.Models;
using TextMe.Repositories.Interfaces;

namespace TextMe.Repositories.Classes;

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
            .ThenInclude(p => p.User)
            .ToListAsync();
    }
}