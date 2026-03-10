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
    public async Task<ActionResult<AuthResponseDTO>> Register([FromForm] RegisterRequestDTO requestDTO)
    {
        var result = await authService.RegisterAsync(requestDTO);

        return result;
    }



}
