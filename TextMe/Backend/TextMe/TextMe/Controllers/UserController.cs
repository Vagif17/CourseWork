using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TextMe.DTOs;
using TextMe.Services.Interfaces;

namespace TextMe.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IAuthService authService;

    public UserController(IAuthService _authService)
    {
        authService = _authService;
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
    
}
