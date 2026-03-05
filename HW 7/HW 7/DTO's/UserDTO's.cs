namespace HW_7.DTO_s;

public class RegisterUserRequestDTO
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

}

public class LoginUserRequestDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}


public class UserResponseDTO
{
    public string Email { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public DateTimeOffset ExpiredAt { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTimeOffset RefreshTokenExpiredAt { get; set; }
    public IEnumerable<string> Roles { get; set; } = new List<string>();
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}


public class UpdatePasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;

}


public class UpdateProfileRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

}