namespace Application.DTOs;

public class UserProfileResponseDTO
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>When false, others do not see online / last seen for this user.</summary>
    public bool ShareOnlineStatus { get; set; } = true;

    /// <summary>Approximate last activity when offline (for own profile / diagnostics).</summary>
    public DateTimeOffset? LastSeenAt { get; set; }
}

public class UpdateProfileRequestDTO
{
    public string? UserName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class ChangePasswordRequestDTO
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdatePrivacyRequestDTO
{
    public bool ShareOnlineStatus { get; set; }
}

public class ProfileUpdateResultDTO
{
    public UserProfileResponseDTO Profile { get; set; } = null!;
    public AuthResponseDTO? NewTokens { get; set; }
}

public class NewsArticleDTO
{
    public string Title { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Link { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public string Source { get; set; } = string.Empty;
}
