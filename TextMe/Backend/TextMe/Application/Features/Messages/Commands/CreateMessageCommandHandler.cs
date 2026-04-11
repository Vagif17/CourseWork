using Application.Helpers;
using Application.Interfaces.Repositories;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Features.Messages.Commands;

public class CreateMessageCommandHandler : IRequestHandler<CreateMessageCommand, MessageDTO>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMapper mapper;

    public CreateMessageCommandHandler(
        IMessageRepository _messageRepository,
        IChatRepository _chatRepository,
        IMapper _mapper)
    {
        messageRepository = _messageRepository;
        chatRepository = _chatRepository;
        mapper = _mapper;
    }

    public async Task<MessageDTO> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
    {
        var message = new Message
        {
            ChatId = request.ChatId,
            SenderId = request.SenderId,
            Text = request.Text,
            MediaUrl = request.MediaUrl,
            MediaType = request.MediaType,
            AudioDuration = request.AudioDuration,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = MessageStatus.Sent
        };

        var created = await messageRepository.CreateAsync(message);

        var preview = MessagePreviewFormatter.ToPreview(created.Text, created.MediaUrl, created.MediaType);
        await chatRepository.UpdateChatLastMessageAsync(request.ChatId, preview, created.CreatedAt);

        return mapper.Map<MessageDTO>(created);
    }
}
