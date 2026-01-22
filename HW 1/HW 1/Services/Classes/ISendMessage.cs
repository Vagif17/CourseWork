namespace HW_1.Services.Classes;

public interface ISendMessage
{
    public Task SendEmailAsync(string email, string text);
}
