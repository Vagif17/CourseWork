using Application.Features.Messages.Queries;
using Application.Services.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class MessageController : ControllerBase
    {
        private readonly IMediator mediator;
        private readonly ICloudinaryService cloudinaryService;

        public MessageController(IMediator _mediator, ICloudinaryService _cloudinaryService)
        {
            mediator = _mediator;
            cloudinaryService = _cloudinaryService;
        }

        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatMessages(int chatId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var messages = await mediator.Send(new GetMessagesQuery(chatId, userId));
                return Ok(messages);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPost("upload-media")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMedia([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("Files are required");

            var urls = new List<string>();

            foreach (var file in files)
            {
                using var stream = file.OpenReadStream();

                var dto = new UploadMediaRequestDTO
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    FileStream = stream
                };

                var url = await cloudinaryService.UploadMediaAsync(dto);
                urls.Add(url);
            }

            return Ok(urls);
        }
    }
}
