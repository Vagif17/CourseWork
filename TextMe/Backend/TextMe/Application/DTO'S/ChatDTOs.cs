using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Application.DTOs;


public class ParticipantDTO
{
    public string UserId { get; set; } = null!;
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
}

public class PrivateChatResponseDTO
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public IEnumerable<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();

    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
}


