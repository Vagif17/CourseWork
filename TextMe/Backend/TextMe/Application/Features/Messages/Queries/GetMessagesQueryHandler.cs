using Application.Interfaces.Repositories;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Features.Messages.Queries;

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, IEnumerable<MessageDTO>>
{
    private readonly IMessageRepository messageRepository;
    private readonly IMapper mapper;

    public GetMessagesQueryHandler(IMessageRepository _messageRepository, IMapper _mapper)
    {
       messageRepository = _messageRepository;
       mapper = _mapper;
    }


    public async Task<IEnumerable<MessageDTO>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var messages = await messageRepository.GetChatMessagesAsync(request.chatId);
            return mapper.Map<IEnumerable<MessageDTO>>(messages);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
}
