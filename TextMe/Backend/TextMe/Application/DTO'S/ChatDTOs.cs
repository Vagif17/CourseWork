using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Application.DTOs;


public class ParticipantDTO
{
    public string UserId { get; set; } = null!;
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }

    /// <summary>True when this user hides presence from others.</summary>
    public bool PresenceHidden { get; set; }

    /// <summary>Meaningful when <see cref="PresenceHidden"/> is false.</summary>
    public bool? IsOnline { get; set; }

    /// <summary>Last disconnect time when offline; meaningful when <see cref="PresenceHidden"/> is false.</summary>
    public DateTimeOffset? LastSeenAt { get; set; }
}

public class PrivateChatResponseDTO
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public IEnumerable<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();

    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
}

public class ChatListPreviewDto
{
    public int ChatId { get; set; }
    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
}

public class UserPresenceSocketDto
{
    public string UserId { get; set; } = null!;
    public bool PresenceHidden { get; set; }
    public bool? IsOnline { get; set; }
    public DateTimeOffset? LastSeenAt { get; set; }
}

public class MessageStatusSocketDto
{
    public int MessageId { get; set; }
    public int ChatId { get; set; }
    public string Status { get; set; } = "";
}


