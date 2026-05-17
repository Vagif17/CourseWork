using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AIController : ControllerBase
    {
        private readonly IAIService aiService;

        public AIController(IAIService _aiService)
        {
            aiService = _aiService;
        }

        [HttpPost("summary")]
        public async Task<IActionResult> GenerateSummary([FromBody] SummaryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ChatHistory))
                return BadRequest("Chat history is empty.");

            try
            {
                var summary = await aiService.GenerateSummaryAsync(request.ChatHistory);
                return Ok(new { Text = summary });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }


    }

    public class SummaryRequest
    {
        public string ChatHistory { get; set; } = string.Empty;
    }


}
