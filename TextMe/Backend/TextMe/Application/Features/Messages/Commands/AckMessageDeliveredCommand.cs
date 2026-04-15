using MediatR;

namespace Application.Features.Messages.Commands;

public record AckMessageDeliveredCommand(int MessageId, string UserId) : IRequest;
