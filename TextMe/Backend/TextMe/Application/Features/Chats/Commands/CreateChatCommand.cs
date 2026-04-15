using Application.DTOs;
using MediatR;

namespace Application.Features.Chats.Commands;

public record CreateChatCommand(string creatorId, string emailOrPhone) : IRequest<ChatDTO>;