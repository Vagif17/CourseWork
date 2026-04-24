using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain;
using Application.Interfaces.Repositories;

namespace Infrastructure.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly TextMeDbContext context;

    public ChatRepository(TextMeDbContext _context)
    {
        context = _context;
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

        context.Chats.Add(chat);
        await context.SaveChangesAsync();

        return chat;
    }

    public async Task<Chat> CreateGroupChatAsync(string name, string? avatarUrl, IEnumerable<string> participantIds, string creatorId)
    {
        var participants = participantIds.Distinct().Select(userId => new ChatParticipant 
        { 
            UserId = userId,
            IsAdmin = userId == creatorId
        }).ToList();

        // Убеждаемся, что создатель в списке
        if (participants.All(p => p.UserId != creatorId))
        {
            participants.Add(new ChatParticipant { UserId = creatorId, IsAdmin = true });
        }

        var chat = new Chat
        {
            Name = name,
            GroupAvatarUrl = avatarUrl,
            IsGroup = true,
            CreatedAt = DateTimeOffset.UtcNow,
            Participants = participants
        };

        context.Chats.Add(chat);
        await context.SaveChangesAsync();

        return chat;
    }

    public async Task<Chat?> FindPrivateChatAsync(string creatorId, string targetUserId)
    {
        return await context.Chats
            .Include(c => c.Participants)
            .Where(c => !c.IsGroup)
            .FirstOrDefaultAsync(c =>
                c.Participants.Any(p => p.UserId == creatorId) &&
                c.Participants.Any(p => p.UserId == targetUserId));
    }

    public async Task<IEnumerable<Chat>> GetAllUserChatsAsync(string userId)
    {
        return await context.Chats
            .Include(c => c.Participants)
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> IsUserParticipantInChatAsync(int chatId, string userId)
    {
        return await context.ChatParticipants
            .AnyAsync(p => p.ChatId == chatId && p.UserId == userId);
    }

    public async Task UpdateChatLastMessageAsync(int chatId, string? preview, DateTimeOffset at)
    {
        var chat = await context.Chats.FindAsync(chatId);
        if (chat != null)
        {
            chat.LastMessagePreview = preview;
            chat.LastMessageAt = at;
            await context.SaveChangesAsync();
        }
    }

    public async Task<IReadOnlyList<string>> GetChatParticipantIdsAsync(int chatId)
    {
        return await context.ChatParticipants
            .Where(p => p.ChatId == chatId)
            .Select(p => p.UserId)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<string>> GetDistinctPrivateChatPartnerIdsAsync(string userId)
    {
        return await context.ChatParticipants
            .Where(p => p.UserId == userId)
            .Select(p => p.ChatId)
            .SelectMany(chatId => context.ChatParticipants
                .Where(p => p.ChatId == chatId && p.UserId != userId && !p.Chat.IsGroup)
                .Select(p => p.UserId))
            .Distinct()
            .ToListAsync();
    }

    public async Task DeleteChatAsync(int chatId)
    {
        var chat = await context.Chats
            .Include(c => c.Participants)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == chatId);

        if (chat != null)
        {
            context.ChatParticipants.RemoveRange(chat.Participants);
            context.Messages.RemoveRange(chat.Messages);
            context.Chats.Remove(chat);
            await context.SaveChangesAsync();
        }
    }

    public async Task<Chat?> GetChatByIdAsync(int chatId)
    {
        return await context.Chats
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == chatId);
    }

    public async Task RemoveParticipantAsync(int chatId, string userId)
    {
        var participant = await context.ChatParticipants
            .FirstOrDefaultAsync(p => p.ChatId == chatId && p.UserId == userId);

        if (participant != null)
        {
            context.ChatParticipants.Remove(participant);
            await context.SaveChangesAsync();
        }
    }
}