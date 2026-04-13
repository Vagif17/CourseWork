using MediatR;
using Application.DTOs;

namespace Application.Features.Messages.Commands;

public class EditMessageCommand : IRequest<MessageDTO>
{
    public int MessageId { get; set; }
    public string SenderId { get; set; } = null!;
    public string NewText { get; set; } = null!;

    public EditMessageCommand(int messageId, string senderId, string newText)
    {
        MessageId = messageId;
        SenderId = senderId;
        NewText = newText;
    }
}
