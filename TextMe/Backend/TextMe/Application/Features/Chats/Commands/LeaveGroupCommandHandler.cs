using Application.DTOs;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using Application.Helpers;
using Domain;
using MediatR;
using AutoMapper;

namespace Application.Features.Chats.Commands;

public class LeaveGroupCommandHandler : IRequestHandler<LeaveGroupCommand, bool>
{
    private readonly IChatRepository chatRepository;
    private readonly IMessageRepository messageRepository;
    private readonly IUserStore userStore;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;
    private readonly IMapper mapper;

    public LeaveGroupCommandHandler(
        IChatRepository _chatRepository,
        IMessageRepository _messageRepository,
        IUserStore _userStore,
        IMessageRealtimeNotifier _messageRealtimeNotifier,
        IMapper _mapper)
    {
        chatRepository = _chatRepository;
        messageRepository = _messageRepository;
        userStore = _userStore;
        messageRealtimeNotifier = _messageRealtimeNotifier;
        mapper = _mapper;
    }

    public async Task<bool> Handle(LeaveGroupCommand request, CancellationToken cancellationToken)
    {
        var chat = await chatRepository.GetChatByIdAsync(request.ChatId);
        if (chat == null || !chat.IsGroup) return false;

        var user = await userStore.GetUserByIdAsync(request.UserId);
        if (user == null) return false;

        // 1. Remove participant
        await chatRepository.RemoveParticipantAsync(request.ChatId, request.UserId);

        // 2. Create system message
        var systemMessage = new Message
        {
            ChatId = request.ChatId,
            SenderId = request.UserId,
            Text = $"{user.UserName} left the group",
            IsSystem = true,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = MessageStatus.Sent
        };

        var created = await messageRepository.CreateAsync(systemMessage);
        
        // Update last message in chat
        var preview = MessagePreviewFormatter.ToPreview(created.Text, created.MediaUrl, created.MediaType);
        await chatRepository.UpdateChatLastMessageAsync(request.ChatId, preview, created.CreatedAt);

        // 3. Notify remaining participants
        var participants = await chatRepository.GetChatParticipantIdsAsync(request.ChatId);
        
        var messageDto = mapper.Map<MessageDTO>(created);
        messageDto.ChatName = chat.Name;
        messageDto.ChatAvatarUrl = chat.GroupAvatarUrl;
        messageDto.SenderUserName = user.UserName ?? "User";
        messageDto.SenderAvatarUrl = user.AvatarUrl;

        await messageRealtimeNotifier.NotifyNewMessageAsync(participants, request.ChatId, messageDto);
        
        // Notify chat list update
        var previewDto = new ChatListPreviewDTO
        {
            ChatId = request.ChatId,
            LastMessage = preview,
            LastMessageAt = created.CreatedAt
        };
        await messageRealtimeNotifier.NotifyChatListUpdatedAsync(participants, previewDto);

        return true;
    }
}
