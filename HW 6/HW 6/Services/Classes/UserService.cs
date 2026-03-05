using HW_6.Config;
using HW_6.DB_s;
using HW_6.DTO_s;
using HW_6.Models;
using HW_6.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HW_6.Services.Classes;

public class UserService : IUserService
{
    private readonly InvoiceManagerDB _invoiceManagerDB;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;
    private readonly JWTConfig _jWTConfig;


    private const string RefreshTokenType = "refresh";

    public UserService(InvoiceManagerDB invoiceManagerDB, UserManager<User> userManager, IConfiguration configuration, IOptions<JWTConfig> jWTConfig)
    {
        _invoiceManagerDB = invoiceManagerDB;
        _userManager = userManager;
        _configuration = configuration;
        _jWTConfig = jWTConfig.Value;
        Console.WriteLine($"JWT SecretKey length: {_jWTConfig.SecretKey?.Length}");
    }

    public async Task<UserResponseDTO> RegisterAsync(RegisterUserRequestDTO registerRequest)
    {
        var existingUser = await _userManager.FindByEmailAsync(registerRequest.Email);

        if (existingUser is not null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        var user = new User
        {
            UserName = registerRequest.Name,
            Name = registerRequest.Name,
            Email = registerRequest.Email,
            CreatedAt = DateTime.UtcNow,
         }; 


        var result = await _userManager.CreateAsync(user, registerRequest.Password);


        if (!result.Succeeded)
        {
            var errors = string.Join(",", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"User creation failed: {errors}");
        }

        return await GenerateTokenAsync(user);
    }


    public async Task<UserResponseDTO> LoginAsync(LoginUserRequestDTO loginRequest)
    {
        var user = await _userManager.FindByEmailAsync(loginRequest.Email);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or password");
        

        var isValidPassword = await _userManager.CheckPasswordAsync(user, loginRequest.Password);

        if (!isValidPassword)
            throw new UnauthorizedAccessException("Invalid email or password");
        
        return await GenerateTokenAsync(user);
    }


    public async Task<bool> UpdatePasswordAsync(UpdatePasswordRequest updatePasswordRequest)
    {
        var user = await _userManager.FindByEmailAsync(updatePasswordRequest.Email);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or password");

        var isValidPassword = await _userManager.CheckPasswordAsync(user, updatePasswordRequest.Password);

        if (!isValidPassword)
            throw new UnauthorizedAccessException("Invalid email or password");

        user.UpdatedAt = DateTime.Now;
        user.Password = updatePasswordRequest.Password;

        var result = await _userManager.UpdateAsync(user);


        if (!result.Succeeded)
            throw new UnauthorizedAccessException("Password didn't change");

        return true;

    }


    public async Task<bool> UpdateProfileAsync(UpdateProfileRequest updateProfileRequest)
    {
        var user = await _userManager.FindByEmailAsync(updateProfileRequest.Email);

        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or password");

        var isValidPassword = await _userManager.CheckPasswordAsync(user,updateProfileRequest.Password);

        if (!isValidPassword)
            throw new UnauthorizedAccessException("Invalid email or password");

        user.UpdatedAt = DateTime.Now;
        user.Name = updateProfileRequest.Name;
        user.UserName = updateProfileRequest.Name;
        user.Email = updateProfileRequest.Email;
        user.Address = updateProfileRequest.Address;
        user.PhoneNumber = updateProfileRequest.PhoneNumber;

        return true;
       
    }



    private async Task<(RefreshToken entity, string jwt)>CreateRefreshTokenJwtAsync(string userId, int expirationDay)
    {
        var expiresAt = DateTime.UtcNow.AddDays(expirationDay);
        var jti = Guid.NewGuid().ToString("N");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jWTConfig.RefreshSecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(JwtRegisteredClaimNames.Jti, jti),
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim("token_type", RefreshTokenType),
        };

        var token = new JwtSecurityToken(
            issuer: _jWTConfig.Issuer,
            audience: _jWTConfig.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
            );
        var jwtString = new JwtSecurityTokenHandler().WriteToken(token);
        var entity = new RefreshToken
        {
            JwtId = jti,
            UserId = userId,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };

        _invoiceManagerDB.RefreshTokens.Add(entity);

        await _invoiceManagerDB.SaveChangesAsync();

        return (entity, jwtString);
    }

    private async Task<UserResponseDTO> GenerateTokenAsync(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jWTConfig.SecretKey));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name , user.UserName!),
            new Claim(ClaimTypes.Email , user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti , Guid.NewGuid().ToString())
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _jWTConfig.Issuer,
            audience: _jWTConfig.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jWTConfig.ExpirationInMinutes),
            signingCredentials: credentials
            );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        var (refreshToken, refreshJwt) = await CreateRefreshTokenJwtAsync(user.Id, _jWTConfig.RefreshTokenExpirationInDays);
        return new UserResponseDTO
        {
            Email = user.Email!,
            AccessToken = tokenString,
            ExpiredAt = DateTime.UtcNow.AddMinutes(_jWTConfig.ExpirationInMinutes),
            RefreshToken = refreshJwt,
            RefreshTokenExpiredAt = refreshToken.ExpiresAt,
            Roles = roles
        };


    }

    public async Task<UserResponseDTO> RefreshTokenAsync(RefreshTokenRequest refreshTokenRequest)
    {
        var (principal, jti) = ValidateRefreshJwtAndGetJti(refreshTokenRequest.RefreshToken);

        var storedToken = await _invoiceManagerDB.RefreshTokens.FirstOrDefaultAsync(rt => rt.JwtId == jti);

        if (storedToken is null)
            throw new UnauthorizedAccessException("Invalid refresh token");

        if (!storedToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token has been revoked or expired");

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);

        var user = await _userManager.FindByIdAsync(userId!);

        if (user is null)
            throw new UnauthorizedAccessException("User not found");

        storedToken.RevokedAt = DateTime.UtcNow;

        var newToken = await GenerateTokenAsync(user);
        var newStoredToken = await _invoiceManagerDB
                                    .RefreshTokens
                                    .FirstOrDefaultAsync(rt => rt.JwtId == GetJtiFromRefreshToken(newToken.RefreshToken));

        if (newStoredToken is not null)
            storedToken.ReplacedByJwtId = newStoredToken.JwtId;

        await _invoiceManagerDB.SaveChangesAsync();

        return newToken;

    }

    private (ClaimsPrincipal principal, string jti) ValidateRefreshJwtAndGetJti(string refreshToken, bool validateLifeTime = true)
    {
        var handler = new JwtSecurityTokenHandler();

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jWTConfig.RefreshSecretKey));

        var principal = handler.ValidateToken(refreshToken, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _jWTConfig.Issuer,
            ValidateAudience = true,
            ValidAudience = _jWTConfig.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateLifetime = validateLifeTime,
            ClockSkew = TimeSpan.Zero
        }, out var validatedToken);

        if (validatedToken is not JwtSecurityToken jwt)
            throw new UnauthorizedAccessException("Invalid refresh token");

        var tokenType = jwt.Claims.FirstOrDefault(c => c.Type == "token_type")?.Value;

        if (tokenType != RefreshTokenType)
            throw new UnauthorizedAccessException("Invalid refresh token");

        var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value
            ?? throw new UnauthorizedAccessException("Invalid refresh token");

        return (principal, jti);
    }

    private static string GetJtiFromRefreshToken(string refreshJwt)
    {
        var handler = new JwtSecurityTokenHandler();

        if (!handler.CanReadToken(refreshJwt)) return string.Empty;

        var jwt = handler.ReadJwtToken(refreshJwt);

        return jwt.Claims
            .FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value
            ?? string.Empty;
    }


    public async Task RevokeRefreshTokenAsync(RefreshTokenRequest refreshTokenRequest)
    {
        string? jti;
        try
        {
            (_, jti) = ValidateRefreshJwtAndGetJti(refreshTokenRequest.RefreshToken, validateLifeTime: false);
        }
        catch
        {
            return;
        }

        var storedToken = await _invoiceManagerDB.RefreshTokens.FirstOrDefaultAsync(rt => rt.JwtId == jti);

        if (storedToken is null || !storedToken.IsActive) return;

        storedToken.RevokedAt = DateTime.UtcNow;

        await _invoiceManagerDB.SaveChangesAsync();
    }
}