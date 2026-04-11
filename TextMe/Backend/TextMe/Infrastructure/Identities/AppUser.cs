using Domain;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure;

public class AppUser : IdentityUser
{
    public string? AvatarUrl { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public ICollection<ChatParticipant> ChatParticipants { get; set; } = new List<ChatParticipant>();

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public DateTimeOffset? LastSeenAt { get; set; }

    public bool ShareOnlineStatus { get; set; } = true;

}
