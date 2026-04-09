using Application.Interfaces.Repositories;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc.Formatters;
using static System.Net.Mime.MediaTypeNames;

namespace Application.Features.Messages.Commands;

public class CreateMessageCommandHandler : IRequestHandler<CreateMessageCommand, MessageDTO>
{
    private readonly IMessageRepository messageRepository;
    private readonly IMapper mapper;

    public CreateMessageCommandHandler(IMessageRepository _messageRepository, IMapper _mapper)
    {
        messageRepository = _messageRepository;
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

        return mapper.Map<MessageDTO>(created);
    }
}
