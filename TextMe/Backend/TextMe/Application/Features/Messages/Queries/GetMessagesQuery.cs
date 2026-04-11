using MediatR;

namespace Application.Features.Messages.Queries;

public record GetMessagesQuery(int ChatId, string UserId) : IRequest<IEnumerable<MessageDTO>>;
