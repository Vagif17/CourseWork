using Microsoft.EntityFrameworkCore;
using TextMe.Data;
using TextMe.Models;
using TextMe.Repositories.Interfaces;

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

        return message;
    }

    public async Task<IEnumerable<Message>> GetChatMessagesAsync(int chatId)
    {
        return await context.Messages
            .Where(x => x.ChatId == chatId)
            .Include(x => x.Sender)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }
}