using Application.DTOs;

namespace Application.Interfaces.Services;

public interface IProfileService
{
    Task<UserProfileResponseDTO?> GetProfileAsync(string userId, CancellationToken cancellationToken = default);
    Task<ProfileUpdateResultDTO> UpdateProfileAsync(
        string userId,
        UpdateProfileRequestDTO request,
        Stream? avatarStream,
        string? fileName,
        string? contentType,
        CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(string userId, ChangePasswordRequestDTO request, CancellationToken cancellationToken = default);

    Task<UserProfileResponseDTO> UpdatePrivacyAsync(string userId, UpdatePrivacyRequestDTO request, CancellationToken cancellationToken = default);
}
