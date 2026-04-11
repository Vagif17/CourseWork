using Application.DTOs;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Interfaces.Stores;
using Application.Services.Interfaces;

namespace Application.Services.Classes;

public class ProfileService : IProfileService
{
    private readonly IUserStore userStore;
    private readonly IAuthService authService;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;
    private readonly IUserPresenceService presenceService;

    public ProfileService(
        IUserStore userStore,
        IAuthService authService,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier,
        IUserPresenceService presenceService)
    {
        this.userStore = userStore;
        this.authService = authService;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
        this.presenceService = presenceService;
    }

    public Task<UserProfileResponseDTO?> GetProfileAsync(string userId, CancellationToken cancellationToken = default)
        => userStore.GetUserProfileAsync(userId);

    public async Task<ProfileUpdateResultDTO> UpdateProfileAsync(
        string userId,
        UpdateProfileRequestDTO request,
        Stream? avatarStream,
        string? fileName,
        string? contentType,
        CancellationToken cancellationToken = default)
    {
        var (profile, userNameChanged) = await userStore.UpdateUserProfileAsync(
            userId,
            request,
            avatarStream,
            fileName,
            contentType);

        AuthResponseDTO? newTokens = null;
        if (userNameChanged)
            newTokens = await authService.IssueTokensForUserAsync(userId);

        return new ProfileUpdateResultDTO
        {
            Profile = profile,
            NewTokens = newTokens
        };
    }

    public Task ChangePasswordAsync(string userId, ChangePasswordRequestDTO request, CancellationToken cancellationToken = default)
        => userStore.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

    public async Task<UserProfileResponseDTO> UpdatePrivacyAsync(
        string userId,
        UpdatePrivacyRequestDTO request,
        CancellationToken cancellationToken = default)
    {
        var profile = await userStore.UpdateShareOnlineStatusAsync(userId, request.ShareOnlineStatus, cancellationToken);

        var partners = await chatRepository.GetDistinctPrivateChatPartnerIdsAsync(userId);
        if (partners.Count == 0)
            return profile;

        var dto = new UserPresenceSocketDto
        {
            UserId = userId,
            PresenceHidden = !profile.ShareOnlineStatus,
            IsOnline = profile.ShareOnlineStatus ? presenceService.IsOnline(userId) : null,
            LastSeenAt = profile.ShareOnlineStatus && !presenceService.IsOnline(userId) ? profile.LastSeenAt : null
        };

        await messageRealtimeNotifier.NotifyUserPresenceAsync(partners, dto);
        return profile;
    }
}
