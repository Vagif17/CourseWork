using Application.Interfaces.Repositories;
using Application.Interfaces.Notifications;
using AutoMapper;
using MediatR;
using Application.DTOs;

namespace Application.Features.Messages.Commands;

public class EditMessageCommandHandler : IRequestHandler<EditMessageCommand, MessageDTO>
{
    private readonly IMessageRepository messageRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;
    private readonly IMapper mapper;

    public EditMessageCommandHandler(
        IMessageRepository messageRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier,
        IMapper mapper)
    {
        this.messageRepository = messageRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
        this.mapper = mapper;
    }

    public async Task<MessageDTO> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var msg = await messageRepository.GetByIdTrackingAsync(request.MessageId);
        if (msg == null || msg.SenderId != request.SenderId)
            throw new UnauthorizedAccessException("Cannot edit this message.");

        if (msg.IsDeleted)
            throw new InvalidOperationException("Cannot edit a deleted message.");

        msg.Text = request.NewText;
        msg.IsEdited = true;

        await messageRepository.UpdateMessageAsync(msg);

        var messageDto = mapper.Map<MessageDTO>(msg);

        // Уведомляем участников чата об изменении сообщения
        await messageRealtimeNotifier.NotifyMessageEditedAsync(msg.ChatId, messageDto);

        return messageDto;
    }
}
