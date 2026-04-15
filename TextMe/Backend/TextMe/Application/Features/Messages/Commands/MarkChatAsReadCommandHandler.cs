using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Domain;
using MediatR;

namespace Application.Features.Messages.Commands;

public class MarkChatAsReadCommandHandler : IRequestHandler<MarkChatAsReadCommand>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;

    public MarkChatAsReadCommandHandler(
        IMessageRepository messageRepository,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier)
    {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
    }

    public async Task Handle(MarkChatAsReadCommand request, CancellationToken cancellationToken)
    {
        if (!await chatRepository.IsUserParticipantInChatAsync(request.ChatId, request.UserId))
            return;

        var read = await messageRepository.MarkIncomingAsReadAsync(request.ChatId, request.UserId);
        
        foreach (var (messageId, senderId) in read)
        {
            await messageRealtimeNotifier.NotifyMessageStatusAsync(
                senderId,
                messageId,
                request.ChatId,
                MessageStatus.Read.ToString());
        }
    }
}
