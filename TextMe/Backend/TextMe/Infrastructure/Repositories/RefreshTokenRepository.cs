using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Domain;
using Application.Interfaces.Repositories;

namespace TextMe.Repositories.Classes;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly TextMeDbContext context;

    public RefreshTokenRepository(TextMeDbContext context) => this.context = context;

    public async Task<RefreshToken> AddAsync(RefreshToken refreshToken)
    {
        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync();
        return refreshToken;
    }

    public async Task<RefreshToken?> GetByJwtIdAsync(string jwtId) =>
        await context.RefreshTokens.FirstOrDefaultAsync(rt => rt.JwtId == jwtId);

    public async Task UpdateAsync(RefreshToken refreshToken)
    {
        context.RefreshTokens.Update(refreshToken);
        await context.SaveChangesAsync();
    }
}