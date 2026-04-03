using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using TextMe.Config;
using TextMe.Models;
using TextMe.Services.Interfaces;

public class AccountRecoveryService : IAccountRestoreService
{
    private readonly MailConfig mailConfig;
    private readonly IMemoryCache cache;
    private readonly UserManager<AppUser> userManager;

    public AccountRecoveryService(
        IOptions<MailConfig> _mailConfig,
        IMemoryCache memoryCache,
        UserManager<AppUser> _userManager)
    {
        mailConfig = _mailConfig.Value;
        cache = memoryCache;
        userManager = _userManager;
    }

    public async Task SendRecoveryEmail(string email)
    {
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
        {
            return Task.FromResult(storedCode == code);
        }
        return Task.FromResult(false);
    }

    public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
    {
        if (!cache.TryGetValue(email, out string storedCode) || storedCode != code)
            return false;

        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            return false;

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        var result = await userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
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