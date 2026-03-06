using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces;

public interface IUserStore
{
    public Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId);
    public Task<string?> GetEmailAsync(string userId);
    public Task<bool> CheckPasswordAsync(string userId, string password);
    public Task<IList<string>> GetRolesAsync(string userId);
    public Task<string> CreateUserAsync(RegisterUserRequestDTO request);
    public Task AddToRoleAsync(string userId, string role);
    public Task UpdatePasswordAsync(UpdatePasswordRequest updatePasswordRequest);
    public Task UpdateProfileAsync(UpdateProfileRequest updateProfileRequest);

}
