namespace Application.Interfaces.Services;

/// <summary>In-memory SignalR connection tracking (implemented in Infrastructure).</summary>
public interface IUserPresenceService
{
    public void RegisterConnection(string userId, string connectionId);
    public void UnregisterConnection(string userId, string connectionId);
    public bool IsOnline(string userId);
}
