namespace Application.DTOs;

public class RecoveryRequestDTO
{
    public string Email { get; set; }
}

public class RecoveryVerifyDTO
{
    public string Email { get; set; }
    public string Code { get; set; }
}

public class ResetPasswordDTO
{
    public string Email { get; set; }
    public string Code { get; set; }
    public string NewPassword { get; set; }
}