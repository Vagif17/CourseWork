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

public class UploadMediaRequestDTO
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public Stream FileStream { get; set; } = Stream.Null;
}