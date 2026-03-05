namespace HW_6.Config;

public class JWTConfig
{
    public const string SectionName = "JWTSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string RefreshSecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationInMinutes { get; set; }
    public int RefreshTokenExpirationInDays { get; set; }
}