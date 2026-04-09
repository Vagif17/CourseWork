using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Application.Services.Interfaces;
using MediatR;
using Application.Features.Messages.Commands;

namespace Infrastructure.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly IMediator mediator;

    public ChatHub(IMediator _mediator)
    {
        mediator = _mediator;
    }

    public async Task JoinChat(int chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task LeaveChat(int chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task SendMessage(
    int chatId,
    string? text,
    string? mediaUrl,
    string? mediaType,
    int? audioDuration)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            throw new HubException("Unauthorized");

        var message = await mediator.Send(new CreateMessageCommand(
            chatId,
            userId,
            text,
            mediaUrl,
            mediaType,
            audioDuration
        ));

        await Clients.Group($"chat-{chatId}")
            .SendAsync("ReceiveMessage", message);
    }
}