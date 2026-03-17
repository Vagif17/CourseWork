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
    
}
