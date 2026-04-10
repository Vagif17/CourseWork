using Application.Interfaces.Notifications;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Notifications;
public class ChatNotification : IChatNotification
{
    private readonly IHubContext<ChatHub> hubContext;

    public ChatNotification(IHubContext<ChatHub> _hubContext)
    {
        hubContext = _hubContext;
    }

    public async Task NotifyNewChatAsync(string user1Id, string user2Id, object chatDto)
    {
        await hubContext.Clients
            .Users(user1Id, user2Id)
            .SendAsync("ReceiveNewChat", chatDto);
    }
}
