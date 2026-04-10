namespace Application.Interfaces.Notifications;

public interface IChatNotification
{
    public Task NotifyNewChatAsync(string user1Id, string user2Id, object chatDto);

}
