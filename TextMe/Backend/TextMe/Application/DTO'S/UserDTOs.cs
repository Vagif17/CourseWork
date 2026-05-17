
namespace Application.DTOs;

public class UserDTO
{
    public string Id { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
