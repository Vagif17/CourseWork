using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Domain;
using MediatR;

namespace Application.Features.Messages.Commands;

public class AckMessageDeliveredCommandHandler : IRequestHandler<AckMessageDeliveredCommand>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;

    public AckMessageDeliveredCommandHandler(
        IMessageRepository messageRepository,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier)
    {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
    }

    public async Task Handle(AckMessageDeliveredCommand request, CancellationToken cancellationToken)
    {
        var msg = await messageRepository.GetByIdTrackingAsync(request.MessageId);
        
        // Валидация: сообщение существует, получатель - это текущий пользователь, статус - "Sent"
        if (msg == null || msg.SenderId == request.UserId)
            return;

        if (!await chatRepository.IsUserParticipantInChatAsync(msg.ChatId, request.UserId))
            return;

        if (msg.Status != MessageStatus.Sent)
            return;

        msg.Status = MessageStatus.Delivered;
        await messageRepository.UpdateMessageAsync(msg);

        // Уведомляем отправителя в реальном времени
        await messageRealtimeNotifier.NotifyMessageStatusAsync(
            msg.SenderId,
            msg.Id,
            msg.ChatId,
            MessageStatus.Delivered.ToString());
    }
}
