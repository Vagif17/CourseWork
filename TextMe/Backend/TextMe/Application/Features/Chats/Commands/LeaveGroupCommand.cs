using Application.DTOs;
using MediatR;

namespace Application.Features.Chats.Commands;

public record LeaveGroupCommand(int ChatId, string UserId) : IRequest<bool>;
