
namespace Application.DTOs;

public class ParticipantDTO
{
    public string UserId { get; set; } = null!;
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }

    public bool PresenceHidden { get; set; }

    public bool? IsOnline { get; set; }

    public DateTimeOffset? LastSeenAt { get; set; }
    public bool IsAdmin { get; set; }
}

public class ChatDTO
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public IEnumerable<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();

    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }

    public bool IsGroup { get; set; }
    public string? Name { get; set; }
    public string? GroupAvatarUrl { get; set; }
}

public class ChatListPreviewDTO
{
    public int ChatId { get; set; }
    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
}

public class UserPresenceSocketDTO
{
    public string UserId { get; set; } = null!;
    public bool PresenceHidden { get; set; }
    public bool? IsOnline { get; set; }
    public DateTimeOffset? LastSeenAt { get; set; }
}

public class MessageStatusSocketDTO
{
    public int MessageId { get; set; }
    public int ChatId { get; set; }
    public string Status { get; set; } = "";
}
