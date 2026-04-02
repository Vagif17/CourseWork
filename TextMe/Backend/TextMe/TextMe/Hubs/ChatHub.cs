using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;
using System.Security.Claims;
using TextMe.Services.Interfaces;

namespace TextMe.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly IMessageService messageService;

    public ChatHub(IMessageService _messageService)
    {
        messageService = _messageService;
    }



    public async Task JoinChat(int chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task LeaveChat(int chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

   public async Task SendMessage(int chatId, string? text, string? mediaUrl, string? mediaType)
{
    var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (userId == null)
        throw new HubException("Unauthorized");

    var message = await messageService.CreateMessageAsync(chatId, userId, text, mediaUrl, mediaType);

    await Clients.Group($"chat-{chatId}")
        .SendAsync("ReceiveMessage", message);
}
}