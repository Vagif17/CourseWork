using Application.DTOs;

namespace Application.Services.Interfaces;

public interface IAuthService
{
    public Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO registerRequest);
    public Task<AuthResponseDTO> LoginAsync(LoginRequestDTO loginRequest);
    public Task<AuthResponseDTO> RefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest);
    public Task RevokeRefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest);

}
