using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Messages.Commands;

public class DeleteMessageCommandHandler : IRequestHandler<DeleteMessageCommand, bool>
{
    private readonly IMessageRepository messageRepository;

    public DeleteMessageCommandHandler(IMessageRepository messageRepository)
    {
        this.messageRepository = messageRepository;
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

        return true;
    }
}
