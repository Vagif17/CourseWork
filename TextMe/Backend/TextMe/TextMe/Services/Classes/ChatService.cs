using TextMe.DTO_S;
using TextMe.Identities.Interfaces;
using TextMe.Models;
using TextMe.Repositories.Interfaces;
using TextMe.Services.Interfaces;

namespace TextMe.Services.Classes;

public class ChatService : IChatService
{
    private readonly IChatRepository chatRepository;
    private readonly IUserStore userStore;

    public ChatService(IChatRepository _chatRepository, IUserStore _userStore)
    {
        chatRepository = _chatRepository;
        userStore = _userStore;
    }


    public async Task<int> CreateChatAsync(string creatorId, string emailOrPhone)
    {
        var targetUserId = await userStore.FindUserIdByEmailOrPhoneAsync(emailOrPhone);

        if (targetUserId == null)
            throw new ArgumentException("User not found");

        if (creatorId == targetUserId)
            throw new ArgumentException("You cannot create chat with yourself");

        var existingChat = await chatRepository.FindPrivateChatAsync(creatorId, targetUserId);

        if (existingChat != null)
            throw new ArgumentException("Chat already exists");

        var chat = await chatRepository.CreatePrivateChatAsync(creatorId, targetUserId);

        return chat.Id;
    }

    public async Task<IEnumerable<PrivateChatDTOResponse>> GetAllPrivateChatsAsync(string userId)
    {
        return await chatRepository.GetAllPrivateChatsAsync(userId);
    }
}
