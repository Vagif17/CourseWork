namespace TextMe.Services.Interfaces;

public interface IAccountRestoreService
{
    public Task SendRecoveryEmail(string email);
    public Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
    public Task<bool> VerifyCode(string email, string code);

}

