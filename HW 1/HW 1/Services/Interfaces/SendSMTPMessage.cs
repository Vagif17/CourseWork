using HW_1.Services.Classes;
using System.Net.Mail;

namespace HW_1.Services.Interfaces;

public class SendSMTPMessage : ISendMessage
{
    public async Task SendEmailAsync(string email, string text)
    {
        MailMessage mail = new MailMessage();
        mail.From = new MailAddress("step.projects.email@gmail.com");
        mail.To.Add(email);
        mail.Subject = "Home Work";
        mail.Body= text;
        mail.IsBodyHtml = false;


        SmtpClient smtpClient = new SmtpClient("smtp.gmail.com");
        smtpClient.Port = 587;
        smtpClient.EnableSsl = true;
        smtpClient.Credentials = new System.Net.NetworkCredential("step.projects.email@gmail.com", "qlgrhxyjzpeqwihx");

        await smtpClient.SendMailAsync(mail);
         
    }
}

