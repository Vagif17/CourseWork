using Application.DTOs;
using Application.Interfaces.Repositories;
using Application.Interfaces.Stores;
using Application.Services.Interfaces;
using AutoMapper;


namespace Application.Services.Classes;

public class ChatService : IChatService
{
    private readonly IChatRepository chatRepository;
    private readonly IUserStore userStore;
    private readonly IMapper mapper;

    public ChatService(IChatRepository _chatRepository, IUserStore _userStore, IMapper _mapper)
    {
        chatRepository = _chatRepository;
        userStore = _userStore;
        mapper = _mapper;
    }


    public async Task<PrivateChatResponseDTO> CreateChatAsync(string creatorId, string emailOrPhone)
    {
        var targetUserId = await userStore.FindUserIdByEmailOrPhoneAsync(emailOrPhone);
        if (targetUserId == null) throw new ArgumentException("User not found");
        if (creatorId == targetUserId) throw new ArgumentException("You cannot create chat with yourself");

        var existingChat = await chatRepository.FindPrivateChatAsync(creatorId, targetUserId);
        if (existingChat != null) throw new ArgumentException("Chat already exists");

        var chat = await chatRepository.CreatePrivateChatAsync(creatorId, targetUserId);

        var chatDto = mapper.Map<PrivateChatResponseDTO>(chat);

        foreach (var participant in chatDto.Participants)
        {
            var user = await userStore.GetUserByIdAsync(participant.UserId);
            participant.UserName = user.UserName;
            participant.AvatarUrl = user.AvatarUrl;
        }

        return chatDto;
    }

    public async Task<IEnumerable<PrivateChatResponseDTO>> GetAllPrivateChatsAsync(string userId)
    {
        var chats = await chatRepository.GetAllPrivateChatsAsync(userId);

        var chatDtos = mapper.Map<List<PrivateChatResponseDTO>>(chats);

        var allUserIds = chatDtos
            .SelectMany(c => c.Participants)
            .Select(p => p.UserId)
            .Distinct()
            .ToList();

        var users = await userStore.GetUsersByIdsAsync(allUserIds);

        var userDict = users.ToDictionary(u => u.Id);

        foreach (var chat in chatDtos)
        {
            foreach (var participant in chat.Participants)
            {
                if (userDict.TryGetValue(participant.UserId, out var user))
                {
                    participant.UserName = user.UserName;
                    participant.AvatarUrl = user.AvatarUrl;
                }
            }
        }

        return chatDtos;
    }
}
