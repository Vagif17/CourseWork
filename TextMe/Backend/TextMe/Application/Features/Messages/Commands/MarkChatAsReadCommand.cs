using MediatR;

namespace Application.Features.Messages.Commands;

public record MarkChatAsReadCommand(int ChatId, string UserId) : IRequest;
