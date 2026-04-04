using Application.Config;
using Application.Interfaces.Repositories;
using Application.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;

namespace Application.Services.Classes;

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

        MailMessage mail = new MailMessage();
        mail.From = new MailAddress(mailConfig.SenderEmail);
        mail.To.Add(email);
        mail.Subject = "Restore TextMe Account";
        mail.Body = MailTemplates.VerificationCodeTemplate(verifyCode);
        mail.IsBodyHtml = true;

        using SmtpClient smtp = new SmtpClient(mailConfig.SmtpHost, mailConfig.Port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(mailConfig.SenderEmail, mailConfig.Password)
        };

        await smtp.SendMailAsync(mail);
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