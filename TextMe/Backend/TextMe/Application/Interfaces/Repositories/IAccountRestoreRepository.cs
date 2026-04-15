namespace Application.Interfaces.Repositories;

public interface IAccountRestoreRepository
{
    public Task<string?> GeneratePasswordResetTokenAsync(string email);
    public Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    public Task<bool> ExistsByEmailAsync(string email);
}