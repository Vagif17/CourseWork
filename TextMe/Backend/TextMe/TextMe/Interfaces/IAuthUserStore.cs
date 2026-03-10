using TextMe.DTOs;

namespace TextMe.Interfaces;

public interface IAuthUserStore
{
    public Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId);
    public Task<string?> GetEmailAsync(string userId);
    public Task<IList<string>> GetRolesAsync(string userId);
    public Task<bool> CheckPasswordAsync(string userId, string password);
    public Task<string> CreateUserAsync(RegisterRequestDTO request);
    public Task AddToRoleAsync(string userId, string role);
}
