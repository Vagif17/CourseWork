using Application.DTOs;

namespace Application.Interfaces.Stores;

public interface IUserStore
{
    public Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId);
    public Task<string?> FindUserIdByEmailOrPhoneAsync(string emailOrPhone);
    public Task<string?> GetEmailAsync(string userId);
    public Task<string?> GetUserNameAsync(string userId);
    public Task<string?> GetAvatarUrlAsync(string userId);
    public Task<ParticipantDTO?> GetUserByIdAsync(string userId);
    public Task<IList<string>> GetRolesAsync(string userId);
    public Task<IEnumerable<UserDTO>> GetUsersByIdsAsync(IEnumerable<string> ids);
    public Task<bool> CheckPasswordAsync(string userId, string password);
    public Task<string> CreateUserAsync(RegisterRequestDTO request);
    public Task AddToRoleAsync(string userId, string role);

    public Task<UserProfileResponseDTO?> GetUserProfileAsync(string userId);
    public Task<(UserProfileResponseDTO Profile, bool UserNameChanged)> UpdateUserProfileAsync(
        string userId,
        UpdateProfileRequestDTO request,
        Stream? avatarStream,
        string? fileName,
        string? contentType);
    public Task ChangePasswordAsync(string userId, string currentPassword, string newPassword);

    Task<IReadOnlyDictionary<string, (bool ShareOnlineStatus, DateTimeOffset? LastSeenAt)>> GetUserPresenceFieldsByIdsAsync(
        IEnumerable<string> userIds,
        CancellationToken cancellationToken = default);

    Task<UserProfileResponseDTO> UpdateShareOnlineStatusAsync(
        string userId,
        bool shareOnlineStatus,
        CancellationToken cancellationToken = default);
}
