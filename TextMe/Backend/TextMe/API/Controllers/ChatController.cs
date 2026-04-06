using Application.DTOs;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatController : ControllerBase
{
    private readonly IChatService chatService;

    public ChatController(IChatService _chatService)
    {
        chatService = _chatService;
    }


    [HttpPost("createchat")]
    public async Task<ActionResult<PrivateChatResponseDTO>> CreateChat(string emailOrNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var chat = await chatService.CreateChatAsync(userId!, emailOrNumber);
        return Ok(chat);
    }


    [HttpGet("getallmyprivatechats")]
    public async Task<ActionResult<IEnumerable<PrivateChatResponseDTO>>> GetAllPrivateChats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Ok(await chatService.GetAllPrivateChatsAsync(userId));
    }

}
