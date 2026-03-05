using HW_7.Common;
using HW_7.DTO_s;
using HW_7.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace HW_7.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService userService;
    

    public UserController(IUserService _userService)
    {
        userService = _userService;
    }


    /// <summary>
    /// Register new user.
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserResponseDTO>>> Register([FromBody] RegisterUserRequestDTO registerRequest)
    {
        var result = await userService.RegisterAsync(registerRequest);

        return Ok(
             ApiResponse<UserResponseDTO>
                 .SuccessResponse(result, "User registered successfully")
         );
    }

    /// <summary>
    /// Login for existing user.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<UserResponseDTO>>> Login([FromBody] LoginUserRequestDTO loginRequest)
    {
        var result = await userService.LoginAsync(loginRequest);
        return Ok(
             ApiResponse<UserResponseDTO>
                 .SuccessResponse(result, "Login successfully")
         );
    }


    /// <summary>
    /// Updating existing user password.
    /// </summary>
    [HttpPatch("UpdatePassword")]
    public async Task<ActionResult<ApiResponse<UserResponseDTO>>> UpdatePassword([FromBody] UpdatePasswordRequest updatePasswordRequst )
    {
        var result = await userService.UpdatePasswordAsync(updatePasswordRequst);
        return Ok(
            ApiResponse<UserResponseDTO>.SuccessResponse(
            ));
    }


    /// <summary>
    /// Updating existing user profile.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ApiResponse<UserResponseDTO>>> UpdateProfile([FromBody] UpdateProfileRequest updateProfileRequest)
    {
        var result = await userService.UpdateProfileAsync(updateProfileRequest);
        return Ok(
                    ApiResponse<UserResponseDTO>.SuccessResponse(
                    ));
    }

}

