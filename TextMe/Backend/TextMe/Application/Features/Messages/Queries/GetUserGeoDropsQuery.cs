using Application.DTOs;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using AutoMapper;
using MediatR;

namespace Application.Features.Messages.Queries;

public record GetUserGeoDropsQuery(string UserId) : IRequest<IEnumerable<MessageDTO>>;

public class GetUserGeoDropsQueryHandler : IRequestHandler<GetUserGeoDropsQuery, IEnumerable<MessageDTO>>
{
    private readonly IMessageRepository messageRepository;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;

    public GetUserGeoDropsQueryHandler(IMessageRepository _messageRepository, IUserStore _userStore, IMapper _mapper)
    {
        messageRepository = _messageRepository;
        userStore = _userStore;
        mapper = _mapper;
    }

    public async Task<IEnumerable<MessageDTO>> Handle(GetUserGeoDropsQuery request, CancellationToken cancellationToken)
    {
        var messages = await messageRepository.GetGeoDropsForUserAsync(request.UserId);
        var dtos = mapper.Map<List<MessageDTO>>(messages);

        var senderIds = dtos.Select(m => m.SenderId).Distinct().ToList();
        var users = await userStore.GetUsersByIdsAsync(senderIds);
        var usersMap = users.ToDictionary(u => u.Id, u => u);

        foreach (var dto in dtos)
        {
            if (usersMap.TryGetValue(dto.SenderId, out var user))
            {
                dto.SenderUserName = user.UserName;
                dto.SenderAvatarUrl = user.AvatarUrl;
            }
        }

        return dtos;
    }
}
