using Microsoft.AspNetCore.Mvc;

namespace TextMe.DTO_S;



public class ParticipantDTO
{
    public string UserId { get; set; } = null!;
    public string? UserName { get; set; }
    public string? AvatarUrl { get; set; }
}

public class PrivateChatDTOResponse
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public IEnumerable<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();

    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
}


public class MessageDTO
{
    public int Id { get; set; }

    public int ChatId { get; set; }

    public string SenderId { get; set; } = null!;

    public string SenderUserName { get; set; } = null!;

    public string? SenderAvatarUrl { get; set; }

    public string? Text { get; set; }

    public string? MediaUrl { get; set; }

    public string? MediaType { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public class UploadFileRequest
{
    [FromForm(Name = "file")]
    public IFormFile File { get; set; } = null!;
}