using Application.DTOs;
using Application.Interfaces.Stores;
using Application.Services.Classes;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Stores;

public class UserStore : IUserStore
{

    private readonly UserManager<AppUser> userManager;
    private readonly ICloudinaryService cloudinarySerice;

    public UserStore(UserManager<AppUser> _userManager,ICloudinaryService _cloudinaryService)
    {
        userManager = _userManager;
        cloudinarySerice = _cloudinaryService;
    }

    public async Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId)
    {
        var user = emailOrId.Contains("@")
            ? await userManager.FindByEmailAsync(emailOrId)
            : await userManager.FindByIdAsync(emailOrId);
        return user?.Id;
    }



    public async Task<string> CreateUserAsync(RegisterRequestDTO request)
    {
        var avatarUrl = await cloudinarySerice.UploadAvatarAsync(new UploadMediaRequestDTO
        {
            FileStream = request.FileStream,
            FileName = request.FileName,
            ContentType = request.ContentType
        });

        var user = new AppUser
        {
            UserName = request.UserName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            CreatedAt = DateTime.UtcNow,
            AvatarUrl = avatarUrl
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return user.Id;
    }


    public async Task<bool> CheckPasswordAsync(string userId, string password)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user != null && await userManager.CheckPasswordAsync(user, password);
    }

    public async Task AddToRoleAsync(string userId, string role)
    {
        await userManager.AddToRoleAsync((await userManager.FindByIdAsync(userId))!, role);
    }


    public async Task<IList<string>> GetRolesAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user is null ? new List<string>() : await userManager.GetRolesAsync(user);
    }

    public async Task<string?> GetEmailAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user?.Email;
    }

    public async Task<string?> GetUserNameAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user?.UserName;
    }

    public async Task<string?> GetAvatarUrlAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user?.AvatarUrl;
    }

    public async Task<string?> FindUserIdByEmailOrPhoneAsync(string emailOrPhone)
    {
        var user = emailOrPhone.Contains("@")
            ? await userManager.FindByEmailAsync(emailOrPhone)
            : await userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == emailOrPhone);

        return user?.Id;
    }

    public async Task<ParticipantDTO?> GetUserByIdAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return null;

        return new ParticipantDTO
        {
            UserId = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl
        };
    }

    public async Task<IEnumerable<UserDTO>> GetUsersByIdsAsync(IEnumerable<string> ids)
    {
        return await userManager.Users
            .Where(u => ids.Contains(u.Id))
            .Select(u => new UserDTO
            {
                Id = u.Id,
                UserName = u.UserName!,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync();
    }

    public async Task<UserProfileResponseDTO?> GetUserProfileAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user == null ? null : MapToProfileDto(user);
    }

    public async Task<(UserProfileResponseDTO Profile, bool UserNameChanged)> UpdateUserProfileAsync(
        string userId,
        UpdateProfileRequestDTO request,
        Stream? avatarStream,
        string? fileName,
        string? contentType)
    {
        var user = await userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found");
        var userNameChanged = false;

        if (!string.IsNullOrWhiteSpace(request.UserName) && request.UserName.Trim() != user.UserName)
        {
            var taken = await userManager.FindByNameAsync(request.UserName.Trim());
            if (taken != null && taken.Id != userId)
                throw new ArgumentException("This nickname is already taken");

            var setName = await userManager.SetUserNameAsync(user, request.UserName.Trim());
            if (!setName.Succeeded)
                throw new ArgumentException(string.Join(", ", setName.Errors.Select(e => e.Description)));

            userNameChanged = true;
            user = (await userManager.FindByIdAsync(userId))!;
        }

        if (request.FirstName != null)
            user.FirstName = request.FirstName.Trim();
        if (request.LastName != null)
            user.LastName = request.LastName.Trim();

        if (avatarStream is { Length: > 0 })
        {
            var url = await cloudinarySerice.UploadAvatarAsync(new UploadMediaRequestDTO
            {
                FileStream = avatarStream,
                FileName = string.IsNullOrWhiteSpace(fileName) ? "avatar" : fileName!,
                ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType!
            });
            user.AvatarUrl = url;
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;
        var update = await userManager.UpdateAsync(user);
        if (!update.Succeeded)
            throw new InvalidOperationException(string.Join(", ", update.Errors.Select(e => e.Description)));

        return (MapToProfileDto(user), userNameChanged);
    }

    public async Task ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found");
        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
            throw new ArgumentException(string.Join(" ", result.Errors.Select(e => e.Description)));
    }

    public async Task<IReadOnlyDictionary<string, (bool ShareOnlineStatus, DateTimeOffset? LastSeenAt)>> GetUserPresenceFieldsByIdsAsync(
        IEnumerable<string> userIds,
        CancellationToken cancellationToken = default)
    {
        var ids = userIds.Distinct().ToList();
        if (ids.Count == 0)
            return new Dictionary<string, (bool, DateTimeOffset?)>();

        return await userManager.Users
            .AsNoTracking()
            .Where(u => ids.Contains(u.Id))
            .ToDictionaryAsync(
                u => u.Id,
                u => (u.ShareOnlineStatus, u.LastSeenAt),
                cancellationToken);
    }

    public async Task<UserProfileResponseDTO> UpdateShareOnlineStatusAsync(
        string userId,
        bool shareOnlineStatus,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found");
        user.ShareOnlineStatus = shareOnlineStatus;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        var update = await userManager.UpdateAsync(user);
        if (!update.Succeeded)
            throw new InvalidOperationException(string.Join(", ", update.Errors.Select(e => e.Description)));

        user = await userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found");
        return MapToProfileDto(user);
    }

    private static UserProfileResponseDTO MapToProfileDto(AppUser user) => new()
    {
        Id = user.Id,
        UserName = user.UserName ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email ?? string.Empty,
        PhoneNumber = user.PhoneNumber,
        AvatarUrl = user.AvatarUrl,
        CreatedAt = user.CreatedAt,
        ShareOnlineStatus = user.ShareOnlineStatus,
        LastSeenAt = user.LastSeenAt
    };

    public async Task<IEnumerable<ParticipantDTO>> SearchUsersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return Enumerable.Empty<ParticipantDTO>();

        var normalizedQuery = query.ToUpperInvariant();

        return await userManager.Users
            .Where(u => u.NormalizedUserName!.Contains(normalizedQuery) || u.NormalizedEmail!.Contains(normalizedQuery))
            .Take(10)
            .Select(u => new ParticipantDTO
            {
                UserId = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync();
    }
}


