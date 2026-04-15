using Domain;

namespace Application.Interfaces.Repositories;

public interface IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByJwtIdAsync(string jwtId);
    public Task<RefreshToken> AddAsync(RefreshToken refreshToken);
    public Task UpdateAsync(RefreshToken refreshToken);
}
