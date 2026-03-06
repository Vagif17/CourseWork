using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Identities;

public class UserStore : IUserStore
{
    private readonly UserManager<User> _userManager;

    public UserStore(UserManager<User> userManager)
    {
        _userManager = userManager;
    }
    public async Task<string> CreateUserAsync(RegisterUserRequestDTO request)
    {
        var user = new
            User
        {
            UserName = request.Name,
            Name = request.Name,
            Email = request.Email,
            Address = request.Address,
            PhoneNumber = request.PhoneNumber,
            CreatedAt = DateTime.UtcNow
        }; 

        var result = await _userManager.CreateAsync(user,request.Password);

        if (!result.Succeeded)
            throw new InvalidOperationException($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return user.Id;
    }


    public async Task<bool> CheckPasswordAsync(string userId, string password)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user is not null && await _userManager.CheckPasswordAsync(user, password);
    }


    public async Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId)
    {
        var user = emailOrId.Contains('@')
                    ? await _userManager.FindByEmailAsync(emailOrId)
                    : await _userManager.FindByIdAsync(emailOrId);
        return user?.Id;
    }

    public async Task<string?> GetEmailAsync(string userId)
    {
        var email = await _userManager.FindByIdAsync(userId);
        return email?.Email;
    }

    public async Task<IList<string>> GetRolesAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user is null ? new List<string>() : await _userManager.GetRolesAsync(user);
    }

    public async Task AddToRoleAsync(string userId, string role) =>
        await _userManager.AddToRoleAsync((await _userManager.FindByIdAsync(userId))!, role);

    public async Task UpdatePasswordAsync(UpdatePasswordRequest updatePasswordRequest)
    {
        var user = await _userManager.FindByEmailAsync(updatePasswordRequest.Email);

        await _userManager.ChangePasswordAsync(user, updatePasswordRequest.Password, updatePasswordRequest.NewPassword);
    }

    public async Task UpdateProfileAsync(UpdateProfileRequest updateProfileRequest)
    {
        var user = await _userManager.FindByEmailAsync(updateProfileRequest.Email);

        user.Name = updateProfileRequest.Name;
        user.UserName = updateProfileRequest.Name;
        user.Email = updateProfileRequest.Email;
        user.Address = updateProfileRequest.Address;    
        user.Password = updateProfileRequest.Password;
        
        await _userManager.UpdateAsync(user);

    }
}
