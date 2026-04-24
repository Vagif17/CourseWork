using Application.DTOs;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Features.Messages.Queries;

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, IEnumerable<MessageDTO>>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;

    public GetMessagesQueryHandler(
        IMessageRepository messageRepository,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier,
        IUserStore userStore,
        IMapper mapper)
    {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
        this.userStore = userStore;
        this.mapper = mapper;
    }

    public async Task<IEnumerable<MessageDTO>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        if (!await chatRepository.IsUserParticipantInChatAsync(request.ChatId, request.UserId))
            throw new UnauthorizedAccessException();

        var delivered = await messageRepository.MarkIncomingAsDeliveredAsync(request.ChatId, request.UserId);
        foreach (var (messageId, senderId) in delivered)
        {
            await messageRealtimeNotifier.NotifyMessageStatusAsync(
                senderId,
                messageId,
                request.ChatId,
                MessageStatus.Delivered.ToString());
        }

        var messages = await messageRepository.GetChatMessagesAsync(request.ChatId);
        var dtos = mapper.Map<List<MessageDTO>>(messages);

        var senderIds = dtos.Select(m => m.SenderId).ToList();
        senderIds.AddRange(dtos.Where(m => m.ReplyToMessage != null).Select(m => m.ReplyToMessage!.SenderId));
        
        var uniqueSenderIds = senderIds.Distinct().ToList();
        var users = await userStore.GetUsersByIdsAsync(uniqueSenderIds);
        var usersMap = users.ToDictionary(u => u.Id, u => u);

        foreach (var dto in dtos)
        {
            if (usersMap.TryGetValue(dto.SenderId, out var user))
            {
                dto.SenderUserName = user.UserName;
                dto.SenderAvatarUrl = user.AvatarUrl;
            }

            if (dto.ReplyToMessage != null && usersMap.TryGetValue(dto.ReplyToMessage.SenderId, out var replyUser))
            {
                dto.ReplyToMessage.SenderUserName = replyUser.UserName;
            }
        }

        return dtos;
    }
}
