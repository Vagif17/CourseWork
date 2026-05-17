using MediatR;
using Application.Interfaces.Repositories;
using Application.Interfaces.Notifications;
using Domain;
using Application.DTOs;
using AutoMapper;

namespace Application.Features.Messages.Commands;

public record AddReactionCommand(int MessageId, string UserId, string Emoji) : IRequest<bool>;

public class AddReactionCommandHandler : IRequestHandler<AddReactionCommand, bool>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IChatRepository _chatRepository;
    private readonly IMessageRealtimeNotifier _notifier;
    private readonly IMapper _mapper;

    public AddReactionCommandHandler(
        IMessageRepository messageRepository,
        IChatRepository chatRepository,
        IMessageRealtimeNotifier notifier,
        IMapper mapper)
    {
        _messageRepository = messageRepository;
        _chatRepository = chatRepository;
        _notifier = notifier;
        _mapper = mapper;
    }

    public async Task<bool> Handle(AddReactionCommand request, CancellationToken cancellationToken)
    {
        var message = await _messageRepository.GetByIdTrackingAsync(request.MessageId);
        if (message == null) return false;

        // Check if user already reacted with this emoji
        var existingReaction = message.Reactions.FirstOrDefault(r => r.UserId == request.UserId && r.Emoji == request.Emoji);
        
        if (existingReaction != null)
        {
            // If already reacted with same emoji, we can toggle it (remove it)
            message.Reactions.Remove(existingReaction);
        }
        else
        {
            // Add new reaction
            var newReaction = new MessageReaction
            {
                MessageId = request.MessageId,
                UserId = request.UserId,
                Emoji = request.Emoji,
                CreatedAt = DateTimeOffset.UtcNow
            };
            message.Reactions.Add(newReaction);
        }

        await _messageRepository.UpdateMessageAsync(message);

        // Notify clients
        var participants = await _chatRepository.GetChatParticipantIdsAsync(message.ChatId);
        var reactionDtos = _mapper.Map<IEnumerable<MessageReactionDto>>(message.Reactions);
        await _notifier.NotifyMessageReactionsUpdatedAsync(participants, message.ChatId, message.Id, reactionDtos);

        return true;
    }
}
