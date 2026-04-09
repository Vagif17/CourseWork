using MediatR;

namespace Application.Features.Messages.Commands;

public record CreateMessageCommand(
    int ChatId,
    string SenderId,
    string? Text,
    string? MediaUrl,
    string? MediaType,
    int? AudioDuration = null) : IRequest<MessageDTO>;
