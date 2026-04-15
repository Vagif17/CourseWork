using Application.DTOs;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Features.Messages.Queries;

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, IEnumerable<MessageDTO>>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;
    private readonly IMapper mapper;

    public GetMessagesQueryHandler(
        IMessageRepository messageRepository,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier,
        IMapper mapper)
    {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
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
        return mapper.Map<IEnumerable<MessageDTO>>(messages);
    }
}
