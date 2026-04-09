using Application.DTOs;
using Application.Features.Chats.Commands;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using AutoMapper;
using MediatR;

public class CreateChatCommandHandler
    : IRequestHandler<CreateChatCommand, PrivateChatResponseDTO>
{
    private readonly IChatRepository chatRepository;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;

    public CreateChatCommandHandler(
        IChatRepository _chatRepository,
        IUserStore _userStore,
        IMapper _mapper)
    {
        chatRepository = _chatRepository;
        userStore = _userStore;
        mapper = _mapper;
    }

    public async Task<PrivateChatResponseDTO> Handle(
        CreateChatCommand request,
        CancellationToken cancellationToken)
    {

        var targetUserId = await userStore.FindUserIdByEmailOrPhoneAsync(request.emailOrPhone);

        if (targetUserId == null)
            throw new ArgumentException("User not found");

        if (request.creatorId == targetUserId)
            throw new ArgumentException("You cannot create chat with yourself");

        var existingChat = await chatRepository.FindPrivateChatAsync(request.creatorId, targetUserId);

        if (existingChat != null)
            throw new ArgumentException("Chat already exists");

        var chat = await chatRepository.CreatePrivateChatAsync(request.creatorId, targetUserId);

        var chatDto = mapper.Map<PrivateChatResponseDTO>(chat);

        foreach (var participant in chatDto.Participants)
        {
            var user = await userStore.GetUserByIdAsync(participant.UserId);
            participant.UserName = user.UserName;
            participant.AvatarUrl = user.AvatarUrl;
        }

        return chatDto;
    }
}