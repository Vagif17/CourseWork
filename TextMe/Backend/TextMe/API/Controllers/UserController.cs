using Application.DTOs;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IAuthService authService;
    private readonly IAccountRestoreService restoreService;
    public UserController(IAuthService _authService, IAccountRestoreService _restoreService)
    {
        authService = _authService;
        restoreService = _restoreService;
    }


    [HttpPost("register")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<AuthResponseDTO>> Register(
    [FromForm] RegisterRequestDTO requestDTO,
    IFormFile? avatar)
    {
        if (avatar != null && avatar.Length > 0)
        {
            var memoryStream = new MemoryStream();

            await avatar.CopyToAsync(memoryStream);

            memoryStream.Position = 0;

            requestDTO.FileStream = memoryStream;
            requestDTO.FileName = avatar.FileName;
            requestDTO.ContentType = avatar.ContentType;
        }

        var result = await authService.RegisterAsync(requestDTO);

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDTO>> Login([FromBody] LoginRequestDTO requestDTO)
    {
        var result = await authService.LoginAsync(requestDTO);

        return result;
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDTO>> Refresh(RefreshTokenRequestDTO request)
    {
        var result = await authService.RefreshTokenAsync(request);
        return Ok(result);
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke(RefreshTokenRequestDTO request)
    {
        await authService.RevokeRefreshTokenAsync(request);
        return NoContent();
    }


    [HttpPost("recovery/send-code")]
    public async Task<IActionResult> SendRecoveryCode([FromBody] RecoveryRequestDTO request)
    {
        await restoreService.SendRecoveryEmail(request.Email);

        return Ok(new { message = "Recovery code sent" });
    }


    [HttpPost("recovery/verify")]
    public async Task<IActionResult> VerifyCode([FromBody] RecoveryVerifyDTO request)
    {
        var result = await restoreService.VerifyCode(request.Email, request.Code);

        if (!result)
            return BadRequest("Invalid code");

        return Ok("Code verified"); 
    }


    [HttpPost("recovery/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ResetPasswordDTO request)
    {
        var result = await restoreService.ResetPasswordAsync(
            request.Email,
            request.Code,
            request.NewPassword
        );

        if (!result)
            return BadRequest("Invalid code or email");

        return Ok("Password changed");
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ParticipantDTO>>> Search(string query)
    {
        return Ok(await authService.SearchUsersAsync(query));
    }
}
