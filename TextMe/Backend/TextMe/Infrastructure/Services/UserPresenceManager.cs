using Application.DTOs;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain;
using Infrastructure;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services;

public class UserPresenceManager : IUserPresenceManager
{
    private readonly IUserPresenceService presenceService;
    private readonly UserManager<AppUser> userManager;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;

    public UserPresenceManager(
        IUserPresenceService presenceService,
        UserManager<AppUser> userManager,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier)
    {
        this.presenceService = presenceService;
        this.userManager = userManager;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
    }

    public async Task HandleUserConnectedAsync(string userId, string connectionId)
    {
        presenceService.RegisterConnection(userId, connectionId);

        var user = await userManager.FindByIdAsync(userId);
        if (user?.ShareOnlineStatus != true)
            return;

        var partners = await chatRepository.GetDistinctPrivateChatPartnerIdsAsync(userId);
        if (partners.Count == 0)
            return;

        await messageRealtimeNotifier.NotifyUserPresenceAsync(partners, new UserPresenceSocketDTO
        {
            UserId = userId,
            PresenceHidden = false,
            IsOnline = true,
            LastSeenAt = null
        });
    }

    public async Task HandleUserDisconnectedAsync(string userId, string connectionId)
    {
        presenceService.UnregisterConnection(userId, connectionId);
        
        if (!presenceService.IsOnline(userId))
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user != null)
            {
                var now = DateTimeOffset.UtcNow;
                user.LastSeenAt = now;
                user.UpdatedAt = now;
                await userManager.UpdateAsync(user);
                
                if (user.ShareOnlineStatus)
                {
                    var partners = await chatRepository.GetDistinctPrivateChatPartnerIdsAsync(userId);
                    if (partners.Count > 0)
                    {
                        await messageRealtimeNotifier.NotifyUserPresenceAsync(partners, new UserPresenceSocketDTO
                        {
                            UserId = userId,
                            PresenceHidden = false,
                            IsOnline = false,
                            LastSeenAt = user.LastSeenAt
                        });
                    }
                }
            }
        }
    }
}
