using Application.DTOs;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Interfaces.Stores;
using Application.Services.Interfaces;

namespace Application.Services.Classes;

public class AuthService : IAuthService
{
    private readonly IUserStore UserStore;
    private readonly IJwtTokenSerivce jwtTokenService;
    private readonly IRefreshTokenRepository refreshTokenRepository;

    public AuthService(IUserStore _userStore, IJwtTokenSerivce _jwtTokenService, IRefreshTokenRepository _refreshTokenRepository)
    {
        UserStore = _userStore;
        jwtTokenService = _jwtTokenService;
        refreshTokenRepository = _refreshTokenRepository;
    }

    public async Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO registerRequest)
    {
        if (await UserStore.FindUserIdByEmailOrIdAsync(registerRequest.Email) is not null)
            throw new ArgumentException("User with this email already exists");

        if (await UserStore.FindUserIdByEmailOrPhoneAsync(registerRequest.PhoneNumber) is not null)
            throw new ArgumentException("User with this phone number already exists");

        var userId = await UserStore.CreateUserAsync(registerRequest);
        await UserStore.AddToRoleAsync(userId, "User");

        return await GenerateTokensAsync(userId, registerRequest.Email);
    }

    public async Task<AuthResponseDTO> LoginAsync(LoginRequestDTO loginRequest)
    {
        var userId = await UserStore.FindUserIdByEmailOrIdAsync(loginRequest.Email);
        if (userId is null || !await UserStore.CheckPasswordAsync(userId, loginRequest.Password))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await GenerateTokensAsync(userId, loginRequest.Email);
    }

    public async Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenRequestDTO request)
    {
        var (userId, oldJti) = jwtTokenService.ValidateRefreshTokenAndGetJti(request.RefreshToken);

        var oldToken = await refreshTokenRepository.GetByJwtIdAsync(oldJti);

        if (oldToken == null || !oldToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token has been revoked or expired");

        oldToken.RevokedAt = DateTime.UtcNow;

        var (newRefreshEntity, newRefreshJwt) = await jwtTokenService.CreateRefreshTokenAsync(userId);

        await refreshTokenRepository.UpdateAsync(oldToken);

        var roles = await UserStore.GetRolesAsync(userId);
        var userName = await UserStore.GetUserNameAsync(userId);
        var userEmail = await UserStore.GetEmailAsync(userId);

        var (accessToken, expiresAt) = await jwtTokenService.GenerateAccessTokenAsync(userId, userName, userEmail, roles);

        return new AuthResponseDTO
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshJwt,
            RefreshTokenExpiresAt = newRefreshEntity.ExpiresAt,
            ExpiresAt = expiresAt,
            UserName = userName,
            Email = userEmail,
            Roles = roles
        };
    }

    public async Task<AuthResponseDTO> IssueTokensForUserAsync(string userId)
    {
        var email = await UserStore.GetEmailAsync(userId);
        return await GenerateTokensAsync(userId, email);
    }

    public async Task RevokeRefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest)
    {
        string jti;
        try
        {
            var result =  jwtTokenService.ValidateRefreshTokenAndGetJti(
                refreshTokenRequest.RefreshToken,
                validateLifetime: false
            );
            jti = result.Item2; 
        }
        catch
        {
            return;
        }

        var storedToken = await refreshTokenRepository.GetByJwtIdAsync(jti);
        if (storedToken == null || !storedToken.IsActive) return;

        storedToken.RevokedAt = DateTime.UtcNow;
        await refreshTokenRepository.UpdateAsync(storedToken);
    }

    private async Task<AuthResponseDTO> GenerateTokensAsync(string userId, string? email)
    {
        var userName = await UserStore.GetUserNameAsync(userId) ?? "User";
        var avatarUrl = await UserStore.GetAvatarUrlAsync(userId);
        var roles = await UserStore.GetRolesAsync(userId);

        var (accessToken, expiresAt) = await jwtTokenService.GenerateAccessTokenAsync(userId, userName, email, roles);
        var (refreshEntity, refreshJwt) = await jwtTokenService.CreateRefreshTokenAsync(userId);

        return new AuthResponseDTO
        {
            AccessToken = accessToken,
            ExpiresAt = expiresAt,
            RefreshToken = refreshJwt,
            RefreshTokenExpiresAt = refreshEntity.ExpiresAt,
            Email = email ?? "",
            Roles = roles,
            UserName = userName,
            AvatarUrl = avatarUrl
        };
    }
}