using Application.DTOs;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Interfaces.Stores;
using AutoMapper;
using MediatR;

namespace Application.Features.Chats.Queries;

public class GetPrivateChatsQueryHandler : IRequestHandler<GetPrivateChatsQuery, IEnumerable<ChatDTO>>
{
    private readonly IChatRepository chatRepository;
    private readonly IUserStore userStore;
    private readonly IUserPresenceService presenceService;
    private readonly IMapper mapper;

    public GetPrivateChatsQueryHandler(
        IChatRepository _chatRepository,
        IUserStore _userStore,
        IUserPresenceService presenceService,
        IMapper _mapper)
    {
        chatRepository = _chatRepository;
        userStore = _userStore;
        this.presenceService = presenceService;
        mapper = _mapper;
    }

    public async Task<IEnumerable<ChatDTO>> Handle(
        GetPrivateChatsQuery request,
        CancellationToken cancellationToken)
    {
        var chats = await chatRepository.GetAllUserChatsAsync(request.userId);

        var chatDtos = mapper.Map<List<ChatDTO>>(chats);

        var allUserIds = chatDtos
            .SelectMany(c => c.Participants)
            .Select(p => p.UserId)
            .Distinct()
            .ToList();

        var users = await userStore.GetUsersByIdsAsync(allUserIds);

        var userDict = users.ToDictionary(u => u.Id);
        var presenceDict = await userStore.GetUserPresenceFieldsByIdsAsync(allUserIds, cancellationToken);

        foreach (var chat in chatDtos)
        {
            foreach (var participant in chat.Participants)
            {
                if (userDict.TryGetValue(participant.UserId, out var user))
                {
                    participant.UserName = user.UserName;
                    participant.AvatarUrl = user.AvatarUrl;
                }

                if (participant.UserId == request.userId)
                {
                    participant.PresenceHidden = false;
                    participant.IsOnline = null;
                    participant.LastSeenAt = null;
                    continue;
                }

                if (!presenceDict.TryGetValue(participant.UserId, out var pres))
                    continue;

                if (!pres.ShareOnlineStatus)
                {
                    participant.PresenceHidden = true;
                    participant.IsOnline = null;
                    participant.LastSeenAt = null;
                }
                else
                {
                    participant.PresenceHidden = false;
                    var online = presenceService.IsOnline(participant.UserId);
                    participant.IsOnline = online;
                    participant.LastSeenAt = online ? null : pres.LastSeenAt;
                }
            }
        }

        return chatDtos;
    }
}
