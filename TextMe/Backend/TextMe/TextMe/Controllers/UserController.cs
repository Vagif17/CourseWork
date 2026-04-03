using Microsoft.AspNetCore.Mvc;
using TextMe.DTO_S;
using TextMe.DTOs;
using TextMe.Services.Interfaces;

namespace TextMe.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IAuthService authService;
    private readonly IAccountRestoreService accountRestoreService;

    public UserController(
        IAuthService _authService,
        IAccountRestoreService _accountRestoreService)
    {
        authService = _authService;
        accountRestoreService = _accountRestoreService;
    }


    [HttpPost("register")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<AuthResponseDTO>> Register([FromForm] RegisterRequestDTO requestDTO)
    {
        var result = await authService.RegisterAsync(requestDTO);
        return result;
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
        await accountRestoreService.SendRecoveryEmail(request.Email);

        return Ok(new { message = "Recovery code sent" });
    }


    [HttpPost("recovery/verify")]
    public async Task<IActionResult> VerifyCode([FromBody] RecoveryVerifyDTO request)
    {
        var result = await accountRestoreService.VerifyCode(request.Email, request.Code);

        if (!result)
            return BadRequest("Invalid code");

        return Ok("Code verified");
    }


    [HttpPost("recovery/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ResetPasswordDTO request)
    {
        var result = await accountRestoreService.ResetPasswordAsync(
            request.Email,
            request.Code,
            request.NewPassword
        );

        if (!result)
            return BadRequest("Invalid code or email");

        return Ok("Password changed");
    }
}