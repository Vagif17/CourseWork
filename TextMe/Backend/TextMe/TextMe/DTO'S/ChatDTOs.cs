namespace TextMe.DTO_S;



public class ParticipantDTO
{
    public string UserId { get; set; } = null!;
    public string? UserName { get; set; }   
}

public class PrivateChatDTOResponse
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public IEnumerable<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();
}
