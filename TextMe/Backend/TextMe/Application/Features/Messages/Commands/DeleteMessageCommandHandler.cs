using Application.Interfaces.Repositories;
using Application.Interfaces.Notifications;
using MediatR;

namespace Application.Features.Messages.Commands;

public class DeleteMessageCommandHandler : IRequestHandler<DeleteMessageCommand, bool>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;

    public DeleteMessageCommandHandler(
        IMessageRepository messageRepository,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier messageRealtimeNotifier)
    {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
    }

    public async Task<bool> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var msg = await messageRepository.GetByIdTrackingAsync(request.MessageId);
        if (msg == null || msg.SenderId != request.SenderId)
            throw new UnauthorizedAccessException("Cannot delete this message.");

        msg.IsDeleted = true;
        msg.Text = "This message was deleted.";
        msg.MediaUrl = null;
        msg.MediaType = null;
        msg.AudioDuration = null;

        await messageRepository.UpdateMessageAsync(msg);

        var participants = await chatRepository.GetChatParticipantIdsAsync(msg.ChatId);
        await messageRealtimeNotifier.NotifyMessageDeletedAsync(participants, msg.ChatId, msg.Id);

        return true;
    }
}
