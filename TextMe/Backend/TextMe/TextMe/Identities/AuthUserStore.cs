using Microsoft.AspNetCore.Identity;
using TextMe.DTOs;
using TextMe.Interfaces;
using TextMe.Models;
using TextMe.Services.Interfaces;
using static System.Net.WebRequestMethods;

namespace TextMe.Identities;

public class AuthUserStore : IAuthUserStore
{

    private readonly UserManager<AppUser> userManager;
    private readonly ICloudinaryService cloudinarySerice;

    public AuthUserStore(UserManager<AppUser> _userManager,ICloudinaryService _cloudinaryService)
    {
        userManager = _userManager;
        cloudinarySerice = _cloudinaryService;
    }

    public async Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId)
    {
        var user =emailOrId.Contains("@")
            ? await userManager.FindByEmailAsync(emailOrId)
            : await userManager.FindByIdAsync(emailOrId);
        return user?.Id;
    }

    

    public async Task<string> CreateUserAsync(RegisterRequestDTO request)
    {
        var avatarUrl = await cloudinarySerice.UploadAvatarAsync(request.AvatarUrl);


        var user = new AppUser
        {
            UserName = request.UserName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null,
            AvatarUrl = avatarUrl,
            

        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException($"User creation failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        return user.Id;
    }


    public async Task<bool> CheckPasswordAsync(string userId, string password)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user != null && await userManager.CheckPasswordAsync(user, password);
    }

    public async Task AddToRoleAsync(string userId, string role)
    {
        await userManager.AddToRoleAsync((await userManager.FindByIdAsync(userId))!, role);
    }


    public async Task<IList<string>> GetRolesAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user is null ? new List<string>() : await userManager.GetRolesAsync(user);
    }

    public async Task<string?> GetEmailAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user?.Email;
    }

    public async Task<string?> GetUserNameAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user?.UserName;
    }

    public async Task<string?> GetAvatarUrlAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        return user?.AvatarUrl;
    }
}
