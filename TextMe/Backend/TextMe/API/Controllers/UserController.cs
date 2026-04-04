using Application.DTOs;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

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
    
}
