using Application.DTOs;

namespace Application.Interfaces.Services;

public interface IProfileService
{
    public Task<UserProfileResponseDTO?> GetProfileAsync(string userId, CancellationToken cancellationToken = default);
    public Task<ProfileUpdateResultDTO> UpdateProfileAsync(
        string userId,
        UpdateProfileRequestDTO request,
        Stream? avatarStream,
        string? fileName,
        string? contentType,
        CancellationToken cancellationToken = default);
    public Task ChangePasswordAsync(string userId, ChangePasswordRequestDTO request, CancellationToken cancellationToken = default);

    public Task<UserProfileResponseDTO> UpdatePrivacyAsync(string userId, UpdatePrivacyRequestDTO request, CancellationToken cancellationToken = default);
}
