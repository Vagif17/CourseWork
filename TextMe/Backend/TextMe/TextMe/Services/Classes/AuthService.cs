using TextMe.DTOs;
using TextMe.Identities;
using TextMe.Identities.Interfaces;
using TextMe.Repositories.Classes;
using TextMe.Repositories.Interfaces;
using TextMe.Services.Interfaces;

namespace TextMe.Services.Classes;

public class AuthService : IAuthService
{
    private readonly IUserStore UserStore;
    private readonly IJwtTokenSerivce jwtTokenSerivce;
    private readonly IRefreshTokenRepository refreshTokenRepository;
    public AuthService(IUserStore _userStore,IJwtTokenSerivce _jwtTokenSerivce,IRefreshTokenRepository _refreshTokenRepository)

    {
        UserStore = _userStore;
        jwtTokenSerivce = _jwtTokenSerivce;
        refreshTokenRepository = _refreshTokenRepository;
    }


    public async Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO registerRequest)
    {
        if (await UserStore.FindUserIdByEmailOrIdAsync(registerRequest.Email) is not null)
            throw new ArgumentException("User with this email  already exist");

        if (await UserStore.FindUserIdByEmailOrPhoneAsync(registerRequest.PhoneNumber) is not null)
            throw new ArgumentException("User with this phone number already exist");


            var userId = await UserStore.CreateUserAsync(registerRequest);

        await UserStore.AddToRoleAsync(userId, "User");

        return await GenerateTokensAsync(userId, registerRequest.Email);
    }

    public async Task<AuthResponseDTO> LoginAsync(LoginRequestDTO loginRequest)
    {
        var userId = await UserStore.FindUserIdByEmailOrIdAsync(loginRequest.Email);
        if (userId is null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!await UserStore.CheckPasswordAsync(userId, loginRequest.Password))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var roles = await UserStore.GetRolesAsync(userId);

        return await GenerateTokensAsync(userId, loginRequest.Email);
    }

    public async Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest)
    {
        if (refreshTokenRequest == null || string.IsNullOrEmpty(refreshTokenRequest.RefreshToken))
            throw new UnauthorizedAccessException("Refresh token is missing");

        string userId;
        string jti;

        try
        {
            (userId, jti) = jwtTokenSerivce.ValidateRefreshTokenAndGetJti(refreshTokenRequest.RefreshToken);
        }
        catch
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        var storedToken = await refreshTokenRepository.GetByJwtIdAsync(jti);
        if (storedToken is null || !storedToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token has been revoked or expired");

        storedToken.RevokedAt = DateTime.UtcNow;

        var email = await UserStore.GetEmailAsync(userId);
        var newTokens = await GenerateTokensAsync(userId, email);

        var newJti = jwtTokenSerivce.GetJtiFromRefreshToken(newTokens.RefreshToken);
        var newStoredToken = string.IsNullOrEmpty(newJti) ? null : await refreshTokenRepository.GetByJwtIdAsync(newJti);
        if (newStoredToken is not null)
            storedToken.ReplacedByJwtId = newStoredToken.JwtId;

        await refreshTokenRepository.UpdateAsync(storedToken);

        return newTokens;
    }

    public async Task RevokeRefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest)
    {
        string jti;
        try
        {
            (_, jti) = jwtTokenSerivce.ValidateRefreshTokenAndGetJti(refreshTokenRequest.RefreshToken, validateLifetime: false);
        }
        catch
        {
            return;
        }

        var storedToken = await refreshTokenRepository.GetByJwtIdAsync(jti);
        if (storedToken is null || !storedToken.IsActive) return;

        storedToken.RevokedAt = DateTime.UtcNow;
        await refreshTokenRepository.UpdateAsync(storedToken);
    }

    private async Task<AuthResponseDTO> GenerateTokensAsync(string userId, string? email)
    {
        var roles = await UserStore.GetRolesAsync(userId);

        var userName = await UserStore.GetUserNameAsync(userId);
        var avatarUrl = await UserStore.GetAvatarUrlAsync(userId);

        var (accessToken, expiresAt) = await jwtTokenSerivce.GenerateAccessTokenAsync(userId, userName, email, roles);
        var (refreshEntity, refreshJwt) = await jwtTokenSerivce.CreateRefreshTokenAsync(userId);

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
