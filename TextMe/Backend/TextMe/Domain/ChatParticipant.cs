namespace Domain;

public class ChatParticipant
{
    public int ChatId { get; set; }
    public Chat Chat { get; set; } = null!;

    public string UserId { get; set; } = null!;
}
