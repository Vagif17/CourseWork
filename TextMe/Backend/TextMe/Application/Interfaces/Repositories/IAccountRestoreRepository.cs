namespace Application.Interfaces.Repositories;

public interface IAccountRestoreRepository
{
    Task<string?> GeneratePasswordResetTokenAsync(string email);
    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    Task<bool> ExistsByEmailAsync(string email);
}