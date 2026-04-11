using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("api/[controller]")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly IProfileService profileService;

    public ProfileController(IProfileService profileService)
    {
        this.profileService = profileService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponseDTO>> GetMe(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await profileService.GetProfileAsync(userId, cancellationToken);
        return profile == null ? NotFound() : Ok(profile);
    }

    [HttpPut("me")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ProfileUpdateResultDTO>> UpdateMe(
        [FromForm] UpdateProfileRequestDTO request,
        IFormFile? avatar,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        Stream? stream = null;
        try
        {
            if (avatar is { Length: > 0 })
            {
                stream = new MemoryStream();
                await avatar.CopyToAsync(stream, cancellationToken);
                stream.Position = 0;
            }

            var result = await profileService.UpdateProfileAsync(
                userId,
                request,
                stream,
                avatar?.FileName,
                avatar?.ContentType,
                cancellationToken);

            return Ok(result);
        }
        finally
        {
            await (stream?.DisposeAsync() ?? ValueTask.CompletedTask);
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        await profileService.ChangePasswordAsync(userId, request, cancellationToken);
        return NoContent();
    }

    [HttpPut("me/privacy")]
    public async Task<ActionResult<UserProfileResponseDTO>> UpdatePrivacy(
        [FromBody] UpdatePrivacyRequestDTO request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await profileService.UpdatePrivacyAsync(userId, request, cancellationToken);
        return Ok(profile);
    }
}
