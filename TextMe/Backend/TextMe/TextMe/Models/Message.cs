using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TextMe.Models;

public class Message
{
    public int Id { get; set; }
    public int ChatId { get; set; }
    public Chat Chat { get; set; } = null!;

    public string SenderId { get; set; } = null!;
    public AppUser Sender { get; set; } = null!;

    public string? Data { get; set; } = string.Empty;
    public bool IsMedia { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
