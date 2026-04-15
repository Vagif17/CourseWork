using Application.DTOs;
using Application.Helpers;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Features.Messages.Commands;

public class CreateMessageCommandHandler : IRequestHandler<CreateMessageCommand, MessageDTO>
{
    private readonly IMessageRepository messageRepository;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;

    public CreateMessageCommandHandler(
        IMessageRepository _messageRepository,
        IChatRepository _chatRepository,
        IMessageRealtimeNotifier _messageRealtimeNotifier,
        IUserStore _userStore,
        IMapper _mapper)
    {
        messageRepository = _messageRepository;
        chatRepository = _chatRepository;
        messageRealtimeNotifier = _messageRealtimeNotifier;
        userStore = _userStore;
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
            ReplyToMessageId = request.ReplyToMessageId,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = MessageStatus.Sent
        };

        var created = await messageRepository.CreateAsync(message);

        var preview = MessagePreviewFormatter.ToPreview(created.Text, created.MediaUrl, created.MediaType);
        await chatRepository.UpdateChatLastMessageAsync(request.ChatId, preview, created.CreatedAt);

        var messageDto = mapper.Map<MessageDTO>(created);
        
        var sender = await userStore.GetUserByIdAsync(created.SenderId);
        if (sender != null)
        {
            messageDto.SenderUserName = sender.UserName ?? "User";
            messageDto.SenderAvatarUrl = sender.AvatarUrl;
        }

        var participants = await chatRepository.GetChatParticipantIdsAsync(request.ChatId);
        var previewDto = new ChatListPreviewDTO
        {
            ChatId = request.ChatId,
            LastMessage = preview,
            LastMessageAt = created.CreatedAt
        };
        await messageRealtimeNotifier.NotifyChatListUpdatedAsync(participants, previewDto);

        return messageDto;
    }
}
