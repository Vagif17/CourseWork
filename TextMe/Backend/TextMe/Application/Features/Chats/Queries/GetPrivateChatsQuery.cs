using Application.DTOs;
using MediatR;

namespace Application.Features.Chats.Queries;

public record GetPrivateChatsQuery (string userId) : IRequest<IEnumerable<ChatDTO>>;
