using AutoMapper;
using TextMe.DTO_S;
using TextMe.Models;
using TextMe.Repositories.Interfaces;
using TextMe.Services.Interfaces;

namespace TextMe.Services.Classes;

public class MessageService : IMessageService
{
    private readonly IMessageRepository messageRepository;
    private readonly IMapper mapper;

    public MessageService(IMessageRepository _messageRepository, IMapper _mapper)
    {
        messageRepository = _messageRepository;
        mapper = _mapper;
    }

    public async Task<MessageDTO> CreateMessageAsync(int chatId, string senderId, string text)
    {
        var message = new Message
        {
            ChatId = chatId,
            SenderId = senderId,
            Text = text,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = MessageStatus.Sent
        };

        var created = await messageRepository.CreateAsync(message);

        return mapper.Map<MessageDTO>(created);
    }

    public async Task<IEnumerable<MessageDTO>> GetChatMessagesAsync(int chatId)
    {
        var messages = await messageRepository.GetChatMessagesAsync(chatId);

        return mapper.Map<IEnumerable<MessageDTO>>(messages);
    }
}
