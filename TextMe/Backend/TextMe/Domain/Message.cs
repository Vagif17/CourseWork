using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain;

public class Message
{
    public int Id { get; set; }
    public int ChatId { get; set; }
    public Chat Chat { get; set; } = null!;

    public string SenderId { get; set; } = null!;

    public string? Text { get; set; }
    public string? MediaUrl { get; set; }
    public string? MediaType { get; set; }
    public int? AudioDuration { get; set; } 

    public MessageStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public bool IsDeleted { get; set; }
    public bool IsEdited { get; set; }
    public int? ReplyToMessageId { get; set; }
    public Message? ReplyToMessage { get; set; }
}
