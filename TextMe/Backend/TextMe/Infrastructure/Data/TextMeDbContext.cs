using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using Domain;

namespace Infrastructure.Data;

public class TextMeDbContext : IdentityDbContext<AppUser>
{
    public TextMeDbContext(DbContextOptions<TextMeDbContext> options) : base(options) { }

    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ChatParticipant> ChatParticipants => Set<ChatParticipant>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Chat>(chat =>
        {
            chat.HasKey(c => c.Id);
            chat.Property(c => c.Name).IsRequired().HasMaxLength(100);
            chat.Property(c => c.IsGroup).IsRequired();
            chat.Property(c => c.CreatedAt).IsRequired();
        });

        builder.Entity<Message>(message =>
        {
            message.HasKey(m => m.Id);
            message.Property(m => m.ChatId).IsRequired();
            message.Property(m => m.SenderId).IsRequired();
            message.Property(m => m.Text);
            message.Property(m => m.MediaUrl);
            message.Property(m => m.MediaType);
            message.Property(m => m.CreatedAt).IsRequired();
            message.HasIndex(m => new {m.ChatId, m.CreatedAt});
        });

        builder.Entity<ChatParticipant>(chatParticipant =>
        {
            chatParticipant.HasKey(cp => new { cp.ChatId, cp.UserId });
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.JwtId).IsUnique();
            entity.Property(e => e.JwtId).IsRequired().HasMaxLength(64);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
        });
    }
}
