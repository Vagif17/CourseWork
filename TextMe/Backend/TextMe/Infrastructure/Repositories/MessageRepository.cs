using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain;
using Application.Interfaces.Repositories;

namespace TextMe.Repositories.Classes;

public class MessageRepository : IMessageRepository
{
    private readonly TextMeDbContext context;

    public MessageRepository(TextMeDbContext _context)
    {
        context = _context;
    }

    public async Task<Message> CreateAsync(Message message)
    {
        await context.Messages.AddAsync(message);
        await context.SaveChangesAsync();
        
        if (message.ReplyToMessageId.HasValue)
        {
            await context.Entry(message).Reference(m => m.ReplyToMessage).LoadAsync();
        }

        return message;
    }

    public async Task<IEnumerable<Message>> GetChatMessagesAsync(int chatId)
    {
        return await context.Messages
            .Include(x => x.ReplyToMessage)
            .Where(x => x.ChatId == chatId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<Message?> GetByIdTrackingAsync(int messageId)
    {
        return await context.Messages.FirstOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task UpdateMessageAsync(Message message)
    {
        context.Messages.Update(message);
        await context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<(int MessageId, string SenderId)>> MarkIncomingAsDeliveredAsync(int chatId, string recipientUserId)
    {
        var msgs = await context.Messages
            .Where(m => m.ChatId == chatId && m.SenderId != recipientUserId && m.Status == MessageStatus.Sent)
            .ToListAsync();
        foreach (var m in msgs)
            m.Status = MessageStatus.Delivered;
        if (msgs.Count > 0)
            await context.SaveChangesAsync();
        return msgs.ConvertAll(m => (m.Id, m.SenderId));
    }

    public async Task<IReadOnlyList<(int MessageId, string SenderId)>> MarkIncomingAsReadAsync(int chatId, string readerUserId)
    {
        var msgs = await context.Messages
            .Where(m => m.ChatId == chatId && m.SenderId != readerUserId && m.Status != MessageStatus.Read)
            .ToListAsync();
        foreach (var m in msgs)
            m.Status = MessageStatus.Read;
        if (msgs.Count > 0)
            await context.SaveChangesAsync();
        return msgs.ConvertAll(m => (m.Id, m.SenderId));
    }
}