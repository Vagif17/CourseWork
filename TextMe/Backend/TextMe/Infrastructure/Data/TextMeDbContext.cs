using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using Domain;

using Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Infrastructure.Data;

public class TextMeDbContext : IdentityDbContext<AppUser>
{
    private readonly IEncryptionService? _encryptionService;

    public TextMeDbContext(DbContextOptions<TextMeDbContext> options, IEncryptionService? encryptionService = null) : base(options) 
    { 
        _encryptionService = encryptionService;
    }

    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ChatParticipant> ChatParticipants => Set<ChatParticipant>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        ValueConverter<string?, string?> encryptConverter = null!;
        if (_encryptionService != null)
        {
            encryptConverter = new ValueConverter<string?, string?>(
                v => v == null ? null : _encryptionService.Encrypt(v),
                v => v == null ? null : _encryptionService.Decrypt(v)
            );
        }

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
            
            if (encryptConverter != null)
            {
                message.Property(m => m.Text).HasConversion(encryptConverter);
                message.Property(m => m.MediaUrl).HasConversion(encryptConverter);
            }
            else
            {
                message.Property(m => m.Text);
                message.Property(m => m.MediaUrl);
            }
            message.Property(m => m.MediaType);
            message.Property(m => m.AudioDuration);
            message.Property(m => m.IsDeleted).HasDefaultValue(false);
            message.Property(m => m.IsEdited).HasDefaultValue(false);
            message.Property(m => m.CreatedAt).IsRequired();
            message.HasIndex(m => new {m.ChatId, m.CreatedAt});

            message.HasOne(m => m.ReplyToMessage)
                   .WithMany()
                   .HasForeignKey(m => m.ReplyToMessageId)
                   .OnDelete(DeleteBehavior.Restrict);
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
