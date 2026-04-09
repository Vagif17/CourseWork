using MediatR;

namespace Application.Features.Messages.Queries;

public record GetMessagesQuery (int chatId) : IRequest<IEnumerable<MessageDTO>>;
