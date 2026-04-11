namespace Application.Interfaces.Services;

/// <summary>In-memory SignalR connection tracking (implemented in Infrastructure).</summary>
public interface IUserPresenceService
{
    void RegisterConnection(string userId, string connectionId);
    void UnregisterConnection(string userId, string connectionId);
    bool IsOnline(string userId);
}
