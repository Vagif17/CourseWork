using Application.DTOs;
using Application.Features.Chats.Commands;
using Application.Features.Chats.Queries;
using Application.Interfaces.Repositories;
using Application.Services.Interfaces;
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
    private readonly ICloudinaryService cloudinaryService;
    private readonly IChatRepository chatRepository;

    public ChatController(IMediator _mediator, ICloudinaryService _cloudinaryService, IChatRepository _chatRepository)
    {
        mediator = _mediator;
        cloudinaryService = _cloudinaryService;
        chatRepository = _chatRepository;
    }

    [HttpPost("createchat")]
    public async Task<ActionResult<ChatDTO>> CreateChat(string emailOrNumber)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var chat = await mediator.Send(new CreateChatCommand(userId, emailOrNumber));
        return Ok(chat);
    }

    [HttpGet("getallmyprivatechats")]
    public async Task<ActionResult<IEnumerable<ChatDTO>>> GetAllPrivateChats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(await mediator.Send(new GetPrivateChatsQuery(userId)));
    }

    [HttpPost("creategroup")]
    public async Task<ActionResult<ChatDTO>> CreateGroupChat([FromForm] CreateGroupRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        string? avatarUrl = null;
        if (request.File != null)
        {
            avatarUrl = await cloudinaryService.UploadAvatarAsync(new UploadMediaRequestDTO
            {
                FileStream = request.File.OpenReadStream(),
                FileName = request.File.FileName,
                ContentType = request.File.ContentType
            });
        }

        var chat = await mediator.Send(new CreateGroupChatCommand(
            request.Name, 
            request.ParticipantIds, 
            userId!, 
            avatarUrl));
        return Ok(chat);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChat(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var isParticipant = await chatRepository.IsUserParticipantInChatAsync(id, userId);
        if (!isParticipant) return Forbid();

        await chatRepository.DeleteChatAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/leave")]
    public async Task<IActionResult> LeaveGroup(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var isParticipant = await chatRepository.IsUserParticipantInChatAsync(id, userId);
        if (!isParticipant) return Forbid();

        await chatRepository.RemoveParticipantAsync(id, userId);
        return Ok();
    }
}

public record CreateGroupRequest(string Name, List<string> ParticipantIds, IFormFile? File);
