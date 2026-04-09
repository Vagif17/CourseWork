using Application.DTOs;
using Application.Features.Chats.Commands;
using Application.Features.Chats.Queries;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatController : ControllerBase
{
    private readonly IMediator mediator;

    public ChatController(IMediator _mediator)
    {
        mediator = _mediator;
    }


    [HttpPost("createchat")]
    public async Task<ActionResult<PrivateChatResponseDTO>> CreateChat(string emailOrNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var chat = await mediator.Send(new CreateChatCommand(userId,emailOrNumber));
        return Ok(chat);
    }


    [HttpGet("getallmyprivatechats")]
    public async Task<ActionResult<IEnumerable<PrivateChatResponseDTO>>> GetAllPrivateChats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Ok(await mediator.Send(new GetPrivateChatsQuery(userId)));
    }

}
