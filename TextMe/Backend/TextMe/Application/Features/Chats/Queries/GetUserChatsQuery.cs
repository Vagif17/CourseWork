using Application.DTOs;
using MediatR;

namespace Application.Features.Chats.Queries;

public record GetUserChatsQuery (string userId) : IRequest<IEnumerable<ChatDTO>>;
