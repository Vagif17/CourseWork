using Application.DTOs;
using Application.Features.Chats.Commands;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Interfaces.Stores;
using AutoMapper;
using MediatR;

namespace Application.Features.Chats.Handlers;

public class CreateGroupChatCommandHandler : IRequestHandler<CreateGroupChatCommand, ChatDTO>
{
    private readonly IChatRepository chatRepository;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;

    public CreateGroupChatCommandHandler(
        IChatRepository chatRepository,
        IUserStore userStore,
        IMapper mapper,
        IMessageRealtimeNotifier messageRealtimeNotifier)
    {
        this.chatRepository = chatRepository;
        this.userStore = userStore;
        this.mapper = mapper;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
    }

    public async Task<ChatDTO> Handle(CreateGroupChatCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Group name is required");

        if (request.ParticipantIds == null || !request.ParticipantIds.Any())
            throw new ArgumentException("At least one participant is required besides the creator");

        var chat = await chatRepository.CreateGroupChatAsync(
            request.Name, 
            request.AvatarUrl, 
            request.ParticipantIds, 
            request.CreatorId);

        var chatDto = mapper.Map<ChatDTO>(chat);

        // Обогащаем участников данными из UserStore
        foreach (var participant in chatDto.Participants)
        {
            var user = await userStore.GetUserByIdAsync(participant.UserId);
            if (user != null)
            {
                participant.UserName = user.UserName;
                participant.AvatarUrl = user.AvatarUrl;
                // Находим участника в доменной модели чтобы проставить IsAdmin в DTO
                var domainPart = chat.Participants.FirstOrDefault(p => p.UserId == participant.UserId);
                participant.IsAdmin = domainPart?.IsAdmin ?? false;
            }
        }

        // Уведомляем всех участников о новом чате
        var allParticipantIds = chat.Participants.Select(p => p.UserId).ToList();
        await messageRealtimeNotifier.NotifyNewChatAsync(allParticipantIds, chatDto);

        return chatDto;
    }
}
