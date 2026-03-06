using Application.DTOs;
using Application.Interfaces;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Identity.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Classes;

public class UserService : IUserService
{
    private readonly IUserStore userStore;
    private readonly IJwtTokenService jwtTokenService;
    private readonly IRefreshTokenRepository refreshTokenRepository;

    public UserService(IUserStore _userStore,IJwtTokenService _jwtTokenService, IRefreshTokenRepository _refreshTokenRepository)
    {
        userStore = _userStore;
        jwtTokenService = _jwtTokenService;
        refreshTokenRepository = _refreshTokenRepository;
    }


    public async Task<UserResponseDTO> LoginAsync(LoginUserRequestDTO loginRequest)
    {
        var userId = await userStore.FindUserIdByEmailOrIdAsync(loginRequest.Email);

        if (userId is null) 
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!await userStore.CheckPasswordAsync(userId, loginRequest.Password))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await GenerateTokensAsync(userId, loginRequest.Email);
    }

    public async Task<UserResponseDTO> RegisterAsync(RegisterUserRequestDTO registerRequest)
    {
        if (await userStore.FindUserIdByEmailOrIdAsync(registerRequest.Email) is not null)
            throw new InvalidOperationException("User with this email already exists.");

        var userId = await userStore.CreateUserAsync(registerRequest);
        await userStore.AddToRoleAsync(userId, "User");

        return await GenerateTokensAsync(userId, registerRequest.Email);
    }

    public async Task<bool> UpdatePasswordAsync(UpdatePasswordRequest updatePasswordRequest)
    {
        var userId = await userStore.FindUserIdByEmailOrIdAsync(updatePasswordRequest.Email);

        if (userId is null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!await userStore.CheckPasswordAsync(userId, updatePasswordRequest.Password))
            throw new UnauthorizedAccessException("Invalid email or password.");

        await userStore.UpdatePasswordAsync(updatePasswordRequest);

        return true;
    }

    public async Task<bool> UpdateProfileAsync(UpdateProfileRequest updateProfileRequest)
    {
        var userId = await userStore.FindUserIdByEmailOrIdAsync(updateProfileRequest.Email);

        if (userId is null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!await userStore.CheckPasswordAsync(userId, updateProfileRequest.Password))
            throw new UnauthorizedAccessException("Invalid email or password.");

        await userStore.UpdateProfileAsync(updateProfileRequest);

        return true;
    }



    public async Task<UserResponseDTO> RefreshTokenAsync(RefreshTokenRequest refreshTokenRequest)
    {
        var (userId, jti) = jwtTokenService.ValidateRefreshTokenAndGetJti(refreshTokenRequest.RefreshToken);

        var storedToken = await refreshTokenRepository.GetByJwtIdAsync(jti);
        if (storedToken is null)
            throw new UnauthorizedAccessException("Invalid refresh token");
        if (!storedToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token has been revoked or expired");

        storedToken.RevokedAt = DateTime.UtcNow;

        var email = await userStore.GetEmailAsync(userId);
        var newTokens = await GenerateTokensAsync(userId, email);
        var newJti = jwtTokenService.GetJtiFromRefreshToken(newTokens.RefreshToken);
        var newStoredToken = string.IsNullOrEmpty(newJti) ? null : await refreshTokenRepository.GetByJwtIdAsync(newJti);
        if (newStoredToken is not null)
            storedToken.ReplacedByJwtId = newStoredToken.JwtId;

        await refreshTokenRepository.UpdateAsync(storedToken);
        return newTokens;
    }

    public async Task RevokeRefreshTokenAsync(RefreshTokenRequest refreshTokenRequest)
    {
        string jti;
        try
        {
            (_, jti) = jwtTokenService.ValidateRefreshTokenAndGetJti(refreshTokenRequest.RefreshToken, validateLifetime: false);
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

    private async Task<UserResponseDTO> GenerateTokensAsync(string userId, string? email)
    {
        var roles = await userStore.GetRolesAsync(userId);
        var (accessToken, expiresAt) = await jwtTokenService.GenerateAccessTokenAsync(userId, email ?? "", roles);
        var (refreshEntity, refreshJwt) = await jwtTokenService.CreateRefreshTokenAsync(userId);

        return new UserResponseDTO
        {
            AccessToken = accessToken,
            ExpiredAt = expiresAt,
            RefreshToken = refreshJwt,
            RefreshTokenExpiredAt = refreshEntity.ExpiresAt,
            Email = email ?? "",
            Roles = roles
        };
    }
}
