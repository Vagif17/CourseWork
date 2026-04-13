using Application.Interfaces.Repositories;
using AutoMapper;
using MediatR;
using Application.DTOs;

namespace Application.Features.Messages.Commands;

public class EditMessageCommandHandler : IRequestHandler<EditMessageCommand, MessageDTO>
{
    private readonly IMessageRepository messageRepository;
    private readonly IMapper mapper;

    public EditMessageCommandHandler(IMessageRepository messageRepository, IMapper mapper)
    {
        this.messageRepository = messageRepository;
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

        return mapper.Map<MessageDTO>(msg);
    }
}
