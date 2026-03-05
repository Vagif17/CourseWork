using HW_6.DTO_s;

namespace HW_6.Services.Interfaces;

public interface IUserService
{
    public Task<UserResponseDTO> RegisterAsync(RegisterUserRequestDTO user);
    public Task<UserResponseDTO> LoginAsync(LoginUserRequestDTO user);
    public Task<bool> UpdatePasswordAsync(UpdatePasswordRequest updatePasswordRequest);
    public Task<bool> UpdateProfileAsync(UpdateProfileRequest updateProfileRequest);

}
