using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces;

public interface IJwtTokenService
{
    public Task<(string AccessToken, DateTimeOffset ExpiresAt)> GenerateAccessTokenAsync(string userId, string email, IList<string> roles);
    public Task<(RefreshToken Entity, string Jwt)> CreateRefreshTokenAsync(string userId);
    public (string UserId, string Jti) ValidateRefreshTokenAndGetJti(string refreshJwt, bool validateLifetime = true);
    public string GetJtiFromRefreshToken(string refreshJwt);
}
