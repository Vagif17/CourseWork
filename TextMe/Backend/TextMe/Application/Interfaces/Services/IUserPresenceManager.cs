namespace Application.Interfaces.Services;

public interface IUserPresenceManager
{
    public Task HandleUserConnectedAsync(string userId, string connectionId);
    public Task HandleUserDisconnectedAsync(string userId, string connectionId);
}
