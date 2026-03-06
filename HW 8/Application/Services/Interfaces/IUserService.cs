using Application.DTOs;

namespace Application.Services.Interfaces;

public interface IUserService
{
    public Task<UserResponseDTO> RegisterAsync(RegisterUserRequestDTO registerRequest);
    public Task<UserResponseDTO> LoginAsync(LoginUserRequestDTO loginRequest);
    public Task<bool> UpdatePasswordAsync(UpdatePasswordRequest updatePasswordRequest);
    public Task<bool> UpdateProfileAsync(UpdateProfileRequest updateProfileRequest);

}
