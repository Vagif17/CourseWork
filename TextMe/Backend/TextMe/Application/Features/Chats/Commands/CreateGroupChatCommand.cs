using Application.DTOs;
using MediatR;

namespace Application.Features.Chats.Commands;

public record CreateGroupChatCommand(
    string Name, 
    IEnumerable<string> ParticipantIds, 
    string CreatorId,
    string? AvatarUrl = null) : IRequest<ChatDTO>;
