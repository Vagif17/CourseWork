using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TextMe.DTO_S;
using TextMe.Services.Classes;
using TextMe.Services.Interfaces;

namespace TextMe.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class MessageController : ControllerBase
{
    private readonly IMessageService messageService;
    private readonly ICloudinaryService cloudinaryService;

    public MessageController(IMessageService _messageService, ICloudinaryService _cloudinaryService)
    {
        messageService = _messageService;
        cloudinaryService = _cloudinaryService;
    }

    [HttpGet("{chatId}")]
    public async Task<IActionResult> GetChatMessages(int chatId)
    {
        Console.WriteLine($"Getting messages for chat {chatId}");
        var messages = await messageService.GetChatMessagesAsync(chatId);
        Console.WriteLine($"Found {messages.Count()} messages");
        return Ok(messages);
    }




    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<string>> Upload([FromForm] UploadFileRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest("File is required");

        var url = await cloudinaryService.UploadAvatarAsync(request.File);

        return Ok(url);
    }
}
