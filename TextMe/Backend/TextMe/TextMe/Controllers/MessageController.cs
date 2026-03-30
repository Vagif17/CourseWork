using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TextMe.Services.Interfaces;

namespace TextMe.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class MessageController : ControllerBase
{
    private readonly IMessageService messageService;

    public MessageController(IMessageService _messageService)
    {
        messageService = _messageService;
    }

    [HttpGet("{chatId}")]
    public async Task<IActionResult> GetChatMessages(int chatId)
    {
        Console.WriteLine($"Getting messages for chat {chatId}");
        var messages = await messageService.GetChatMessagesAsync(chatId);
        Console.WriteLine($"Found {messages.Count()} messages");
        return Ok(messages);
    }
}
