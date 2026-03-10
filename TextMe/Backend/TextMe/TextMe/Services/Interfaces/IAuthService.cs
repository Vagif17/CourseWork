using TextMe.DTOs;

namespace TextMe.Services.Interfaces;

public interface IAuthService
{
    public Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO registerRequest);
    public Task<AuthResponseDTO> LoginAsync(LoginRequestDTO loginRequest);
    public Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest);
    public Task RevokeRefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest);

}
