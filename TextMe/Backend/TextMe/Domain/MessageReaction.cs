using System;

namespace Domain;

public class MessageReaction
{
    public int Id { get; set; }
    
    public int MessageId { get; set; }
    public Message Message { get; set; } = null!;

    public string UserId { get; set; } = null!;
    
    public string Emoji { get; set; } = null!;
    
    public DateTimeOffset CreatedAt { get; set; }
}
