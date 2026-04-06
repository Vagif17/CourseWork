using Application.DTOs;
using Application.Interfaces.Stores;
using Application.Services.Classes;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Stores;

public class UserStore : IUserStore
{

    private readonly UserManager<AppUser> userManager;
    private readonly ICloudinaryService cloudinarySerice;

    public UserStore(UserManager<AppUser> _userManager,ICloudinaryService _cloudinaryService)
    {
        userManager = _userManager;
        cloudinarySerice = _cloudinaryService;
    }

    public async Task<string?> FindUserIdByEmailOrIdAsync(string emailOrId)
    {
        var user = emailOrId.Contains("@")
            ? await userManager.FindByEmailAsync(emailOrId)
            : await userManager.FindByIdAsync(emailOrId);
        return user?.Id;
    }



    public async Task<string> CreateUserAsync(RegisterRequestDTO request)
    {
        var avatarUrl = await cloudinarySerice.UploadAvatarAsync(new UploadMediaRequestDTO
        {
            FileStream = request.FileStream,
            FileName = request.FileName,
            ContentType = request.ContentType
        });

        var user = new AppUser
        {
            UserName = request.UserName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            CreatedAt = DateTime.UtcNow,
            AvatarUrl = avatarUrl
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

    public async Task<string?> FindUserIdByEmailOrPhoneAsync(string emailOrPhone)
    {
        var user = emailOrPhone.Contains("@")
            ? await userManager.FindByEmailAsync(emailOrPhone)
            : await userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == emailOrPhone);

        return user?.Id;
    }

    public async Task<ParticipantDTO?> GetUserByIdAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return null;

        return new ParticipantDTO
        {
            UserId = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl
        };
    }

    public async Task<IEnumerable<UserDTO>> GetUsersByIdsAsync(IEnumerable<string> ids)
    {
        return await userManager.Users
            .Where(u => ids.Contains(u.Id))
            .Select(u => new UserDTO
            {
                Id = u.Id,
                UserName = u.UserName!,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync();
    }
<<<<<<< HEAD
=======
    
>>>>>>> fbbf670c819fdf26415368347ed90557608ea50e
}


