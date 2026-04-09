using Application.DTOs;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using AutoMapper;
using MediatR;

namespace Application.Features.Chats.Queries;

public class GetPrivateChatsQueryHandler : IRequestHandler<GetPrivateChatsQuery, IEnumerable<PrivateChatResponseDTO>>
{
    private readonly IChatRepository chatRepository;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;

    public GetPrivateChatsQueryHandler(
        IChatRepository _chatRepository,
        IUserStore _userStore,
        IMapper _mapper)
    {
        chatRepository = _chatRepository;
        userStore = _userStore;
        mapper = _mapper;
    }

    public async Task<IEnumerable<PrivateChatResponseDTO>> Handle(
        GetPrivateChatsQuery request, 
        CancellationToken cancellationToken)
    {
        var chats = await chatRepository.GetAllPrivateChatsAsync(request.userId);

        var chatDtos = mapper.Map<List<PrivateChatResponseDTO>>(chats);

        var allUserIds = chatDtos
            .SelectMany(c => c.Participants)
            .Select(p => p.UserId)
            .Distinct()
            .ToList();

        var users = await userStore.GetUsersByIdsAsync(allUserIds);

        var userDict = users.ToDictionary(u => u.Id);

        foreach (var chat in chatDtos)
        {
            foreach (var participant in chat.Participants)
            {
                if (userDict.TryGetValue(participant.UserId, out var user))
                {
                    participant.UserName = user.UserName;
                    participant.AvatarUrl = user.AvatarUrl;
                }
            }
        }

        return chatDtos;

    }
}
