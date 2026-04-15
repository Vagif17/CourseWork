using System.Collections.Concurrent;
using Application.Interfaces.Services;

namespace Infrastructure.Services;

public class UserPresenceService : IUserPresenceService
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _connections = new();

    public void RegisterConnection(string userId, string connectionId)
    {
        var set = _connections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        set[connectionId] = 0;
    }

    public void UnregisterConnection(string userId, string connectionId)
    {
        if (!_connections.TryGetValue(userId, out var set))
            return;
        set.TryRemove(connectionId, out _);
        if (set.IsEmpty)
            _connections.TryRemove(userId, out _);
    }

    public bool IsOnline(string userId) =>
        _connections.TryGetValue(userId, out var set) && !set.IsEmpty;
}
