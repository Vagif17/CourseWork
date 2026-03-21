using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TextMe.DTO_S;
using TextMe.DTOs;
using TextMe.Models;
using TextMe.Services.Interfaces;

namespace TextMe.Controllersl;

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
    public async Task<ActionResult<bool>> CreateChat(string emailOrNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return await chatService.CreateChatAsync(userId!, emailOrNumber)
            != null;
    }


    [HttpGet("getallmyprivatechats")]
    public async Task<ActionResult<IEnumerable<PrivateChatDTOResponse>>> GetAllPrivateChats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Ok(await chatService.GetAllPrivateChatsAsync(userId));
    }

}
