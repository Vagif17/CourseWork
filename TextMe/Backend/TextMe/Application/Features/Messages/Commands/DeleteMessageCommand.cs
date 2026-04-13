using MediatR;
using Application.DTOs;

namespace Application.Features.Messages.Commands;

public class DeleteMessageCommand : IRequest<bool>
{
    public int MessageId { get; set; }
    public string SenderId { get; set; } = null!;

    public DeleteMessageCommand(int messageId, string senderId)
    {
        MessageId = messageId;
        SenderId = senderId;
    }
}
