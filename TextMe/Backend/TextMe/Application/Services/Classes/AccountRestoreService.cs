using Application.Config;
using Application.Interfaces.Repositories;
using Application.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net.Mail;
using System.Security.Cryptography;

namespace Infrastructure.Services;

public class AccountRecoveryService : IAccountRestoreService
{
    private readonly MailConfig mailConfig;
    private readonly IMemoryCache cache;
    private readonly IAccountRestoreRepository accountRestoreRepository;

    public AccountRecoveryService(IOptions<MailConfig> _mailConfig, IMemoryCache _memoryCache, IAccountRestoreRepository _accountRestoreRepository)
    {
        mailConfig = _mailConfig.Value;
        cache = _memoryCache;
        accountRestoreRepository = _accountRestoreRepository;
    }

    public async Task SendRecoveryEmail(string email)
    {
        if (!await accountRestoreRepository.ExistsByEmailAsync(email))
            return;

        string verifyCode = GenerateVerificationCode();
        cache.Set(email, verifyCode, TimeSpan.FromMinutes(5));

        var client = new SendGridClient(mailConfig.ApiKey);
        var from = new EmailAddress(mailConfig.SenderEmail, "Text Me Messenger");
        var to = new EmailAddress(email);
        var subject = "Restore TextMe Account";
        var htmlContent = MailTemplates.VerificationCodeTemplate(verifyCode);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent: null, htmlContent);

        var response = await client.SendEmailAsync(msg);
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to send email: {response.StatusCode}");
        }
    }

    public Task<bool> VerifyCode(string email, string code)
    {
        if (cache.TryGetValue(email, out string storedCode))
            return Task.FromResult(storedCode == code);
        return Task.FromResult(false);
    }

    public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
    {
        if (!cache.TryGetValue(email, out string storedCode) || storedCode != code)
            return false;

        var token = await accountRestoreRepository.GeneratePasswordResetTokenAsync(email);
        if (token == null)
            return false;

        var success = await accountRestoreRepository.ResetPasswordAsync(email, token, newPassword);
        if (!success)
            return false;

        cache.Remove(email);
        return true;
    }

    private string GenerateVerificationCode()
    {
        var code = "";
        for (int i = 0; i < 6; i++)
        {
            code += RandomNumberGenerator.GetInt32(0, 10);
        }
        return code;
    }
}