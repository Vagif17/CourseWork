using Domain;

namespace Application.Interfaces.Services;

public interface IJwtTokenSerivce
{
    public Task<(string AccessToken, DateTimeOffset ExpiresAt)> GenerateAccessTokenAsync(string userId, string name ,string email, IList<string> roles);
    public Task<(RefreshToken Entity, string Jwt)> CreateRefreshTokenAsync(string userId);
    public (string UserId, string Jti) ValidateRefreshTokenAndGetJti(string refreshJwt, bool validateLifetime = true);
    public string GetJtiFromRefreshToken(string refreshJwt);
}
